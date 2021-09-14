import { PROD_FIREBASE_CONFIG, STAGING_FIREBASE_CONFIG } from '../config';

export default (): any => {
  const firebaseConfig = process.env.NODE_ENV === 'production' ? PROD_FIREBASE_CONFIG : STAGING_FIREBASE_CONFIG;
  return firebaseConfig;
};
