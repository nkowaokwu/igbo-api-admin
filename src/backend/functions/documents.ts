import * as functions from 'firebase-functions';
import Collections from 'src/shared/constants/Collections';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { findUser } from 'src/backend/controllers/users';
import ActionTypes from 'src/shared/constants/ActionTypes';
import { sendDocumentDeletionRequestNotification, sendDocumentUpdateNotification } from '../controllers/email';

/* Sends email to project admins to see request */
export const onRequestDeleteDocument = functions.https.onCall(async (
  { note, resource, record }:
  {
    note: string,
    resource: Collections,
    record: { id: string, word?: string, igbo?: string, english: string, definitions?: [string] },
  },
  context,
): Promise<Error | { redirect: boolean }> => {
  try {
    await sendDocumentDeletionRequestNotification({
      translator: context.auth.token.name,
      translatorEmail: context.auth.token.email,
      note,
      resource,
      id: record.id,
      word: record.word || record.igbo,
      definition: (record.definitions && record.definitions[0]) || record.english,
    });
    return { redirect: false };
  } catch (err) {
    console.log(err);
    return err;
  }
});

/* sends email to document authors about updates to their suggestions */
export const onUpdateDocument = functions.https.onCall(async (
  { type, resource, record }:
  {
    type: ActionTypes,
    resource: Collections,
    record: Interfaces.WordSuggestion | Interfaces.ExampleSuggestion
  },
  context,
): Promise<Error | { redirect: boolean }> => {
  try {
    // The email will only be sent if non-authors make changes to a suggestion
    let author;
    try {
      author = await findUser(record.author);
    } catch {
      author = null;
    }

    if (author && context.auth.uid !== record.author) {
      await sendDocumentUpdateNotification({
        author: author.displayName,
        to: author.email,
        translator: context.auth.token.name,
        translatorEmail: context.auth.token.email,
        type,
        resource,
        id: record.id,
        word: record.word || record.igbo,
      });
    }
    return { redirect: false };
  } catch (err) {
    console.log(err);
    return err;
  }
});
