import { Response } from 'express';
import { omit } from 'lodash';
import {
  SENDGRID_API_KEY,
  MERGED_SUGGESTION_TEMPLATE,
  REJECTED_SUGGESTION_TEMPLATE,
  MERGED_STATS_TEMPLATE,
  SUGGESTIONS_REVIEW_REMINDER_TEMPLATE,
  NEW_USER_NOTIFICATION_TEMPLATE,
  UPDATED_ROLE_NOTIFICATION,
  DOCUMENT_DELETION_REQUEST_NOTIFICATION,
  DOCUMENT_UPDATE_NOTIFICATION,
  REPORT_USER_NOTIFICATION,
  AUDIO_PRONUNCIATION_DELETION_NOTIFICATION,
  MEMBER_INVITE,
  MEMBER_ACCEPTED_INVITE,
  DATASET_EXPORT,
} from 'src/backend/config';
import constructMessage from 'src/backend/controllers/email/utils/constructMessage';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { findAdminUserEmails } from '../users';
import * as Interfaces from '../utils/interfaces';

const sgMail = process.env.NODE_ENV !== 'build' ? require('@sendgrid/mail') : {};

if (sgMail) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/* Wrapper around SendGrid function to handle errors */
export const sendEmail = (message: Interfaces.ConstructedMessage): Promise<void> =>
  process.env.NODE_ENV !== 'test'
    ? sgMail
        .send(message)
        // console.log('Email successfully sent.');
        .then(() => true)
        .catch((err) => {
          console.trace('sendEmail error:', err.response?.body || err.message);
          if (process.env.NODE_ENV !== 'production') {
            return Promise.resolve(err.response?.body || err.message);
          }
          throw err;
        })
    : (async () => {
        if (!message.to || !message.to.length) {
          throw new Error("'to' field must be defined");
        }
        // console.log('Email successfully sent.');
        return Promise.resolve(true);
      })();

/* Email sent when an editor clicks the approve button */
export const sendApprovedEmail = (data): Promise<void> => {
  const message = constructMessage(data);
  return sendEmail(message);
};

/* Email sent when an editor clicks the deny button */
export const sendDeniedEmail = (data): Promise<void> => {
  const message = constructMessage(data);
  return sendEmail(message);
};

/* Email sent when suggestion gets merged */
export const sendMergedEmail = (data: Interfaces.MergedOrRejectedEmailData): Promise<void> => {
  if (data.origin !== SuggestionSourceEnum.COMMUNITY) {
    return Promise.resolve();
  }

  const message = constructMessage({
    to: data.to,
    templateId: MERGED_SUGGESTION_TEMPLATE,
    dynamic_template_data: omit(
      {
        ...data,
        wordClass: data?.definitions?.[0]?.wordClass,
        definitions: data?.definitions?.[0]?.definitions?.join(', '),
      },
      ['to'],
    ),
  });
  return sendEmail(message);
};

/* Email sent when a suggestion has been deleted without getting merged */
export const sendRejectedEmail = (data: Interfaces.MergedOrRejectedEmailData): Promise<void> => {
  if (data.origin !== SuggestionSourceEnum.COMMUNITY) {
    return Promise.resolve();
  }
  const message = constructMessage({
    to: data.to,
    templateId: REJECTED_SUGGESTION_TEMPLATE,
    dynamic_template_data: omit(
      {
        ...data,
        wordClass: data?.definitions?.[0]?.wordClass,
        definitions: data?.definitions?.[0]?.definitions?.join(', '),
      },
      ['to'],
    ),
  });
  return sendEmail(message);
};

/* Email sent every week to editors, mergers, and admins */
export const sendMergedStats = (data: Interfaces.MergedOrRejectedEmailData): Promise<void> => {
  const message = constructMessage({
    to: data.to,
    templateId: MERGED_STATS_TEMPLATE,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

// TODO: LEGACY
/* Email editors, mergers, and admins to remind them about remaining suggestions */
export const sendSuggestionsReminder = async (data: Interfaces.SuggestionsReminderData): Promise<void> => {
  const message = constructMessage({
    to: data.to,
    templateId: SUGGESTIONS_REVIEW_REMINDER_TEMPLATE,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

/* Emails admins about new user accounts */
export const sendNewUserNotification = async (data: Interfaces.NewUserData): Promise<void> => {
  const adminEmails = (await findAdminUserEmails()) as [string];
  const message = constructMessage({
    to: adminEmails,
    templateId: NEW_USER_NOTIFICATION_TEMPLATE,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendUpdatedRoleNotification = async (data: Interfaces.UpdatedRoleNotificationData): Promise<void> => {
  const message = constructMessage({
    to: data.to,
    templateId: UPDATED_ROLE_NOTIFICATION,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendDocumentDeletionRequestNotification = async (
  data: Interfaces.DocumentDeletionRequestNotification,
): Promise<void> => {
  const adminEmails = (await findAdminUserEmails()) as [string];
  const message = constructMessage({
    to: adminEmails,
    templateId: DOCUMENT_DELETION_REQUEST_NOTIFICATION,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendDocumentUpdateNotification = async (data: Interfaces.DocumentUpdateNotification): Promise<void> => {
  const adminEmails = (await findAdminUserEmails()) as [string];
  const message = constructMessage({
    to: adminEmails.concat(data.to),
    templateId: DOCUMENT_UPDATE_NOTIFICATION,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendReportUserNotification = async (
  req: Interfaces.EditorRequest,
  res: Response,
): Promise<Response<any>> => {
  const { body } = req;
  const adminEmails = (await findAdminUserEmails()) as [string];
  const message = constructMessage({
    to: adminEmails,
    templateId: REPORT_USER_NOTIFICATION,
    dynamic_template_data: body,
  });
  await sendEmail(message);
  return res.send({ message: 'success' });
};

export const sendAudioPronunciationDeletionNotification = async (
  data: Interfaces.AudioPronunciationDeletionNotification,
): Promise<void> => {
  const message = constructMessage({
    to: [data.to],
    templateId: AUDIO_PRONUNCIATION_DELETION_NOTIFICATION,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendMemberInvite = async (data: Interfaces.MemberInvite): Promise<void> => {
  const message = constructMessage({
    to: [data.to],
    templateId: MEMBER_INVITE,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendMemberAcceptedInviteAdmin = async (data: Interfaces.MemberAcceptedInvite): Promise<void> => {
  const message = constructMessage({
    to: data.to,
    templateId: MEMBER_ACCEPTED_INVITE,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};

export const sendExportedDataset = async (data: Interfaces.ExportedData): Promise<void> => {
  const message = constructMessage({
    to: [data.to],
    templateId: DATASET_EXPORT,
    dynamic_template_data: omit(data, ['to']),
  });
  return sendEmail(message);
};
