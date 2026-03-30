/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearnerProfile {
  name: string;
  level: Level;
  nativeLanguage: string;
  goal: string;
  topic: string;
}

export const DEFAULT_PROFILE: LearnerProfile = {
  name: '',
  level: 'Beginner',
  nativeLanguage: '',
  goal: '',
  topic: 'Daily Life',
};
