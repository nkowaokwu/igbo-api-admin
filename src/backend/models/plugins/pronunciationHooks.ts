import mongoose from 'mongoose';
import { compact, last, kebabCase } from 'lodash';
import * as functions from 'firebase-functions';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
} from 'src/backend/controllers/utils/AWS-API';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import removeAccents from 'src/backend/utils/removeAccents';

const config = functions.config();
const isCypress = config?.runtime?.env === 'cypress';
const isDevelopment = config?.runtime?.env === 'development';

/* If the client sent over blob data for pronunciations, it will be uploaded to AWS S3 */
export const uploadWordPronunciation = (schema: mongoose.Schema<Interfaces.WordSuggestion>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        // @ts-ignore
        const id = (this._id || this.id).toString();

        await Promise.all(this.pronunciation.map(async (pronunciation, index) => {
          if (isCypress && this.pronunciation[index]) {
          // Going to mock creating and saving audio pronunciation while testing in Cypress
            this.pronunciation[index] = await createAudioPronunciation(id, pronunciation);
          } else if (pronunciation.startsWith('data:audio/mp3')) {
            this.pronunciation[index] = await createAudioPronunciation(id, pronunciation);
          } else if (!isCypress && isDevelopment && pronunciation) {
            this.pronunciation[index] = await createAudioPronunciation(id, pronunciation);
          } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}.`)) {
            // If the pronunciation data for the headword is a uri, we will duplicate the uri
            // so that the new uri will only be associated with the suggestion
            const isMp3 = pronunciation.includes('mp3');
            const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
            const newId: string = id;

            /* If we are saving a new word suggestion, then we want to copy all the original audio files */
            this.pronunciation = await (this.isNew
              ? copyAudioPronunciation(oldId, newId, isMp3)
              : renameAudioPronunciation(oldId, newId, isMp3));
          }
        }));
        /**
         * Steps through each dialect and checks to see if it has audio data to be saved in AWS
         */
        await Promise.all(Object.entries(this.dialects)
          .map(async ([rawDialectalWord, { pronunciation: pronunciations }]) => {
            /**
             * Since dialectal words, which include spaces are used as the unique keys for these audio files,
             * the spaces need to be replaced with dashes (-) to avoid any unexpected escaped character edge cases.
             */
            const dialectalWord = removeAccents.remove(kebabCase(rawDialectalWord));
            // If the dialect doesn't exist in the document, the create a fallback object
            if (!this.dialects[rawDialectalWord]) {
              this.dialects[rawDialectalWord] = {
                dialects: [],
                variations: [],
                pronunciation: [],
              };
            }
            await Promise.all(pronunciations.map(async (pronunciation, index) => {
              if (isCypress && pronunciation) {
                // Going to mock creating and saving audio 
                // pronunciation while testing in Cypress (ref. !isCypress check)
                this.dialects[rawDialectalWord].pronunciation[index] = (
                  await createAudioPronunciation(`${id}-${dialectalWord}`, pronunciation)
                );
              } else if (pronunciation.startsWith('data:audio/mp3')) {
                this.dialects[rawDialectalWord].pronunciation[index] = (
                  await createAudioPronunciation(`${id}-${dialectalWord}`, pronunciation)
                );
              } else if (!isCypress && isDevelopment && this.dialects[rawDialectalWord].pronunciation) {
                this.dialects[rawDialectalWord].pronunciation[index] = (
                  await createAudioPronunciation(`${id}-${dialectalWord}`, pronunciation)
                );
              } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}-${dialectalWord}`)) {
                // If the pronunciation data in the current dialect is a uri, we will duplicate the uri
                // so that the new uri will only be associated with the suggestion
                const isMp3 = pronunciation.includes('mp3');
                const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
                const newId = `${id}-${dialectalWord}`;

                /* If we are saving a new word suggestion, then we want to copy all the original audio files */
                this.dialects[rawDialectalWord].pronunciation[index] = await (this.isNew
                  ? copyAudioPronunciation(oldId, newId, isMp3)
                  : renameAudioPronunciation(oldId, newId, isMp3));
              }
            }));
          }));
      }
      next();
      return this;
    } catch (err) {
      console.log('Error caught in pre save Word shcema hook', err.message);
      this.invalidate('pronunciation', err.message);
      return null;
    }
  });
};

/* If the client sent over blob data for pronunciation, it will b e uploaded to AWS S3 */
export const uploadExamplePronunciation = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        const id = (this._id || this.id).toString();

        await Promise.all(this.pronunciation.map(async (pronunciation, index) => {
          if (isCypress && pronunciation) {
          // Going to mock creating and saving audio pronunciation while testing in Cypress
            this.pronunciation[index] = await createAudioPronunciation(id, pronunciation);
          } else if (pronunciation.startsWith('data:audio/mp3')) {
            this.pronunciation[index] = await createAudioPronunciation(id, pronunciation);
          } else if (!isCypress && isDevelopment && pronunciation) {
            this.pronunciation[index] = await createAudioPronunciation(id, pronunciation);
          } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}.`)) {
            // If the pronunciation data for the headword is a uri, we will duplicate the uri
            // so that the new uri will only be associated with the suggestion
            const isMp3 = pronunciation.includes('mp3');
            const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
            const newId: string = id;

            /* If we are saving a new word suggestion, then we want to copy all the original audio files */
            this.pronunciation[index] = await (this.isNew
              ? copyAudioPronunciation(oldId, newId, isMp3)
              : renameAudioPronunciation(oldId, newId, isMp3));
          }
        }));
      }

      next();
      return this;
    } catch (err) {
      console.log('Error caught in pre save Example shcema hook', err.message);
      this.invalidate('pronunciation', err.message);
      return null;
    }
  });
};
