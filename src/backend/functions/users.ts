import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UpdatePermissions } from '../../shared/constants/firestore-types';
import { Role } from '../../shared/constants/auth-types';
import { successResponse, errorResponse } from '../../shared/server-validation';
import { adminEmailList, prodAdminEmailList } from '../../shared/constants/emailList';
import { canAssignEditingGroupNumber } from './utils';
import { sendNewUserNotification, sendUpdatedRoleNotification } from '../controllers/email';

/* Creates a user account and assigns the role to 'user' */
export const onCreateUserAccount = functions.https.onCall(async (user) => {
  try {
    const role = {
      role: process.env.NODE_ENV === 'production' && prodAdminEmailList.includes(user.email)
        ? Role.ADMIN
        : process.env.NODE_ENV === 'production' && !prodAdminEmailList.includes(user.email)
          ? Role.USER
          : process.env.NODE_ENV !== 'production' && adminEmailList.includes(user.email)
            ? Role.ADMIN
            : Role.USER,
    };
    await admin.auth().setCustomUserClaims(user.uid, role);
    await sendNewUserNotification({ newUserEmail: user.email });
    return successResponse({ uid: user.uid });
  } catch (err) {
    return errorResponse(err);
  }
});

/* Assigns an editor to a segment of GenericWords */
export const onAssignUserToEditingGroup = functions.https
  .onCall(async (data: { groupNumber: string, uid: string }, context) => {
    try {
      if (!context?.auth?.uid) {
        return new functions.https.HttpsError('unavailable', '', 'User is not logged in');
      }
      const { uid } = data;
      const groupNumber = parseInt(data.groupNumber, 10);
      const user = await admin.auth().getUser(context.auth.uid);
      const { role } = user.customClaims;
      if (role === Role.ADMIN) {
        const editorUser = await admin.auth().getUser(uid);
        const { customClaims } = editorUser;
        if (canAssignEditingGroupNumber(customClaims.role, groupNumber)) {
          await admin.auth().setCustomUserClaims(uid, { ...customClaims, editingGroup: groupNumber });
          return Promise.resolve(`Successfully assigned editor ${uid} into group ${groupNumber}`);
        }
        return new functions.https.HttpsError(
          'invalid-argument',
          '',
          'Unable to assign editing group numbers to non-editors',
        );
      }
      return new functions.https.HttpsError('unavailable', '', 'User doesn\'t have the right permission');
    } catch (err) {
      return errorResponse(err);
    }
  });

/* Updates a users role based permissions */
export const onUpdatePermissions = functions.https.onCall(async (data: UpdatePermissions): Promise<string | Error> => {
  const {
    email,
    uid,
    adminUid,
    role,
    displayName,
  } = data;
  const adminUser = await admin.auth().getUser(adminUid);

  if (adminUser.customClaims.role !== Role.ADMIN && !adminEmailList.includes(adminUser.email)) {
    return new functions.https.HttpsError('unauthenticated', '', 'Unauthorized to make a permissions change');
  }

  await admin.auth().setCustomUserClaims(uid, { role });
  try {
    await sendUpdatedRoleNotification({ to: [email], role, displayName });
  } catch (err) {
    console.trace(err);
    console.log('Unable to send update role notification email');
  }
  return Promise.resolve(`Updated user ${uid} permissions to ${role}`);
});
