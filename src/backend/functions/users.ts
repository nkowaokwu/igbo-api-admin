import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { compact } from 'lodash';
import { UpdatePermissions } from 'src/shared/constants/firestore-types';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { successResponse, errorResponse } from 'src/shared/server-validation';
import { adminEmailList } from 'src/shared/constants/emailList';
import Collections from 'src/shared/constants/Collection';
import cleanDocument from 'src/backend/shared/utils/cleanDocument';
import { sendNewUserNotification, sendUpdatedRoleNotification } from '../controllers/email';
import { incrementTotalUserStat, decrementTotalUserStat } from '../controllers/stats';
import { findUsers } from '../controllers/users';
import { assignUserRole, generateId } from './utils';
import { connectDatabase } from '../utils/database';
import * as Interfaces from '../controllers/utils/interfaces';
import { crowdsourcerSchema } from '../models/Crowdsourcer';
import { referralSchema } from '../models/Referral';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const db = admin.firestore();

/**
 * Creates an associated mongodb User document
 * @param {FirebaseUser['uid']} firebaseId firebase user id
 *
 * @returns Created Crowdsourcer user
 */
export const createMongoUser = async (firebaseId: string): Promise<Partial<Interfaces.Crowdsourcer>> => {
  const characters = `${alphabet}${new Date().valueOf()}`;

  const connection = await connectDatabase();
  const Crowdsourcer = connection.model<Interfaces.Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);
  const crowdsourcer = new Crowdsourcer({
    firebaseId,
    referralCode: generateId(characters),
  });
  const savedCrowdsourcer = await crowdsourcer.save();
  return cleanDocument(savedCrowdsourcer.toJSON());
};

/* Deletes an associated mongodb User and Refferal documents */
export const onDeleteUserAccount = functions.auth.user().onDelete(async (user) => {
  try {
    const connection = await connectDatabase();
    const Crowdsourcer = connection.model<Interfaces.Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);
    const crowdsourcer = await Crowdsourcer.findOneAndDelete({ firebaseId: user.uid });

    const Referral = connection.model<Interfaces.Referral>('Referral', referralSchema);
    await Referral.deleteMany({ $or: [{ referrerId: crowdsourcer.id }, { referredUserId: crowdsourcer.id }] });

    return successResponse({ uid: user.uid });
  } catch (err) {
    return errorResponse(err);
  }
});

/* Creates a user account and assigns the role to 'user' */
export const onCreateUserAccount = functions.auth.user().onCreate(async (user) => {
  try {
    const role = assignUserRole(user);

    await admin.auth().setCustomUserClaims(user.uid, role);
    await sendNewUserNotification({ newUserEmail: user.email });
    await incrementTotalUserStat();
    await createMongoUser(user.uid);

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
    // Update total user stat
    await decrementTotalUserStat();
    return `Successfully deleted user ${user.displayName} with uid of ${user.uid}`;
  } catch (err) {
    return errorResponse(err);
  }
});

/* Updates a users role based permissions */
export const onUpdatePermissions = functions.https.onCall(async (data: UpdatePermissions): Promise<string | Error> => {
  const { email, uid, adminUid, role, displayName } = data;
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

/**
 * Copies existing firebase users to MongoDB
 *
 * @returns {Promise<string>}
 */
export const onCopyFirebaseUsers = async (): Promise<string> => {
  const connection = await connectDatabase();
  const Crowdsourcer = connection.model<Interfaces.Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);

  const firebaseUsers = await findUsers();
  const existingMongoUsers = await Crowdsourcer.find({ firebaseId: { $in: firebaseUsers.map(({ id }) => id) } });

  const newUsers = compact(
    firebaseUsers.map((user) => {
      if (!existingMongoUsers.some(({ id }) => id === user.id)) {
        const characters = `${alphabet}${new Date().valueOf()}`;
        return { firebaseId: user.id, referralCode: generateId(characters) };
      }
      return null;
    }),
  );

  await Crowdsourcer.insertMany(newUsers);
  return Promise.resolve('Successfully copied firebase users');
};
