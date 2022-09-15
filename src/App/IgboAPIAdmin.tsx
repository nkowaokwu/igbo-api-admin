import React, { ReactElement, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { Admin, Resource } from 'react-admin';
import { flatten, compact } from 'lodash';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import {
  Dashboard,
  Layout,
  Error,
  NotFound,
} from 'src/Core';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import {
  WordList,
  WordShow,
  WordIcon,
} from 'src/Core/Collections/Words';
import {
  ExampleList,
  ExampleShow,
  ExampleIcon,
} from 'src/Core/Collections/Examples';
import {
  WordSuggestionList,
  WordSuggestionEdit,
  WordSuggestionCreate,
  WordSuggestionShow,
  WordSuggestionIcon,
} from 'src/Core/Collections/WordSuggestions';
import {
  ExampleSuggestionList,
  ExampleSuggestionEdit,
  ExampleSuggestionCreate,
  ExampleSuggestionShow,
  ExampleSuggestionIcon,
} from 'src/Core/Collections/ExampleSuggestions';
import { ConstructedTermList } from 'src/Core/Collections/ConstructedTerms';
import {
  GenericWordList,
  GenericWordEdit,
  GenericWordShow,
  GenericWordIcon,
} from 'src/Core/Collections/GenericWords';
import { PollsList, PollsCreate } from 'src/Core/Collections/Polls';
import { NotificationList, NotificationIcon } from 'src/Core/Collections/Notifications';
import { UserList, UserShow, UserIcon } from 'src/Core/Collections/Users';
import Login from 'src/Login';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';

const handleNoPermissions = (permissions) => {
  if (!permissions && window.location.hash !== '#/login') {
    localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
  }
};

const IgboAPIAdmin = (): ReactElement => {
  useEffect(() => {
    const INTERVAL_TIME = 4000;
    const intervalRef = setInterval(() => {
      if (window.location.hash !== '#/login') {
        localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
      }
    }, INTERVAL_TIME);
    return () => clearTimeout(intervalRef);
  }, []);

  return (
    // @ts-expect-error Cypress
    <Box className={!!window.Cypress ? 'testing-app' : ''}>
      <Admin
        dashboard={Dashboard}
        layout={(props) => <Layout {...props} error={Error} />}
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={Login}
        catchAll={NotFound}
      >
        {(permissions) => {
          handleNoPermissions(permissions);
          return (flatten(compact([
            <Resource
              name="words"
              list={(props) => <WordList {...props} permissions={permissions} />}
              show={WordShow}
              icon={WordIcon}
            />,
            <Resource
              name="examples"
              list={(props) => <ExampleList {...props} permissions={permissions} />}
              show={ExampleShow}
              icon={ExampleIcon}
            />,
            <Resource
              name="constructedTerms"
              options={{ label: 'Constructed Terms' }}
              list={(props) => <ConstructedTermList {...props} permissions={permissions} />}
              icon={ExampleIcon}
            />,
            <Resource
              name="wordSuggestions"
              options={{ label: 'Word Suggestions' }}
              list={(props) => <WordSuggestionList {...props} permissions={permissions} />}
              edit={WordSuggestionEdit}
              create={WordSuggestionCreate}
              show={(props) => <WordSuggestionShow {...props} permissions={permissions} />}
              icon={WordSuggestionIcon}
            />,
            <Resource
              name="exampleSuggestions"
              options={{ label: 'Example Suggestions' }}
              list={(props) => <ExampleSuggestionList {...props} permissions={permissions} />}
              edit={ExampleSuggestionEdit}
              create={ExampleSuggestionCreate}
              show={(props) => <ExampleSuggestionShow {...props} permissions={permissions} />}
              icon={ExampleSuggestionIcon}
            />,
            <Resource
              name="notifications"
              options={{ label: 'Platform Notifications' }}
              list={(props) => <NotificationList {...props} permissions={permissions} />}
              icon={NotificationIcon}
            />,
            <Resource
              name="polls"
              options={{ label: 'Constructed Term Polls' }}
              list={(props) => <PollsList {...props} permissions={permissions} />}
              {...hasAdminPermissions(permissions, true)
                ? { create: PollsCreate }
                : { create: null }
              }
            />,
            hasAdminPermissions(permissions, ([
              <Resource
                name="genericWords"
                options={{ label: 'Generic Words' }}
                list={(props) => <GenericWordList {...props} permissions={permissions} />}
                edit={GenericWordEdit}
                show={GenericWordShow}
                icon={GenericWordIcon}
              />,
              <Resource
                name="users"
                list={(props) => <UserList {...props} permissions={permissions} />}
                show={(props) => <UserShow {...props} permissions={permissions} />}
                icon={UserIcon}
              />,
            ])),
          ])));
        }}
      </Admin>
    </Box>
  );
};

export default IgboAPIAdmin;
