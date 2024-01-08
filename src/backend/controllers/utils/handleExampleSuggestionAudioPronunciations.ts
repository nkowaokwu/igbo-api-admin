import { isPronunciationMp3, getPronunciationId } from 'src/backend/shared/utils/splitAudioUrl';
import { ExampleSuggestion, ExampleClientData } from './interfaces';
import { deleteAudioPronunciation } from './MediaAPIs/AudioAPI';

const handleExampleSuggestionAudioPronunciations = async ({
  exampleSuggestion,
  data,
}: {
  exampleSuggestion: ExampleSuggestion;
  data: Partial<ExampleClientData>;
}): Promise<void> => {
  if (!data?.pronunciations || !data?.pronunciations?.length) {
    return;
  }
  // Handle deleting audio pronunciations that lived on the older version
  // of the current example suggestion
  if (exampleSuggestion.pronunciations.length > data.pronunciations.length) {
    const deletePronunciations = exampleSuggestion.pronunciations.filter(
      ({ audio }) => !data.pronunciations.find(({ audio: dataPronunciation }) => audio && dataPronunciation === audio),
    );

    // Delete the old audio pronunciations
    if (deletePronunciations.length) {
      // console.log('Deleting the following example suggestions audio:', deletePronunciations);
      await Promise.all(
        deletePronunciations.map(async ({ audio: deleteAudio }) => {
          const isAudioMp3 = isPronunciationMp3(deleteAudio);
          const pronunciationId = getPronunciationId(deleteAudio);
          await deleteAudioPronunciation(pronunciationId, isAudioMp3);
        }),
      );
    }
  }
};

export default handleExampleSuggestionAudioPronunciations;
