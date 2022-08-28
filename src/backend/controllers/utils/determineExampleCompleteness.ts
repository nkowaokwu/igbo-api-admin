import axios from 'axios';
import { compact } from 'lodash';
import { Record } from 'react-admin';
import { Word } from 'src/backend/controllers/utils/interfaces';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

export default async (record: Word | Record) : Promise<{
  sufficientExampleRequirements: string[],
  completeExampleRequirements: string[],
}> => {
  const {
    associatedWords,
    style,
    pronunciation,
    igbo,
    english,
    meaning,
  } = record;

  const isAudioAvailable = await new Promise((resolve) => {
    axios.get(pronunciation)
      .then(() => resolve(true))
      .catch(() => {
        if (pronunciation?.startsWith?.('https://igbo-api-test-local/')) {
          return resolve(true);
        }
        return resolve(false);
      });
  });

  const sufficientExampleRequirements = compact([
    !igbo && 'Igbo is needed',
    !english && 'English is needed',
    !associatedWords.length && 'At least one associated word is needed',
  ]);

  const completeExampleRequirements = compact([
    ...sufficientExampleRequirements,
    (!pronunciation || !isAudioAvailable) && 'An audio pronunciation is needed',
    style === ExampleStyle.PROVERB && !meaning && 'Meaning is required for proverb',
  ]);

  return {
    sufficientExampleRequirements,
    completeExampleRequirements,
  };
};
