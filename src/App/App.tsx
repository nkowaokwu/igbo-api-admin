import React, { ReactElement, useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Loadable from 'react-loadable';
import { pick } from 'lodash';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import authProvider from '../utils/authProvider';
import PlatformLoader from './PlatformLoader';
import '../styles.css';

const auth = getAuth();
const AsyncIgboAPIAdmin = Loadable({
  loader: () => import('./IgboAPIAdmin'),
  loading: PlatformLoader,
});

const App = (): React.ReactElement => {
  const [client, setClient] = useState(false);
  const [user, setUser] = useState<any>(-1);

  /* Once the Firebase user is found or not, then we render the platform */
  useEffect(() => {
    setClient(true);
    // If the user hasn't been updated yet, exit early
    if (user === -1) {
      return () => {};
    };

    if (user?.displayName) {
      (async () => {
        try {
          // If an error occurs while checking auth, the user will be redirected to the login page
          const res = await authProvider.checkAuth();
          if (res?.message) {
            window.location.hash = '#/login';
          }
        } catch (err) {
          window.location.hash = '#/login';
        }
      })();
    } else {
      // If the visitor is not authenticated then they will be redirected to the login page
      window.location.hash = '#/login';
    }
    return () => {};
  }, [user]);

  /* Checks to see if the user is logged in before loading the platform */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      onAuthStateChanged(auth, (rawUser) => {
        const cleanedUser = pick(rawUser, ['displayName', 'email', 'photoURL', 'uid']);
        setUser(cleanedUser);
        // Redirects the user to the Login page if they are not signed in
        if (!rawUser) {
          authProvider.logout();
        }
      });
    }
  }, []);

  return !client ? <PlatformLoader /> : <AsyncIgboAPIAdmin />;
};

export default (props: any): ReactElement => (
  <ChakraProvider>
    <App {...props} />
  </ChakraProvider>
);
