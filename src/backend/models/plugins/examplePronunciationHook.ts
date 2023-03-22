import { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { compact, last } from 'lodash';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
} from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import { isCypress, isAWSProduction } from 'src/backend/config';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/* If the client sent over blob data for pronunciation, it will be uploaded to AWS S3 */
export const uploadExamplePronunciation = (schema: Schema<Interfaces.ExampleSuggestion>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        const id = (this._id || this.id).toString();

        this.pronunciations = await Promise.all(this.pronunciations.map(async (pronunciation) => {
          const updatedPronunciation = pronunciation.toJSON();
          if (
            // Going to mock creating and saving audio pronunciation while testing in Cypress
            (isCypress && updatedPronunciation.audio)
            || updatedPronunciation.audio.startsWith('data:audio/mp3')
            || (!isCypress && !isAWSProduction && updatedPronunciation.audio)
          ) {
            updatedPronunciation.audio = (
              await createAudioPronunciation(`${id}-${updatedPronunciation._id}`, updatedPronunciation.audio)
            );
          } else if (
            updatedPronunciation.audio.startsWith('https://') && !updatedPronunciation.audio.includes(`${id}`)
          ) {
            // If the pronunciation data for the headword is a uri, we will duplicate the uri
            // so that the new uri will only be associated with the suggestion
            const isMp3 = updatedPronunciation.audio.includes('mp3');
            const oldId: string = last(compact(updatedPronunciation.audio.split(/.mp3|.webm/).join('').split('/')));
            const newId = `${id}-${uuidv4()}`;

            /* If we are saving a new word suggestion, then we want to copy all the original audio files */
            updatedPronunciation.audio = await (this.isNew
              ? copyAudioPronunciation(oldId, newId, isMp3)
              : renameAudioPronunciation(oldId, newId, isMp3));
          }
          return updatedPronunciation;
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

// TODO: handle logic of deleting example pronunciations
// TODO: make sure that recording and resetting audio for example suggestions still works in WordEditForm
// TODO: make sure that recording and resetting audio for word suggestions still works in WordEditForm
// TODO: make sure that existing audio is loaded correctly for examples in WordEditForm
// TODO: make sure that headword audio and dialectal variations still exist and can be reset and recorded
// TODO: update example show view with multiple audio
// TODO: update word show view with multiple audio for examples
// TODO: update word panel to show multiple example sentences
// TODO: update Igbo Soundbox logic to handle adding multiple audio
// TODO: make sure that word suggestions are getting resolved within example suggestions
// TODO: make sure that no data is lost when updating an example suggestion with resolvable data (related terms, word stems, and associated words)
// TODO: make sure that combining words works for stems, relatedTerms, variations, example sentences