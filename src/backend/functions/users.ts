import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { compact } from 'lodash';
import { UpdatePermissions } from 'src/shared/constants/firestore-types';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { successResponse, errorResponse } from 'src/shared/server-validation';
import Collections from 'src/shared/constants/Collection';
import { isProduction, IGBO_API_PROJECT_ID } from 'src/backend/config';
import { postUserProjectPermissionHelper } from 'src/backend/controllers/userProjectPermissions';
import Author from 'src/backend/shared/constants/Author';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import { sendNewUserNotification } from '../controllers/email';
import { incrementTotalUserStat, decrementTotalUserStat } from '../controllers/stats';
import { findUsers } from '../controllers/users';
import { assignUserRole, generateId } from './utils';
import { connectDatabase } from '../utils/database';
import * as Interfaces from '../controllers/utils/interfaces';
import { crowdsourcerSchema } from '../models/Crowdsourcer';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const db = admin.firestore();

/**
 * Determines the desired user role while developing based on the email
 * @param email
 * @returns UserRole
 */
const determineUserRoleFromEmail = (email: string) =>
  email.startsWith(UserRoles.ADMIN)
    ? UserRoles.ADMIN
    : email.startsWith(UserRoles.MERGER)
    ? UserRoles.MERGER
    : email.startsWith(UserRoles.NSIBIDI_MERGER)
    ? UserRoles.NSIBIDI_MERGER
    : email.startsWith(UserRoles.EDITOR)
    ? UserRoles.EDITOR
    : email.startsWith(UserRoles.TRANSCRIBER)
    ? UserRoles.TRANSCRIBER
    : email.startsWith(UserRoles.CROWDSOURCER)
    ? UserRoles.CROWDSOURCER
    : email.startsWith(UserRoles.USER)
    ? UserRoles.USER
    : UserRoles.CROWDSOURCER;

/**
 *
 * @param param0
 * @returns Creates a UserProjectPermission for the Igbo API default project
 */
const handleCreateDefaultUserProjectPermission = async ({
  firebaseId,
  email,
}: {
  firebaseId: string;
  email: string;
}): Promise<void> => {
  if (isProduction) {
    return;
  }

  try {
    const mongooseConnection = await connectDatabase();
    // Create a UserProjectPermission on the fly based on user role
    await postUserProjectPermissionHelper({
      mongooseConnection,
      projectId: IGBO_API_PROJECT_ID,
      body: {
        firebaseId,
        email,
        role: determineUserRoleFromEmail(email),
        grantingAdmin: Author.SYSTEM,
        status: EntityStatus.ACTIVE,
      },
    });
  } catch (err) {
    console.log('Unable to create user project permission for the default project');
  }
};

/* Creates a user account and assigns the role to 'user' */
export const onCreateUserAccount = functions.auth.user().onCreate(async (user) => {
  try {
    const role = assignUserRole(user);

    await admin.auth().setCustomUserClaims(user.uid, role);
    await sendNewUserNotification({ newUserEmail: user.email });
    await incrementTotalUserStat();
    await handleCreateDefaultUserProjectPermission({ firebaseId: user.uid, email: user.email });

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
