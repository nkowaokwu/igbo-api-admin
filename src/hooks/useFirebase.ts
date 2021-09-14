import 'firebase/app';
import 'firebase/functions';
import 'firebase/firestore';
import 'firebase/auth';
import firebase from 'firebase';
import { HOST, FIRESTORE_PORT, EMULATOR_PORT } from '../config';

export const useFirebase = (firebaseConfig: any): any => {
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  if (process.env.NODE_ENV === 'development') {
    const db = firebase.firestore();
    if (window?.location?.hostname === HOST) {
      db.settings({
        host: `${HOST}:${FIRESTORE_PORT}`,
        ssl: false,
      });
    }
    firebase.functions().useEmulator(HOST, EMULATOR_PORT);
  }

  return firebase;
};
