import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { compact, last } from 'lodash';
import {
  copyAudioPronunciation,
  renameAudioPronunciation,
  createAudioPronunciation,
  deleteAudioPronunciation,
} from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { PronunciationSchema } from 'src/backend/controllers/utils/interfaces';

/**
 * Parses out the Key in the URI an determines if it's an mp3 or not
 */
const getOldPronunciationId = (audio: string) => {
  const isMp3 = audio.includes('mp3');
  const oldId: string = last(
    compact(
      audio
        .split(/.mp3|.webm/)
        .join('')
        .split('/'),
    ),
  );
  return { isMp3, oldId };
};

/* Helper function to handle deleting audio files */
const handleDeletingAudio = (pronunciations: PronunciationSchema[]) => {
  pronunciations.map(async (pronunciation) => {
    const { isMp3, oldId } = getOldPronunciationId(pronunciation.audio);
    await deleteAudioPronunciation(oldId, isMp3);
  });
};

/* Helper function to handle uploading audio files */
const handleUploadingAudio = async (
  id: string,
  // Incoming document about to by saved. We want to edit this document to save.
  incomingPronunciations: PronunciationSchema[],
  currentPronunciations: PronunciationSchema[],
  isNew: boolean,
) => {
  const deletedAudioPronunciations = currentPronunciations.length > incomingPronunciations.length;
  // Handle deleting audio pronunciations
  if (deletedAudioPronunciations) {
    const deletedPronunciations = currentPronunciations.filter(
      (pronunciation) => !incomingPronunciations.find(({ _id }) => pronunciation._id === _id),
    );
    await Promise.all(
      deletedPronunciations.map(async (pronunciation) => {
        if (pronunciation.audio.startsWith('https://')) {
          const { isMp3, oldId } = getOldPronunciationId(pronunciation.audio);
          await deleteAudioPronunciation(oldId, isMp3);
        }

        // If the audio pronunciation is a base64 string, we don't have to do anything
      }),
    );
  }

  // After deleting current audio pronunciations, now handle the incoming pronunciations
  return incomingPronunciations.map(async (_, index) => {
    const newId = `${id}-${uuidv4()}`;

    if (
      incomingPronunciations[index].audio?.startsWith('data:audio/mp3') &&
      !currentPronunciations[index]?.audio?.startsWith('https://')
    ) {
      // Create a new audio pronunciation if a previous pronunciation doesn't exist in the same spot
      incomingPronunciations[index].audio = await createAudioPronunciation(newId, incomingPronunciations[index].audio);
    } else if (
      incomingPronunciations[index].audio?.startsWith('data:audio/mp3') &&
      currentPronunciations[index]?.audio?.startsWith('https://')
    ) {
      // Update contents of existing audio pronunciation if the UI provides a new base64
      const { isMp3, oldId } = getOldPronunciationId(currentPronunciations[index].audio);
      await deleteAudioPronunciation(oldId, isMp3);
      incomingPronunciations[index].audio = await createAudioPronunciation(newId, incomingPronunciations[index].audio);
    } else if (
      incomingPronunciations[index].audio.startsWith('https://') &&
      !incomingPronunciations[index].audio.includes(`${id}`)
    ) {
      // When merging or moving documents, new Ids will be introduced. But these Ids
      // need to match with their audio pronunciation uris.
      const { isMp3, oldId } = getOldPronunciationId(incomingPronunciations[index].audio);

      /* If we are saving a new word suggestion, then we want to copy all the original audio files */
      incomingPronunciations[index].audio = await (isNew
        ? copyAudioPronunciation(oldId, newId, isMp3)
        : renameAudioPronunciation(oldId, newId, isMp3));
    }
  });
};

/* If the client sent over blob data for pronunciation, it will be uploaded to AWS S3 */
export const uploadExamplePronunciation = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): any => {
  schema.pre('save', async function (next) {
    try {
      const id = (this._id || this.id).toString();
      const currentDocument = this.isNew
        ? { source: { pronunciations: [] }, translations: [] }
        : await this.model().findById(this.id);

      await Promise.all(
        await handleUploadingAudio(id, this.source.pronunciations, currentDocument.source.pronunciations, this.isNew),
      );
      await Promise.all(
        this.translations.map(async ({ pronunciations }, index) =>
          Promise.all(
            await handleUploadingAudio(
              id,
              pronunciations,
              currentDocument.translations[index]?.pronunciations || [],
              this.isNew,
            ),
          ),
        ),
      );

      return next();
    } catch (err) {
      this.invalidate('source.pronunciations', err.message);
      return null;
    }
  });
};

export const removeAudioPronunciations = (schema: mongoose.Schema<Interfaces.ExampleSuggestion>): any => {
  schema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], async function (next) {
    try {
      const ExampleSuggestion = mongoose.model('ExampleSuggestion', schema);
      const deletedExampleSuggestions = await ExampleSuggestion.find(this.getFilter());

      await Promise.all(
        deletedExampleSuggestions.map(async (exampleSuggestion) => {
          await handleDeletingAudio(exampleSuggestion.source.pronunciations);
          await Promise.all(
            exampleSuggestion.translations.map((translation) => handleDeletingAudio(translation.pronunciations)),
          );
        }),
      );
      next();
      return await this;
    } catch (err) {
      console.log('Unable to delete Example Suggestion audio pronunciations', err);
      this.invalidate('source.pronunciations', err.message);
      return null;
    }
  });
};
