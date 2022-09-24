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

/**
 * Sends a notification email to associated editors
 * If the includeEditors flag is on, then all editors who approved or denied, along with
 * the author, will be notified
 */
export const onUpdateDocument = functions.https.onCall(async (
  {
    type,
    resource,
    record,
    includeEditors,
  }:
  {
    type: ActionTypes,
    resource: Collections,
    record: Interfaces.WordSuggestion | Interfaces.ExampleSuggestion,
    includeEditors: boolean,
  },
  context,
): Promise<Error | { redirect: boolean }> => {
  try {
    // The email will only be sent if non-authors make changes to a suggestion
    let to;
    let author;
    try {
      if (includeEditors) {
        // Will notify anyone who is the author, has denied, approved, or edited the suggestion
        // Excluding the notification initiator
        const editorIds = Array.from(new Set([record.authorId]
          .concat(record.denials || [])
          .concat(record.approvals || [])
          .concat(record.userInteractions || [])))
          .filter((uid) => uid !== context.auth.uid);
        author = await findUser(record.authorId);
        to = await Promise.all(editorIds.map(async (editorId) => {
          const editor = await findUser(editorId);
          return typeof editor === 'string' ? editor : editor.email;
        }));
      } else {
        author = await findUser(record.authorId);
        to = author.email;
      }
    } catch {
      author = null;
    }

    if (to.length) {
      await sendDocumentUpdateNotification({
        author: author.displayName,
        to,
        translator: context.auth.token.name,
        translatorEmail: context.auth.token.email,
        type,
        resource,
        id: record.id,
        word: record.word || record.igbo,
        editorsNotes: record.editorsNotes,
      });
    }
    return { redirect: false };
  } catch (err) {
    console.log(err);
    return err;
  }
});
