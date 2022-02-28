import { FirebaseAuthProvider } from 'react-admin-firebase';
import { omit } from 'lodash';
import useFirebaseConfig from 'src/hooks/useFirebaseConfig';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';

const LOGIN_HASH = '#/login';
const firebaseConfig = useFirebaseConfig();
const firebaseAuthProvider = FirebaseAuthProvider(firebaseConfig, { lazyLoading: { enabled: true }, logging: false });
export default {
  ...firebaseAuthProvider,
  getPermissions: async (): Promise<any> => {
    // @ts-expect-error
    const result = await firebaseAuthProvider.getPermissions();
    if (!result && window.location.hash !== LOGIN_HASH) {
      localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
    }
    return result;
  },
  logout: (args: any): Promise<string | void> => {
    Object.keys(omit(LocalStorageKeys, ['REDIRECT_URL'])).forEach((key) => {
      localStorage.removeItem(LocalStorageKeys[key]);
    });
    return firebaseAuthProvider.logout(args);
  },
};
