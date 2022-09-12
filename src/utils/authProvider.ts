import { FirebaseAuthProvider } from 'react-admin-firebase';
import { omit } from 'lodash';
import useFirebaseConfig from 'src/hooks/useFirebaseConfig';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';

const LOGIN_HASH = '#/login';
const firebaseConfig = useFirebaseConfig();
const firebaseAuthProvider = FirebaseAuthProvider(firebaseConfig, { lazyLoading: { enabled: true }, logging: false });
export default {
  ...firebaseAuthProvider,
  logout: (args: any): Promise<string | false | void> => {
    if (window.location.hash !== LOGIN_HASH) {
      localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
    }
    Object.keys(omit(LocalStorageKeys, ['REDIRECT_URL'])).forEach((key) => {
      localStorage.removeItem(LocalStorageKeys[key]);
    });
    return firebaseAuthProvider.logout(args);
  },
};
