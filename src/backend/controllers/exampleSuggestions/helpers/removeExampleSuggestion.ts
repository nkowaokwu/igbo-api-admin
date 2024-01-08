import { Connection } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { sendRejectedEmail } from 'src/backend/controllers/email';
import { findUser } from 'src/backend/controllers/users';
import SuggestionTypeEnum from 'src/backend/shared/constants/SuggestionTypeEnum';

/**
 * Deletes the current Example Suggestion
 * @param id
 * @param mongooseConnection
 * @returns Delete confirmation message
 */
export const removeExampleSuggestion = (
  id: string,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.findByIdAndDelete(id)
    .then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error('No example suggestion exists with the provided id.');
      }
      // console.log('Error with finding user while deleting example sentence', err);
      const { email: userEmail } = ((await findUser(exampleSuggestion.authorId).catch(() => ({
        email: '',
      }))) as Interfaces.FormattedUser) || { email: '' };
      /* Sends rejection email to user if they provided an email and the exampleSuggestion isn't merged */
      if (userEmail && !exampleSuggestion.merged) {
        sendRejectedEmail({
          to: [userEmail],
          suggestionType: SuggestionTypeEnum.WORD,
          ...exampleSuggestion.toObject(),
        });
      }
      return exampleSuggestion;
    })
    .catch(() => {
      // console.log('Unable to delete example suggestion', err);
      throw new Error('An error has occurred while deleting and return a single example suggestion');
    });
};

export default removeExampleSuggestion;
