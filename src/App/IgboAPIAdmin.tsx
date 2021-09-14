import React, { ReactElement } from 'react';
import { Admin, Resource, Layout } from 'react-admin';
import { flatten, compact } from 'lodash';
import { Dashboard, Error, NotFound } from '../Core';
import { hasAdminPermissions } from '../shared/utils/permissions';
import {
  WordList,
  WordShow,
  WordIcon,
} from '../Core/Collections/Words';
import {
  ExampleList,
  ExampleShow,
  ExampleIcon,
} from '../Core/Collections/Examples';
import {
  WordSuggestionList,
  WordSuggestionEdit,
  WordSuggestionCreate,
  WordSuggestionShow,
  WordSuggestionIcon,
} from '../Core/Collections/WordSuggestions';
import {
  ExampleSuggestionList,
  ExampleSuggestionEdit,
  ExampleSuggestionCreate,
  ExampleSuggestionShow,
  ExampleSuggestionIcon,
} from '../Core/Collections/ExampleSuggestions';
import {
  GenericWordList,
  GenericWordEdit,
  GenericWordShow,
  GenericWordIcon,
} from '../Core/Collections/GenericWords';
import { UserList, UserIcon } from '../Core/Collections/Users';
import Login from '../Login';
import dataProvider from '../utils/dataProvider';
import authProvider from '../utils/authProvider';

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
      {(permissions) => (flatten(compact([
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
        ])),
      ])))}
    </Admin>
  </div>
);

export default IgboAPIAdmin;
