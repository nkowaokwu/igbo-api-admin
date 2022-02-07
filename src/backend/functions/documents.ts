import * as functions from 'firebase-functions';
import { sendDocumentDeletionRequestNotification } from '../controllers/email';

/* Sends email to project admins to see request */
export const onRequestDeleteDocument = functions.https.onCall(async (
  { note, resource, record }:
  {
    note: string,
    resource: string,
    record: { id: string, word: string, definitions: [string] },
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
      word: record.word,
      definition: record.definitions[0],
    });
    return { redirect: false };
  } catch (err) {
    console.log(err);
    return err;
  }
});
