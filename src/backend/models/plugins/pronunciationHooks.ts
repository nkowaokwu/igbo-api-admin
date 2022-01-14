import mongoose from 'mongoose';
import { compact, last } from 'lodash';
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

/* If the client sent over blob data for pronunciations, it will be uploaded to the AWS S3 */
export const uploadPronunciation = (schema: mongoose.Schema<Interfaces.WordSuggestion>): void => {
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
      await Promise.all(Object.values(this.dialects).map(async ({ dialect, pronunciation }) => {
        if (isCypress && pronunciation) {
          // Going to mock creating and saving audio pronunciation while testing in Cypress (ref. !isCypress check)
          this.dialects[dialect].pronunciation = (
            await createAudioPronunciation(`${id}-${dialect}`, pronunciation)
          );
        } else if (pronunciation.startsWith('data:audio/webm')) {
          this.dialects[dialect].pronunciation = (
            await createAudioPronunciation(`${id}-${dialect}`, pronunciation)
          );
        } else if (!isCypress && isDevelopment && this.dialects[dialect].pronunciation) {
          this.dialects[dialect].pronunciation = (
            await createAudioPronunciation(`${id}-${dialect}`, pronunciation)
          );
        } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}-${dialect}`)) {
          // If the pronunciation data in the current dialect is a uri, we will duplicate the uri
          // so that the new uri will only be associated with the suggestion
          const isMp3 = pronunciation.includes('mp3');
          const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
          const newId = `${id}-${dialect}`;

          /* If we are saving a new word suggestion, then we want to copy all the original audio files */
          this.dialects[dialect].pronunciation = await (this.isNew
            ? copyAudioPronunciation(oldId, newId, isMp3)
            : renameAudioPronunciation(oldId, newId, isMp3));
        }
      }));
    }

    next();
    return this;
  });
};
