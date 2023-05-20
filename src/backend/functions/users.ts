import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UpdatePermissions } from 'src/shared/constants/firestore-types';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { successResponse, errorResponse } from 'src/shared/server-validation';
import { adminEmailList } from 'src/shared/constants/emailList';
import Collections from 'src/shared/constants/Collections';
import { sendNewUserNotification, sendUpdatedRoleNotification } from '../controllers/email';
import { assignUserRole } from './utils';

const db = admin.firestore();
/* Creates a user account and assigns the role to 'user' */
export const onCreateUserAccount = functions.auth.user().onCreate(async (user) => {
  try {
    const role = assignUserRole(user);

    await admin.auth().setCustomUserClaims(user.uid, role);
    await sendNewUserNotification({ newUserEmail: user.email });

    return successResponse({ uid: user.uid });
  } catch (err) {
    return errorResponse(err);
  }
});

/* Helper function to delete nested collection data */
const deleteQueryBatch = async (query, resolve) => {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
};

const deleteCollection = (collectionPath, batchSize = 100000) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
};

/* Deletes the specified user */
export const onDeleteUser = functions.https.onCall(async (user: UpdatePermissions) => {
  try {
    // Delete all associated user data
    await deleteCollection(`${Collections.USERS}/${user.uid}/${Collections.NOTIFICATIONS}`);
    // Delete top-level user data
    await db.collection(`${Collections.USERS}`).doc(user.uid).delete();
    // Delete user
    await admin.auth().deleteUser(user.uid);
    return `Successfully deleted user ${user.displayName} with uid of ${user.uid}`;
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

  if (adminUser.customClaims.role !== UserRoles.ADMIN && !adminEmailList.includes(adminUser.email)) {
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
