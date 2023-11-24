import { Connection } from 'mongoose';
import { assign, omit } from 'lodash';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import handleExampleSuggestionAudioPronunciations from 'src/backend/controllers/utils/handleExampleSuggestionAudioPronunciations';

/**
 * Helper function that updates an Example Suggestion
 * @param param0
 * @returns Updated Example Suggestion
 */
const updateExampleSuggestion = ({
  id,
  data: clientData,
  mongooseConnection,
}: {
  id: string;
  data: Partial<Interfaces.ExampleClientData>;
  mongooseConnection: Connection;
}): Promise<(Interfaces.ExampleSuggestion & Omit<Partial<Interfaces.ExampleClientData>, 'crowdsourcing'>) | void> => {
  const data = assign(clientData);
  delete data.authorId;
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  const exampleSuggestion = ExampleSuggestion.findById(id).then(
    async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error("Example suggestion doesn't exist");
      }
      if (exampleSuggestion.merged) {
        throw new Error('Unable to edit a merged example suggestion');
      }

      await handleExampleSuggestionAudioPronunciations({ exampleSuggestion, data });

      // Properly handle merging
      Object.entries(data?.crowdsourcing || {}).forEach(([key, value]) => {
        exampleSuggestion.crowdsourcing[key] = value;
      });
      const updatedExampleSuggestion = assign(exampleSuggestion, omit(data, ['crowdsourcing']));

      // Updates the user interactions to include the current user
      const updatedUserInteractions = new Set(
        updatedExampleSuggestion.userInteractions.concat(data?.userInteractions || []),
      );
      updatedExampleSuggestion.userInteractions = Array.from(updatedUserInteractions);

      exampleSuggestion.markModified('crowdsourcing');
      return updatedExampleSuggestion.save();
    },
  );

  return exampleSuggestion;
};

export default updateExampleSuggestion;
