/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose';
import { noop } from 'lodash';
import { initializeApp, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as admin from 'firebase-admin';
import { ulid } from 'ulid' // eslint-disable-line
import { initializedAdminApp } from 'src/backend/services/initializeAdmin';
import useFirebaseConfig from 'src/hooks/useFirebaseConfig';
import firebaseConfig from '../../../firebase.json'; // eslint-disable-line

type AuthType = {
  uid: string;
  email: string;
  displayName: string;
};

type OptionsType = {
  isAdmin?: boolean;
  isMerger?: boolean;
  isEditor?: boolean;
};

export const dropMongoDBCollections = async (): Promise<void> => {
  await mongoose.connection.dropCollection('words').catch(noop);
  await mongoose.connection.dropCollection('wordsuggestions').catch(noop);
  await mongoose.connection.dropCollection('examples').catch(noop);
  await mongoose.connection.dropCollection('examplesuggestions').catch(noop);
  await mongoose.connection.dropCollection('corpora').catch(noop);
  await mongoose.connection.dropCollection('corpus').catch(noop);
  await mongoose.connection.dropCollection('corpussuggestions').catch(noop);
  await mongoose.connection.dropCollection('audiopronunciations').catch(noop);
};

export const setUpTestEnvironment = (): { initializedAdminApp: admin.app.App } => {
  jest.retryTimes(2);
  initializeApp(useFirebaseConfig());
  const db = getFirestore();
  const functions = getFunctions(getApp());

  connectFirestoreEmulator(db, 'localhost', firebaseConfig.emulators.firestore.port);
  connectFunctionsEmulator(functions, 'localhost', firebaseConfig.emulators.functions.port);
  console.log(`Testing Firestore Emulator at localhost:${firebaseConfig.emulators.firestore.port}`);
  console.log(`Testing Functions Emulator at localhost:${firebaseConfig.emulators.functions.port}`);

  return { initializedAdminApp };
};

setUpTestEnvironment();

export const loginFirebaseUser = async (email: string, password = 'password'): Promise<any> => {
  const auth = getAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const generateUserAuth = (options: OptionsType): AuthType => {
  const uid = `firebase_${ulid()}`;
  const baseEmail = `${uid}@example.com`;
  const userEmail = options?.isAdmin
    ? `admin_${baseEmail}`
    : options?.isMerger
    ? `merger_${baseEmail}`
    : options?.isEditor
    ? `editor_${baseEmail}`
    : `user_${baseEmail}`;
  const newUserAuth: AuthType = {
    uid,
    email: userEmail,
    displayName: 'Testing Account',
  };
  return newUserAuth;
};
