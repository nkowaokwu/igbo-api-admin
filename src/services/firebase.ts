import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import useFirebaseConfig from 'src/hooks/useFirebaseConfig';
import firebaseJson from '../../firebase.json'; // eslint-disable-line

const firebaseConfig = useFirebaseConfig();
const apps = getApps();
let app;
// Initialize Firebase
if (!apps.length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const shouldUseEmulator = (
  process.env.NODE_ENV === 'development'
  || process.env.NODE_ENV === 'test'
  || window.location.hostname === 'localhost'
);

const db = getFirestore(app);
const functions = getFunctions(getApp());

if (shouldUseEmulator) {
  /* Use Firebase Emulators */
  connectFirestoreEmulator(db, 'localhost', firebaseJson.emulators.firestore.port);
  connectFunctionsEmulator(functions, 'localhost', firebaseJson.emulators.functions.port);
  console.debug(`Using Firestore emulator: http://localhost:${firebaseJson.emulators.firestore.port}`);
  console.debug(`Using Functions emulator: http://localhost:${firebaseJson.emulators.functions.port}`);
}
