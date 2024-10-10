import * as functions from 'firebase-functions/v1';
import { get } from 'lodash';
import Collections from 'src/shared/constants/Collection';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { findUser } from 'src/backend/controllers/users';
import ActionTypes from 'src/shared/constants/ActionTypes';
import { sendDocumentDeletionRequestNotification } from '../controllers/email';
import { postNotification } from '../controllers/notifications';

/* Sends email to project admins to see request */
export const onRequestDeleteDocument = functions.https.onCall(
  async (
    {
      note,
      resource,
      record,
    }: {
      note: string;
      resource: Collections;
      record: {
        id: string;
        word?: string;
        source?: { text: string };
        translations: { text: string }[];
        definitions?: [string];
      };
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
        word: record.word || record.source?.text,
        definition: get(record, 'definitions[0].definitions[0]') || record.translations?.[0]?.text,
      });
      return { redirect: false };
    } catch (err) {
      // console.log(err);
      return err;
    }
  },
);

/**
 * Sends a notification email to associated editors
 * If the includeEditors flag is on, then all editors who approved or denied, along with
 * the author, will be notified
 */
export const onUpdateDocument = functions.https.onCall(
  async (
    {
      type,
      resource,
      record,
      includeEditors,
    }: {
      type: ActionTypes;
      resource: Collections;
      record: Interfaces.WordSuggestion | Interfaces.ExampleSuggestion;
      includeEditors: boolean;
    },
    context,
  ): Promise<Error | { redirect: boolean }> => {
    try {
      // The email will only be sent if non-authors make changes to a suggestion
      let to;
      let author;
      try {
        author = await findUser(record.authorId);
        if (includeEditors) {
          // Will notify anyone who is the author, has denied, approved, or edited the suggestion
          // Excluding the notification initiator
          const editorIds = Array.from(
            new Set(
              [record.authorId]
                .concat(record.denials || [])
                .concat(record.approvals || [])
                .concat(record.userInteractions || []),
            ),
          ).filter((uid) => uid !== context.auth.uid);
          to = await Promise.all(
            editorIds.map(async (editorId) => {
              const editor = await findUser(editorId);
              return typeof editor === 'string' ? editor : editor.email;
            }),
          );
        } else {
          to = author.email;
        }
      } catch {
        author = null;
      }

      if (to?.length) {
        await postNotification({
          data: {
            type,
            resource,
            record,
            includeEditors,
          },
          author,
          context,
        });
        // Skipping sending emails to save on SendGrid API costs
        // await sendDocumentUpdateNotification({
        //   author: author.displayName,
        //   to,
        //   translator: context.auth.token.name,
        //   translatorEmail: context.auth.token.email,
        //   type,
        //   resource,
        //   id: record.id,
        //   word: record.word || record.igbo,
        //   editorsNotes: record.editorsNotes,
        // });
      } else {
        // console.log('No one to send to:', to);
      }
      return { redirect: false };
    } catch (err) {
      // console.log(err);
      return err;
    }
  },
);
