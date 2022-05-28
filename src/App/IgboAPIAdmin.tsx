import React, { ReactElement } from 'react';
import { Admin, Resource, Layout } from 'react-admin';
import { flatten, compact } from 'lodash';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { Dashboard, Error, NotFound } from 'src/Core';
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
import {
  GenericWordList,
  GenericWordEdit,
  GenericWordShow,
  GenericWordIcon,
} from 'src/Core/Collections/GenericWords';
import { PollsList, PollsCreate } from 'src/Core/Collections/Polls';
import { UserList, UserIcon } from 'src/Core/Collections/Users';
import Login from 'src/Login';
import dataProvider from 'src/utils/dataProvider';
import authProvider from 'src/utils/authProvider';

const handleNoPermissions = (permissions) => {
  if (!permissions) {
    localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
  }
};

const IgboAPIAdmin = (): ReactElement => (
  // @ts-ignore
  <div className={!!window.Cypress ? 'testing-app' : ''}>
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
              icon={UserIcon}
            />,
            <Resource
              name="polls"
              list={PollsList}
              create={PollsCreate}
            />,
          ])),
        ])));
      }}
    </Admin>
  </div>
);

export default IgboAPIAdmin;
