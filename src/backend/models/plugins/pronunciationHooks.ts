import mongoose from 'mongoose';
import { compact, last, kebabCase } from 'lodash';
import * as functions from 'firebase-functions';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
} from '../../controllers/utils/AWS-API';
import * as Interfaces from '../../controllers/utils/interfaces';

const config = functions.config();
const isCypress = config?.runtime?.env === 'cypress';
const isDevelopment = config?.runtime?.env === 'development';

/* If the client sent over blob data for pronunciations, it will be uploaded to AWS S3 */
export const uploadWordPronunciation = (schema: mongoose.Schema<Interfaces.WordSuggestion>): void => {
  schema.pre('save', async function (next) {
    if (!this.skipPronunciationHook) {
      // @ts-ignore
      const id = (this._id || this.id).toString();

      if (isCypress && this.pronunciation) {
      // Going to mock creating and saving audio pronunciation while testing in Cypress
        this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
      } else if (this.pronunciation.startsWith('data:audio/webm')) {
        this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
      } else if (!isCypress && isDevelopment && this.pronunciation) {
        this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
      } else if (this.pronunciation.startsWith('https://') && !this.pronunciation.includes(`${id}.`)) {
        // If the pronunciation data for the headword is a uri, we will duplicate the uri
        // so that the new uri will only be associated with the suggestion
        const isMp3 = this.pronunciation.includes('mp3');
        const oldId: string = last(compact(this.pronunciation.split(/.mp3|.webm/).join('').split('/')));
        const newId: string = id;

        /* If we are saving a new word suggestion, then we want to copy all the original audio files */
        this.pronunciation = await (this.isNew
          ? copyAudioPronunciation(oldId, newId, isMp3)
          : renameAudioPronunciation(oldId, newId, isMp3));
      }
      /**
       * Steps through each dialect and checks to see if it has audio data to be saved in AWS
       */
      await Promise.all(Object.entries(this.dialects).map(async ([rawDialectalWord, { pronunciation }]) => {
        /**
         * Since dialectal words, which include spaces are used as the unique keys for these audio files,
         * the spaces need to be replaced with dashes (-) to avoid any unexpected escaped character edge cases.
         */
        const dialectalWord = kebabCase(rawDialectalWord);
        if (isCypress && pronunciation) {
          // Going to mock creating and saving audio pronunciation while testing in Cypress (ref. !isCypress check)
          this.dialects[rawDialectalWord].pronunciation = (
            await createAudioPronunciation(`${id}-${dialectalWord}`, pronunciation)
          );
        } else if (pronunciation.startsWith('data:audio/webm')) {
          this.dialects[rawDialectalWord].pronunciation = (
            await createAudioPronunciation(`${id}-${dialectalWord}`, pronunciation)
          );
        } else if (!isCypress && isDevelopment && this.dialects[rawDialectalWord].pronunciation) {
          this.dialects[rawDialectalWord].pronunciation = (
            await createAudioPronunciation(`${id}-${dialectalWord}`, pronunciation)
          );
        } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}-${dialectalWord}`)) {
          // If the pronunciation data in the current dialect is a uri, we will duplicate the uri
          // so that the new uri will only be associated with the suggestion
          const isMp3 = pronunciation.includes('mp3');
          const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
          const newId = `${id}-${dialectalWord}`;

          /* If we are saving a new word suggestion, then we want to copy all the original audio files */
          this.dialects[rawDialectalWord].pronunciation = await (this.isNew
            ? copyAudioPronunciation(oldId, newId, isMp3)
            : renameAudioPronunciation(oldId, newId, isMp3));
        }
      }));
    }

    next();
    return this;
  });
};

/* If the client sent over blob data for pronunciation, it will b e uploaded to AWS S3 */
export const uploadExamplePronunciation = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): void => {
  schema.pre('save', async function (next) {
    if (!this.skipPronunciationHook) {
      const id = (this._id || this.id).toString();

      if (isCypress && this.pronunciation) {
      // Going to mock creating and saving audio pronunciation while testing in Cypress
        this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
      } else if (this.pronunciation.startsWith('data:audio/webm')) {
        this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
      } else if (!isCypress && isDevelopment && this.pronunciation) {
        this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
      } else if (this.pronunciation.startsWith('https://') && !this.pronunciation.includes(`${id}.`)) {
        // If the pronunciation data for the headword is a uri, we will duplicate the uri
        // so that the new uri will only be associated with the suggestion
        const isMp3 = this.pronunciation.includes('mp3');
        const oldId: string = last(compact(this.pronunciation.split(/.mp3|.webm/).join('').split('/')));
        const newId: string = id;

        /* If we are saving a new word suggestion, then we want to copy all the original audio files */
        this.pronunciation = await (this.isNew
          ? copyAudioPronunciation(oldId, newId, isMp3)
          : renameAudioPronunciation(oldId, newId, isMp3));
      }
    }

    next();
    return this;
  });
};
