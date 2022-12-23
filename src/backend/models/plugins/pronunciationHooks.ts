import mongoose from 'mongoose';
import { compact, last, kebabCase } from 'lodash';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
} from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import { isCypress, isProduction } from 'src/backend/config';
import { createMedia, copyMedia, renameMedia } from 'src/backend/controllers/utils/MediaAPIs/CorpusMediaAPI';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import removeAccents from 'src/backend/utils/removeAccents';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';

/* If the client sent over blob data for pronunciations, it will be uploaded to AWS S3 */
export const uploadWordPronunciation = (schema: mongoose.Schema<Interfaces.WordSuggestion>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        // @ts-ignore
        const id = (this._id || this.id).toString();

        if (isCypress && this.pronunciation) {
        // Going to mock creating and saving audio pronunciation while testing in Cypress
          this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
        } else if (this.pronunciation.startsWith('data:audio/mp3')) {
          this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
        } else if (!isCypress && !isProduction && this.pronunciation) {
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
        await Promise.all(this.dialects.map(async ({ pronunciation, word: rawDialectalWord, _id: dialectalWordId }) => {
          /**
           * Since dialectal words, which include spaces are used as the unique keys for these audio files,
           * the spaces need to be replaced with dashes (-) to avoid any unexpected escaped character edge cases.
           */
          const dialectalWord = removeAccents.remove(kebabCase(rawDialectalWord));
          if (!this.dialects[rawDialectalWord]) {
            this.dialects[rawDialectalWord] = {
              dialects: [],
              variations: [],
              pronunciation: '',
            };
          }
          if (isCypress && pronunciation) {
            // Going to mock creating and saving audio pronunciation while testing in Cypress (ref. !isCypress check)
            this.dialects[rawDialectalWord].pronunciation = (
              await createAudioPronunciation(`${id}-${dialectalWordId}`, pronunciation)
            );
          } else if (pronunciation.startsWith('data:audio/mp3')) {
            this.dialects[rawDialectalWord].pronunciation = (
              await createAudioPronunciation(`${id}-${dialectalWordId}`, pronunciation)
            );
          } else if (!isCypress && !isProduction && this.dialects[rawDialectalWord].pronunciation) {
            this.dialects[rawDialectalWord].pronunciation = (
              await createAudioPronunciation(`${id}-${dialectalWordId}`, pronunciation)
            );
          } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}-${dialectalWordId}`)) {
            // If the pronunciation data in the current dialect is a uri, we will duplicate the uri
            // so that the new uri will only be associated with the suggestion
            const isMp3 = pronunciation.includes('mp3');
            const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
            const newWordId = `${id}-${dialectalWord}`;
            const newId = `${id}-${dialectalWordId}`;

            /* If we are saving a new word suggestion, then we want to copy all the original audio files */
            this.dialects[rawDialectalWord].pronunciation = await (this.isNew
              ? (() => {
                copyAudioPronunciation(oldId, newId, isMp3);
                copyAudioPronunciation(oldId, newWordId, isMp3);
              })()
              : (() => {
                renameAudioPronunciation(oldId, newId, isMp3);
                renameAudioPronunciation(oldId, newWordId, isMp3);
              })());
          }
        }));
      }
      next();
      return this;
    } catch (err) {
      console.log('Error caught in pre save Word schema hook', err.message);
      this.invalidate('pronunciation', err.message);
      return null;
    }
  });
};

/* If the client sent over blob data for pronunciation, it will be uploaded to AWS S3 */
export const uploadExamplePronunciation = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        const id = (this._id || this.id).toString();

        if (isCypress && this.pronunciation) {
        // Going to mock creating and saving audio pronunciation while testing in Cypress
          this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
        } else if (this.pronunciation.startsWith('data:audio/mp3')) {
          this.pronunciation = await createAudioPronunciation(id, this.pronunciation);
        } else if (!isCypress && !isProduction && this.pronunciation) {
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
    } catch (err) {
      console.log('Error caught in pre save Example schema hook', err.message);
      this.invalidate('pronunciation', err.message);
      return null;
    }
  });
};

/* If the client sent over blob data for media, it will be uploaded to AWS S3 */
export const uploadCorpusPronunciation = (schema: mongoose.Schema<Interfaces.Corpus>): void => {
  schema.pre('save', async function (next) {
    try {
      if (!this.skipPronunciationHook) {
        // @ts-ignore
        const id = (this._id || this.id).toString();

        if (isCypress && this.media) {
        // Going to mock creating and saving audio pronunciation while testing in Cypress
          this.media = await createMedia(id, this.media);
        } else if (this.media.startsWith('data:')) {
          this.media = await createMedia(id, this.media);
        } else if (!isCypress && !isProduction && this.media) {
          this.media = await createMedia(id, this.media);
        } else if (this.media.startsWith('https://') && !this.media.includes(`${id}.`)) {
          // If the pronunciation data for the headword is a uri, we will duplicate the uri
          // so that the new uri will only be associated with the suggestion
          const extensions = Object.values(MediaTypes).map((extension) => `.${extension}`);
          const oldId: string = last(compact(this.media.split(new RegExp(extensions.join('|'))).join('').split('/')));
          const newId: string = id;

          /* If we are saving a new corpus suggestion, then we want to copy all the original media files */
          this.media = await (this.isNew
            ? copyMedia(oldId, newId)
            : renameMedia(oldId, newId));
        }
      }
      next();
      return this;
    } catch (err) {
      console.log('Error caught in pre save Corpus schema hook', err.message);
      this.invalidate('media', err.message);
      return null;
    }
  });
};
