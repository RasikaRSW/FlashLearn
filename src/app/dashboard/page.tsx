'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  BookOpen, Clock, Target, TrendingUp, Calendar, Star,
  Brain, AlertCircle, Award, BarChart, Clock3, Zap,
  TrendingDown, TrendingUp as TrendUp, Activity
} from 'lucide-react';
import { getDueReviews } from '@/lib/utils/spacedRepetition';

interface FlashcardDetails {
  id: string;
  word: string;
  context_sentence: string;
  definition: string;
  part_of_speech: string;
  difficulty: string;
  cefr_level: string;
}

interface SavedFlashcard {
  id: string;
  flashcard_id: string;
  user_id: string;
  personal_notes?: string;
  difficulty_rating?: number;
  is_bookmarked: boolean;
  created_at: string;
  next_review_date?: string;
  repetitions?: number;
  ease_factor?: number;
  interval_days?: number;
  flashcard_details?: FlashcardDetails;
}

interface ApiResponse {
  savedCards: SavedFlashcard[];
  error?: string;
  details?: string;
}

interface AdvancedStats {
  cardStatus: {
    new: number;
    learning: number;
    mastered: number;
  };
  dueCards: Array<{
    id: string;
    flashcard_id: string;
    daysUntilDue: number;
    reason: string;
    flashcard_details?: {
      word: string;
      part_of_speech: string;
    };
  }>;
  performanceMetrics: {
    totalReviews: number;
    recentReviews: number;
    averageRating: number;
    averageResponseTime: number;
    performanceByRating: Record<number, number>;
  };
  posPerformance: Array<{
    part_of_speech: string;
    averageRating: number;
    reviewCount: number;
  }>;
  learningCurve: Array<{
    reviewNumber: number;
    rating: number;
    date: string;
  }>;
  retentionRate: {
    remembered: number;
    forgotten: number;
  };
  improvedCards: Array<{
    word: string;
    firstRating: number;
    lastRating: number;
    improvement: number;
  }>;
  weakCards: Array<{
    word: string;
    avgRating: number;
    reviewCount: number;
  }>;
  nextReviewForecast: Array<{
    date: string;
    cardsDue: number;
    day: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCards: 0,
    dueReviews: 0,
    masteredCards: 0,
    streak: 0,
    weeklyProgress: 0,
  });
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [recentCards, setRecentCards] = useState<SavedFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching saved flashcards...');

        // Fetch user's saved flashcards
        const savedResponse = await fetch('/api/flashcards/saved');
        
        if (!savedResponse.ok) {
          const errorData = await savedResponse.json();
          console.error('API error:', errorData);
          throw new Error(errorData.error || errorData.details || 'Failed to fetch stats');
        }

        const savedData: ApiResponse = await savedResponse.json();
        console.log('Saved cards response:', savedData);
        
        if (!savedData.savedCards) {
          throw new Error('Invalid response format: missing savedCards');
        }

        // Fetch advanced stats
        const advancedResponse = await fetch('/api/stats/advanced');
        let advancedData = null;
        
        if (advancedResponse.ok) {
          advancedData = await advancedResponse.json();
          setAdvancedStats(advancedData);
        } else {
          console.log('Advanced stats not available yet');
        }

        // Calculate basic stats
        // Calculate due reviews manually to ensure null dates are included
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const dueCount = savedData.savedCards.filter((card: SavedFlashcard) => {
          // If no next_review_date, it's a new card - should be due
          if (!card.next_review_date) return true;
          
          // Check if next_review_date is today or earlier
          const nextReview = new Date(card.next_review_date);
          return nextReview <= endOfDay;
        }).length;
        const mastered = savedData.savedCards.filter((card: SavedFlashcard) => 
          card.repetitions && card.repetitions >= 3
        ).length;

        // Calculate streak
        let streak = 0;
        if (savedData.savedCards.length > 0) {
          const reviewDates = savedData.savedCards
            .filter((card: SavedFlashcard) => card.next_review_date)
            .map((card: SavedFlashcard) => new Date(card.next_review_date!).toDateString());
          
          const creationDates = savedData.savedCards.map((card: SavedFlashcard) => 
            new Date(card.created_at).toDateString()
          );
          
          const allDates = [...new Set([...reviewDates, ...creationDates])].sort();
          
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          if (allDates.includes(today) || allDates.includes(yesterday)) {
            streak = 1;
            let currentDate = new Date();
            for (let i = 1; i < 365; i++) {
              currentDate.setDate(currentDate.getDate() - 1);
              if (allDates.includes(currentDate.toDateString())) {
                streak++;
              } else {
                break;
              }
            }
          }
        }

        setStats({
          totalCards: savedData.savedCards.length,
          dueReviews: dueCount,
          masteredCards: mastered,
          streak: streak,
          weeklyProgress: Math.min(100, Math.round((mastered / (savedData.savedCards.length || 1)) * 100)),
        });

        setRecentCards(savedData.savedCards.slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllStats();
    }
  }, [user]);

  const statCards = [
    {
      title: 'Total Cards',
      value: stats.totalCards,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Due for Review',
      value: stats.dueReviews,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Mastered',
      value: stats.masteredCards,
      icon: Target,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Day Streak',
      value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Learner'}!
        </h1>
        <p className="text-gray-600 mt-2">
          {stats.dueReviews > 0 
            ? `You have ${stats.dueReviews} card${stats.dueReviews !== 1 ? 's' : ''} waiting for review. Keep up the great work!`
            : stats.totalCards > 0 
              ? 'All caught up! Ready to learn something new?'
              : 'Start by exploring shows and generating flashcards!'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bar */}
      {stats.totalCards > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Mastery Progress</span>
              <span className="text-sm font-medium text-gray-900">{stats.weeklyProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${stats.weeklyProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spaced Repetition Explanation Card */}
      {stats.totalCards > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Brain className="w-12 h-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How Spaced Repetition Works
                </h3>
                <p className="text-gray-700 mb-3">
                  Based on your performance, we schedule reviews at optimal intervals:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="font-medium text-red-600 mb-2">If you struggle (1-2 rating):</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Card resets to "learning" state</li>
                      <li>• Next review: <span className="font-medium">tomorrow</span></li>
                      <li>• Ease factor decreases slightly</li>
                    </ul>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="font-medium text-green-600 mb-2">If you succeed (3-5 rating):</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Card progresses: 1d → 6d → 1m+ intervals</li>
                      <li>• Ease factor increases</li>
                      <li>• After 3 successes, card is "mastered"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Status Distribution */}
      {advancedStats?.cardStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Card Status Distribution</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">New (Not Reviewed)</span>
                  <span className="text-sm font-medium text-gray-900">{advancedStats.cardStatus.new}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(advancedStats.cardStatus.new / stats.totalCards) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Learning (In Progress)</span>
                  <span className="text-sm font-medium text-gray-900">{advancedStats.cardStatus.learning}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(advancedStats.cardStatus.learning / stats.totalCards) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Mastered</span>
                  <span className="text-sm font-medium text-gray-900">{advancedStats.cardStatus.mastered}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(advancedStats.cardStatus.mastered / stats.totalCards) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Cards with Explanations */}
      {advancedStats?.dueCards && advancedStats.dueCards.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock3 className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Why These Cards Are Due</h3>
              </div>
              <Link href="/flashcards/review">
                <Button size="sm">Review Now</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {advancedStats.dueCards.slice(0, 5).map((card) => (
                <div key={card.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {card.flashcard_details?.word || 'Flashcard'}
                    </p>
                    <p className="text-sm text-gray-600">{card.reason}</p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    card.daysUntilDue === 0 ? 'bg-yellow-100 text-yellow-700' :
                    card.daysUntilDue < 0 ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {card.daysUntilDue === 0 ? 'Due today' : 
                     card.daysUntilDue < 0 ? `${Math.abs(card.daysUntilDue)} days overdue` :
                     `Due in ${card.daysUntilDue} days`}
                  </span>
                </div>
              ))}
              {advancedStats.dueCards.length > 5 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  +{advancedStats.dueCards.length - 5} more cards due
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Forecast */}
      {advancedStats?.nextReviewForecast && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Upcoming Reviews</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {advancedStats.nextReviewForecast.map((day) => (
                <div key={day.date} className="text-center">
                  <p className="text-sm font-medium text-gray-600">{day.day}</p>
                  <p className={`text-lg font-bold ${
                    day.cardsDue > 0 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {day.cardsDue}
                  </p>
                  <p className="text-xs text-gray-500">cards</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {advancedStats?.performanceMetrics && advancedStats.performanceMetrics.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {advancedStats.performanceMetrics.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Average Rating (out of 5)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(advancedStats.performanceMetrics.averageResponseTime / 1000)}s
                </p>
                <p className="text-sm text-gray-600">Average Response Time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {advancedStats.performanceMetrics.recentReviews}
                </p>
                <p className="text-sm text-gray-600">Reviews This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance by Part of Speech */}
      {advancedStats?.posPerformance && advancedStats.posPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Performance by Part of Speech</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advancedStats.posPerformance.map((pos) => (
                <div key={pos.part_of_speech}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {pos.part_of_speech} ({pos.reviewCount} reviews)
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {pos.averageRating.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        pos.averageRating >= 4 ? 'bg-green-500' :
                        pos.averageRating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(pos.averageRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Improved & Weak Areas */}
      {advancedStats && (advancedStats.improvedCards.length > 0 || advancedStats.weakCards.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Most Improved Cards */}
          {advancedStats.improvedCards.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendUp className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Most Improved</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advancedStats.improvedCards.map((card) => (
                    <div key={card.word} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <span className="font-medium text-gray-900">{card.word}</span>
                      <span className="text-sm text-green-600">
                        {card.firstRating.toFixed(1)} → {card.lastRating.toFixed(1)} (+{card.improvement})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weak Areas */}
          {advancedStats.weakCards.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold">Need More Practice</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advancedStats.weakCards.map((card) => (
                    <div key={card.word} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <span className="font-medium text-gray-900">{card.word}</span>
                      <span className="text-sm text-red-600">
                        Avg {card.avgRating.toFixed(1)}/5 ({card.reviewCount} reviews)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Retention Rate */}
      {advancedStats?.retentionRate && advancedStats.retentionRate.remembered + advancedStats.retentionRate.forgotten > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Retention Rate</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round((advancedStats.retentionRate.remembered / 
                    (advancedStats.retentionRate.remembered + advancedStats.retentionRate.forgotten)) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Remembered</p>
                <p className="text-xs text-gray-500">{advancedStats.retentionRate.remembered} reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {Math.round((advancedStats.retentionRate.forgotten / 
                    (advancedStats.retentionRate.remembered + advancedStats.retentionRate.forgotten)) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Forgotten</p>
                <p className="text-xs text-gray-500">{advancedStats.retentionRate.forgotten} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Ready to Review?</h3>
            <p className="text-sm text-gray-600">
              {stats.dueReviews > 0 
                ? `You have ${stats.dueReviews} card${stats.dueReviews !== 1 ? 's' : ''} waiting for review`
                : stats.totalCards > 0
                  ? 'No cards due for review right now'
                  : 'Start building your flashcard collection'}
            </p>
          </CardHeader>
          <CardContent>
            <Link href={stats.dueReviews > 0 ? "/flashcards/review" : "/shows"}>
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                {stats.dueReviews > 0 ? 'Start Review Session' : 'Find New Flashcards'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Explore New Content</h3>
            <p className="text-sm text-gray-600">
              Generate new flashcards from your favorite shows
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/shows">
              <Button variant="outline" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Shows
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Flashcards */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Flashcards</h3>
        </CardHeader>
        <CardContent>
          {recentCards.length > 0 ? (
            <div className="space-y-4">
              {recentCards.map((card: SavedFlashcard) => (
                <div key={card.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {card.flashcard_details?.word || 'Flashcard'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Added {new Date(card.created_at).toLocaleDateString()}
                      {card.next_review_date && ` • Next review: ${new Date(card.next_review_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {card.is_bookmarked && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      card.flashcard_details?.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      card.flashcard_details?.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {card.flashcard_details?.difficulty || 'beginner'}
                    </span>
                    {card.repetitions && card.repetitions >= 3 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        Mastered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No flashcards yet. Start by exploring shows and generating flashcards!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}