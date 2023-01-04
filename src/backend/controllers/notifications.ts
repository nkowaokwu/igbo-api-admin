import { NextFunction, Response } from 'express';
import admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/v1/https';
import { omit, pick } from 'lodash';
import moment from 'moment';
import { User } from 'firebase/auth';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import Views from 'src/shared/constants/Views';
import Collections from 'src/shared/constants/Collections';
import { handleQueries } from './utils';

const db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true,
});
/* Enables paginating through all available notifications for a user */
export const getNotifications = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { user } = req;
    const { skip, limit } = handleQueries(req);
    const dbUserNotificationsRef = db.collection(`${Collections.USERS}/${user.uid}/${Collections.NOTIFICATIONS}`);
    const dbUserNotificationsWindowRef = db
      .collection(`${Collections.USERS}/${user.uid}/${Collections.NOTIFICATIONS}`)
      .orderBy('created_at', 'desc');

    const paginatedNotifications = (await dbUserNotificationsWindowRef.get())
      .docs.map((doc) => {
        const docData = doc.data();
        docData.id = docData.created_at;
        return docData;
      }).slice(skip, skip + limit - 1);
    const totalNotifications = (await dbUserNotificationsRef.get()).docs;
    res.setHeader('Content-Range', totalNotifications.length);
    return res
      .status(200)
      .send(paginatedNotifications);
  } catch (err) {
    return next(new Error('An error occurred while grabbing notification'));
  };
};

export const getNotification = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { user, params: { id } } = req;
    const dbUserNotificationRef = db.collection(
      `${Collections.USERS}/${user.uid}/${Collections.NOTIFICATIONS}`,
    ).doc(id);

    const notification = await dbUserNotificationRef.get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data();
        }
        return null;
      });

    return res
      .status(200)
      .send({ ...notification, id });
  } catch (err) {
    return next(new Error('An error occurred while grabbing notification'));
  };
};

export const postNotification = async ({
  data,
  author,
  context,
} : {
  data: {
    type: string,
    resource: Collections,
    record: Interfaces.WordSuggestion | Interfaces.ExampleSuggestion,
    includeEditors: boolean,
  },
  author: User,
  context: CallableContext,
}): Promise<any | void> => {
  const { includeEditors, record, resource } = data;

  let to;
  try {
    if (includeEditors) {
      // Will notify anyone who is the author, has denied, approved, or edited the suggestion
      // Excluding the notification initiator
      to = Array.from(new Set([record.authorId]
        .concat(record.denials || [])
        .concat(record.approvals || [])
        .concat(record.userInteractions || [])))
        .filter((uid) => uid !== context.auth.uid);
    } else {
      to = author.uid !== context.auth.uid ? [author.uid] : [];
    }

    if (!to?.length) {
      console.warn('There are no recipients');
      return null;
    }
    const link = `#/${resource}/${record.id}/${Views.SHOW}`;
    const notificationData: Omit<Interfaces.Notification, 'recipient'> = {
      type: data.type,
      initiator: pick(author, ['displayName', 'email', 'photoURL', 'uid']),
      title: `${author.displayName || 'Platform'} has a new ${data.type} update for ${link}`,
      message: record.editorsNotes || '',
      data: JSON.stringify(omit(data, ['includeEditors'])),
      link,
      opened: false,
    };

    await Promise.all(to.map(async (recipient) => {
      const dbNotificationsRef = db.collection(`${Collections.USERS}/${recipient}/${Collections.NOTIFICATIONS}`);
      const timestamp = moment().unix();
      const newNotification = { ...notificationData, recipient, created_at: timestamp };
      await dbNotificationsRef.doc(`${timestamp}`).set(newNotification);
    }));

    console.log('Sent in platform notification to the following', to);
    return `Saved ${to.length} ${to.length === 1 ? 'Notification' : 'Notifications'} `;
  } catch (err) {
    console.warn('Unable to create notification', err);
    return null;
  }
};

export const deleteNotification = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { user, params: { id } } = req;
    const dbNotificationsRef = db.collection(`${Collections.USERS}/${user.uid}/${Collections.NOTIFICATIONS}`);
    await dbNotificationsRef.doc(id).delete();
    return res
      .status(200)
      .send({ id });
  } catch (err) {
    return next(err);
  }
};
