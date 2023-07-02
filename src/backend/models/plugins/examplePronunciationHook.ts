import mongoose from 'mongoose';
import { ulid } from 'ulid'
import { compact, last } from 'lodash';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
} from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import { isCypress, isAWSProduction } from 'src/backend/config';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/* If the client sent over blob data for pronunciation, it will be uploaded to AWS S3 */
export const uploadExamplePronunciation = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        const id = (this._id || this.id).toString();

        await Promise.all(this.pronunciations.map(async (pronunciation: { audio: string, speaker: string }, index) => {
          const newId = `${id}-${ulid()}`;
          if (
            // Going to mock creating and saving audio pronunciation while testing in Cypress
            (isCypress && this.pronunciations[index].audio)
            || this.pronunciations[index].audio.startsWith('data:audio/mp3')
            || (!isCypress && !isAWSProduction && this.pronunciations[index].audio)
          ) {
            this.pronunciations[index].audio = await createAudioPronunciation(newId, this.pronunciations[index].audio);
          } else if (
            this.pronunciations[index].audio.startsWith('https://')
            && !this.pronunciations[index].audio.includes(`${id}.`)
          ) {
            // If the pronunciation data for the headword is a uri, we will duplicate the uri
            // so that the new uri will only be associated with the suggestion
            const isMp3 = this.pronunciations[index].audio.includes('mp3');
            const oldId: string = last(
              compact(this.pronunciations[index].audio.split(/.mp3|.webm/).join('').split('/')),
            );

            /* If we are saving a new word suggestion, then we want to copy all the original audio files */
            this.pronunciations[index].audio = await (this.isNew
              ? copyAudioPronunciation(oldId, newId, isMp3)
              : renameAudioPronunciation(oldId, newId, isMp3));
          }
        }));
      }

      next();
      return this;
    } catch (err) {
      console.log('Error caught in pre save Example schema hook', err.message);
      this.invalidate('pronunciation', err.message);
      return null;
    }
  });
};
