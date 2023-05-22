import { FirebaseAuthProvider } from 'react-admin-firebase';
import { omit } from 'lodash';
import useFirebaseConfig from 'src/hooks/useFirebaseConfig';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import UserRoles from 'src/backend/shared/constants/UserRoles';

const clearLocalStorage = () => {
  window.localStorage.removeItem(LocalStorageKeys.UID);
  window.localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
  window.localStorage.removeItem(LocalStorageKeys.PERMISSIONS);
  window.localStorage.removeItem(LocalStorageKeys.FORM);
};

const LOGIN_HASH = '#/login';
const firebaseConfig = useFirebaseConfig();
const firebaseAuthProvider = FirebaseAuthProvider(firebaseConfig, { lazyLoading: { enabled: true }, logging: false });
export default {
  ...firebaseAuthProvider,
  logout: (args?: { [key: string]: any }): Promise<string | false | void> => {
    if (window.location.hash !== LOGIN_HASH) {
      localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
    }
    Object.keys(omit(LocalStorageKeys, ['REDIRECT_URL'])).forEach((key) => {
      localStorage.removeItem(LocalStorageKeys[key]);
    });
    window.location.hash = '#/login';
    clearLocalStorage();
    return firebaseAuthProvider.logout(args);
  },
  getPermissions: async (): Promise<{ role: UserRoles }> => {
    const role = window.localStorage.getItem(LocalStorageKeys.PERMISSIONS) as UserRoles;
    if (!role) {
      return role;
    }
    return { role };
  },
};
