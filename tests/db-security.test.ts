import {
  initializeAdminApp,
  initializeTestApp,
  clearFirestoreData,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { Role } from '../src/shared/constants/auth-types';
import { FirestoreCollections } from '../src/shared/constants/firestore-types';

const STAGING_ENV = 'igbo-api-admin-staging';

/**
 * Get an user instance of firestore
 * @param auth The auth state of the user
 */
function getFirestore(auth: TokenOptions) {
  return initializeTestApp({ projectId: STAGING_ENV, auth }).firestore();
}

/**
 * Get an admin instance of firestore
 */
function getAdminFirestore() {
  return initializeAdminApp({ projectId: STAGING_ENV }).firestore();
}

const adminAuth = {
  uid: 'test-admin',
  email: 'test-admin@gmail.com',
  role: Role.ADMIN,
  name: 'Admin User',
};
const mergerAuth = {
  uid: 'test-merger',
  email: 'test-merger@gmail.com',
  role: Role.MERGER,
  name: 'Merger User',
};
const editorAuth = {
  uid: 'test-editor',
  email: 'test-editor@gmail.com',
  role: Role.EDITOR,
  name: 'Editor User',
};

const newAdmin = { firstName: 'me', lastName: 'my' };

const setupAdmin = async () => {
  const admin = getAdminFirestore();
  const adminWrite = admin.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).set({
    firstName: 'Real Test',
    lastName: 'Admin',
  });
  await assertSucceeds(adminWrite);
};

describe('Igbo API Admin Database', () => {
  // Clear the database before each test
  beforeEach(() => {
    clearFirestoreData({ projectId: STAGING_ENV });
  });
  describe('documents in the /admins collection', () => {
    test('can\'t be created by created by an admin', async () => {
      const db = getFirestore(adminAuth);
      const write = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).set(newAdmin);
      await assertFails(write);
    });

    test('can\'t be created by created by a merger', async () => {
      const db = getFirestore(mergerAuth);
      const write = db.collection(FirestoreCollections.ADMINS).doc(mergerAuth.uid).set(newAdmin);
      await assertFails(write);
    });

    test('can\'t be created by created by an editor', async () => {
      const db = getFirestore(editorAuth);
      const write = db.collection(FirestoreCollections.ADMINS).doc(editorAuth.uid).set(newAdmin);
      await assertFails(write);
    });

    test('can\'t be updated by an admin', async () => {
      await setupAdmin();
      const db = getFirestore(adminAuth);
      const write = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).update(newAdmin);
      await assertFails(write);
    });

    test('can\'t be updated by a merger', async () => {
      await setupAdmin();
      const db = getFirestore(mergerAuth);
      const write = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).update(newAdmin);
      await assertFails(write);
    });

    test('can\'t be updated by an editor', async () => {
      await setupAdmin();
      const db = getFirestore(editorAuth);
      const write = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).update(newAdmin);
      await assertFails(write);
    });

    test.skip('can\'t be read by other admins', async () => {
      await setupAdmin();
      const db = getFirestore(adminAuth);
      const read = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).get();
      await assertFails(read);
    });

    test.skip('can\'t be read by mergers', async () => {
      await setupAdmin();
      const db = getFirestore(mergerAuth);
      const read = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).get();
      await assertFails(read);
    });

    test.skip('can\'t be read by editors', async () => {
      await setupAdmin();
      const db = getFirestore(editorAuth);
      const read = db.collection(FirestoreCollections.ADMINS).doc(adminAuth.uid).get();
      await assertFails(read);
    });
  });
});
