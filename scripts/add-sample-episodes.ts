import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { getWeaviateClient } from '../src/lib/weaviate/client';

async function addSampleEpisodes() {
  console.log('📺 Adding sample episodes with subtitles...');
  
  try {
    const client = getWeaviateClient();

    // First, get all shows to get their IDs
    const showsResult = await client.graphql
      .get()
      .withClassName('Show')
      .withFields('title _additional { id }')
      .withLimit(10)
      .do();

    const shows = showsResult.data.Get.Show;
    
    // Create a map of show titles to their IDs
    const showMap: Record<string, string> = {};
    shows.forEach((show: any) => {
      showMap[show.title] = show._additional.id;
    });

    // Sample episodes with proper RFC3339 dates
    const sampleEpisodes = [
      {
        show_title: 'Friends',
        season_number: 1,
        episode_number: 1,
        title: 'The One Where Monica Gets a Roommate',
        description: 'Monica and the gang introduce Rachel to the real world.',
        subtitle_content: `Monica: There's nothing to tell! He's just some guy I work with!
Ross: Come on, you're going out with the guy! There's gotta be something wrong with him.
Chandler: All right, let's play Bamboozled! We have to guess Monica's date's job.
Joey: Wait, I have an idea. Let's make a list of all the things we think are wrong with him.
Phoebe: Ooh, can I go first? He's left-handed.
Ross: What's wrong with left-handed?
Phoebe: I knew it! You're left-handed too!
Rachel: Wait, what are we doing? We're making a list of his flaws?
Monica: No, we're not. We're going to dinner.`,
        duration: 22,
        air_date: '1994-09-22T00:00:00Z', // Fixed: Added time component
      },
      {
        show_title: 'Friends',
        season_number: 1,
        episode_number: 2,
        title: 'The One with the Sonogram at the End',
        description: 'Ross finds out his ex-wife is pregnant.',
        subtitle_content: `Monica: Hi, welcome to the world of organized drawers.
Rachel: I can't believe you actually color-coded your socks.
Monica: It's not color-coded, it's coordinated by shade.
Rachel: Oh, my God. You're a freak.
Monica: I'm not a freak, I'm organized.
Ross: I'm gonna be a father. I'm gonna be a father. I'm gonna be a father.
Chandler: I'm gonna be a father. I'm gonna be a father. I'm gonna be a father.
Monica: Stop repeating everything he says!
Phoebe: You know, if you want, I could give you the number of my gynecologist.
Ross: What? Why would I need a gynecologist?
Phoebe: Because you're having a baby?`,
        duration: 22,
        air_date: '1994-09-29T00:00:00Z', // Fixed
      },
      {
        show_title: 'The Big Bang Theory',
        season_number: 1,
        episode_number: 1,
        title: 'Pilot',
        description: 'A pair of brilliant physicists meet their new neighbor.',
        subtitle_content: `Leonard: So if a photon is directed through a plane with two slits in it and either slit is observed, it will not go through both slits. If it's unobserved, it will.
Sheldon: Exactly. So, the light can be a particle or a wave, depending on if it's being watched.
Leonard: You want to get pizza?
Sheldon: We can't. We have to wait for the new neighbor.
Leonard: Why do we have to wait?
Sheldon: Because we're going to welcome her with a basket of muffins.
Leonard: We don't have a basket of muffins.
Sheldon: Then what are you bringing?
Leonard: I'm not bringing anything.
Sheldon: Fine, I'll make a basket of muffins.
Leonard: You can't make muffins.
Sheldon: I have a recipe book. How hard can it be?`,
        duration: 22,
        air_date: '2007-09-24T00:00:00Z', // Fixed
      },
      {
        show_title: 'Breaking Bad',
        season_number: 1,
        episode_number: 1,
        title: 'Pilot',
        description: 'A high school chemistry teacher turns to crime.',
        subtitle_content: `Walter: Chemistry is, well technically, chemistry is the study of matter. But I prefer to see it as the study of change.
Student: Is that why you're wearing a gas mask?
Walter: That's a good question. No, the gas mask is because I'm about to create a chemical reaction that will produce a rather unpleasant odor.
Student: Like what?
Walter: Like you'll be smelling it for weeks. Now, if you don't want to smell bad, I suggest you put these on.
Jesse: Yo, Mr. White! Yo, yo, yo, Mr. White!
Walter: Jesse, what are you doing here?
Jesse: I need to talk to you. It's important.
Walter: I'm in the middle of a class.`,
        duration: 58,
        air_date: '2008-01-20T00:00:00Z', // Fixed
      },
    ];

    // Add episodes to Weaviate
    for (const episode of sampleEpisodes) {
      const showId = showMap[episode.show_title];
      
      if (!showId) {
        console.log(`⚠️ Show not found: ${episode.show_title}`);
        continue;
      }

      const { show_title, ...episodeData } = episode;
      
      const result = await client.data
        .creator()
        .withClassName('Episode')
        .withProperties({
          ...episodeData,
          show_id: showId,
        })
        .do();

      console.log(`  ✅ Added: ${episode.show_title} - ${episode.title} (ID: ${result.id})`);
    }

    console.log('🎉 Sample episodes added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addSampleEpisodes();