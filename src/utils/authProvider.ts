import { FirebaseAuthProvider } from 'react-admin-firebase';
import useFirebaseConfig from '../hooks/useFirebaseConfig';

const firebaseConfig = useFirebaseConfig();
const firebaseAuthProvider = FirebaseAuthProvider(firebaseConfig, { lazyLoading: { enabled: true }, logging: false });
export default {
  ...firebaseAuthProvider,
  logout: (args) => {
    window.localStorage.clear();
    return firebaseAuthProvider.logout(args);
  },
};
