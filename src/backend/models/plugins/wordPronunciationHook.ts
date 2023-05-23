import mongoose from 'mongoose';
import { compact, last, kebabCase } from 'lodash';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
} from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import { isCypress, isAWSProduction } from 'src/backend/config';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import removeAccents from 'src/backend/utils/removeAccents';

/* If the client sent over blob data for pronunciations, it will be uploaded to AWS S3 */
export const uploadWordPronunciation = (schema: mongoose.Schema<Interfaces.WordSuggestion>): void => {
  schema.pre('save', async function (next) {
    if (this.isNew) {
      console.log('Creating a brand new word suggestion document with the author Id of:', this.authorId);
    }
    try {
      if (!this.skipPronunciationHook) {
        // @ts-ignore
        const id = (this._id || this.id).toString();

        if (
          // Going to mock creating and saving audio pronunciation while testing in Cypress
          (isCypress && this.pronunciation)
          || this.pronunciation.startsWith('data:audio/mp3')
          || (!isCypress && !isAWSProduction && this.pronunciation)
        ) {
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
        await Promise.all(this.dialects.map(async ({
          pronunciation,
          word: rawDialectalWord,
          _id: dialectalWordId,
        }, index) => {
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
          if (
            // Going to mock creating and saving audio pronunciation while testing in Cypress (ref. !isCypress check)
            (isCypress && pronunciation)
            || pronunciation.startsWith('data:audio/mp3')
            || (!isCypress && !isAWSProduction && this.dialects[rawDialectalWord].pronunciation)
          ) {
            this.dialects[index].pronunciation = (
              await createAudioPronunciation(`${id}-${dialectalWordId}`, pronunciation)
            );
          } else if (pronunciation.startsWith('https://') && !pronunciation.includes(`${id}-${dialectalWordId}`)) {
            // If the pronunciation data in the current dialect is a uri, we will duplicate the uri
            // so that the new uri will only be associated with the suggestion
            const isMp3 = pronunciation.includes('mp3');
            const oldId: string = last(compact(pronunciation.split(/.mp3|.webm/).join('').split('/')));
            const newId = `${id}-${dialectalWordId}`;
            const newWordId = `${id}-${dialectalWord}`;

            /* *
             * If we are saving a new word suggestion that comes from an existing word document,
             * then we want to copy all the original audio files into the word suggestion
             * */
            this.dialects[index].pronunciation = await (this.isNew
              ? (() => {
                copyAudioPronunciation(oldId, newWordId, isMp3);
                return copyAudioPronunciation(oldId, newId, isMp3);
              })()
              : (() => {
                renameAudioPronunciation(oldId, newWordId, isMp3)
                  .catch((err) => {
                    console.log('First renameAudioPronunciation in pre save word suggestion hook', err.message);
                    throw err;
                  });
                return renameAudioPronunciation(oldId, newId, isMp3)
                  .catch((err) => {
                    console.log('Second renameAudioPronunciation in pre save word suggestion hook', err.message);
                    throw err;
                  });
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
