import React from 'react';
import {
  hasAdminPermissions,
  hasEditorPermissions,
  hasAtLeastCrowdsourcerPermissions,
  hasAccessToPlatformPermissions,
} from 'src/shared/utils/permissions';
import withLastRoute from './withLastRoute';

const WordList = React.lazy(() => import('src/Core/Collections/Words/WordList'));
const WordShow = React.lazy(() => import('src/Core/Collections/Words/WordShow'));
const ExampleList = React.lazy(() => import('src/Core/Collections/Examples/ExampleList'));
const ExampleShow = React.lazy(() => import('src/Core/Collections/Examples/ExampleShow'));
const CorpusList = React.lazy(() => import('src/Core/Collections/Corpora/CorpusList'));
const CorpusShow = React.lazy(() => import('src/Core/Collections/Corpora/CorpusShow'));
const WordSuggestionList = React.lazy(() => import('src/Core/Collections/WordSuggestions/WordSuggestionList'));
const WordSuggestionEdit = React.lazy(() => import('src/Core/Collections/WordSuggestions/WordSuggestionEdit'));
const WordSuggestionCreate = React.lazy(() => import('src/Core/Collections/WordSuggestions/WordSuggestionCreate'));
const WordSuggestionShow = React.lazy(() => import('src/Core/Collections/WordSuggestions/WordSuggestionShow'));
const ExampleSuggestionList = React.lazy(() => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionList'));
const ExampleSuggestionEdit = React.lazy(() => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionEdit'));
const ExampleSuggestionCreate = React.lazy(
  () => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionCreate'),
);
const ExampleSuggestionShow = React.lazy(() => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionShow'));
const NsibidiCharacterList = React.lazy(() => import('src/Core/Collections/NsibidiCharacters/NsibidiCharacterList'));
const NsibidiCharacterEdit = React.lazy(() => import('src/Core/Collections/NsibidiCharacters/NsibidiCharacterEdit'));
const NsibidiCharacterCreate = React.lazy(
  () => import('src/Core/Collections/NsibidiCharacters/NsibidiCharacterCreate'),
);
const NsibidiCharacterShow = React.lazy(() => import('src/Core/Collections/NsibidiCharacters/NsibidiCharacterShow'));
const CorpusSuggestionList = React.lazy(() => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionList'));
const CorpusSuggestionEdit = React.lazy(() => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionEdit'));
const CorpusSuggestionCreate = React.lazy(
  () => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionCreate'),
);
const CorpusSuggestionShow = React.lazy(() => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionShow'));
const NotificationList = React.lazy(() => import('src/Core/Collections/Notifications/NotificationList'));
const PollList = React.lazy(() => import('src/Core/Collections/Polls/PollList'));
const PollCreate = React.lazy(() => import('src/Core/Collections/Polls/PollCreate'));
const UserList = React.lazy(() => import('src/Core/Collections/Users/UserList'));
const UserShow = React.lazy(() => import('src/Core/Collections/Users/UserShow'));
// const Leaderboard = React.lazy(() => import('src/Core/Collections/Leaderboard'));
const IgboSoundbox = React.lazy(() => import('src/Core/Collections/IgboSoundbox'));
const IgboDefinitions = React.lazy(() => import('src/Core/Collections/IgboDefinitions'));
const IgboTextImages = React.lazy(() => import('src/Core/Collections/TextImages'));
const TextImageList = React.lazy(() => import('src/Core/Collections/TextImages/TextImageList'));
const DataDump = React.lazy(() => import('src/Core/Collections/DataDump'));
const Profile = React.lazy(() => import('src/Core/Profile'));
const Stats = React.lazy(() => import('src/Core/Stats'));
const TranslateIgboSentences = React.lazy(() => import('src/Core/TranslateIgboSentences'));

export enum ResourceGroup {
  UNSPECIFIED = 'UNSPECIFIED',
  LEXICAL = 'LEXICAL',
  DATA_COLLECTION = 'DATA_COLLECTION',
  SETTINGS = 'SETTINGS',
}

export const ResourceGroupLabels = {
  [ResourceGroup.UNSPECIFIED]: '',
  [ResourceGroup.LEXICAL]: 'Published data',
  [ResourceGroup.DATA_COLLECTION]: 'Draft data',
  [ResourceGroup.SETTINGS]: 'Settings',
};

export interface Resource {
  name: string;
  key: string;
  options: { label: string };
  list: Promise<React.ReactElement>;
  edit: Promise<React.ReactElement>;
  create: Promise<React.ReactElement>;
  show: Promise<React.ReactElement>;
  icon: React.ReactElement;
  group: ResourceGroup;
}

const defaultRoutes = (permissions) =>
  hasAccessToPlatformPermissions(permissions, [
    {
      name: '#',
      options: { label: 'Dashboard' },
      icon: () => <>🏠</>,
      exact: true,
      group: ResourceGroup.UNSPECIFIED,
    },
  ]) || [];

const editorRoutes = (permissions) =>
  hasEditorPermissions(permissions, [
    {
      name: 'stats',
      key: 'stats',
      list: withLastRoute(Stats),
      icon: () => <>📈</>,
      group: ResourceGroup.UNSPECIFIED,
    },
    {
      name: 'words',
      key: 'words',
      list: withLastRoute(WordList),
      show: withLastRoute(WordShow),
      icon: () => <>📗</>,
      group: ResourceGroup.LEXICAL,
    },
    {
      name: 'examples',
      key: 'examples',
      list: withLastRoute(ExampleList),
      show: withLastRoute(ExampleShow),
      icon: () => <>📘</>,
      group: ResourceGroup.LEXICAL,
    },
    {
      name: 'nsibidiCharacters',
      key: 'nsibidiCharacters',
      options: { label: 'Nsịbịdị Characters' },
      list: withLastRoute(NsibidiCharacterList),
      edit: withLastRoute(NsibidiCharacterEdit),
      create: withLastRoute(NsibidiCharacterCreate),
      show: withLastRoute(NsibidiCharacterShow),
      icon: () => <>〒</>,
      group: ResourceGroup.LEXICAL,
    },
    {
      name: 'corpora',
      key: 'corpora',
      options: { label: 'Corpora' },
      list: withLastRoute(CorpusList),
      show: withLastRoute(CorpusShow),
      create: null,
      icon: () => <>📚</>,
      group: ResourceGroup.LEXICAL,
    },
    {
      name: 'wordSuggestions',
      key: 'wordSuggestions',
      options: { label: 'Word Suggestions' },
      list: withLastRoute(WordSuggestionList),
      edit: withLastRoute(WordSuggestionEdit),
      create: withLastRoute(WordSuggestionCreate),
      show: withLastRoute(WordSuggestionShow),
      icon: () => <>📒</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'exampleSuggestions',
      key: 'exampleSuggestions',
      options: { label: 'Example Suggestions' },
      list: withLastRoute(ExampleSuggestionList),
      edit: withLastRoute(ExampleSuggestionEdit),
      create: withLastRoute(ExampleSuggestionCreate),
      show: withLastRoute(ExampleSuggestionShow),
      icon: () => <>📕</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'corpusSuggestions',
      key: 'corpusSuggestions',
      options: { label: 'Corpus Suggestions' },
      list: withLastRoute(CorpusSuggestionList),
      edit: withLastRoute(CorpusSuggestionEdit),
      create: withLastRoute(CorpusSuggestionCreate),
      show: withLastRoute(CorpusSuggestionShow),
      icon: () => <>📓</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'polls',
      key: 'polls',
      options: { label: 'Constructed Term Polls' },
      list: withLastRoute(PollList),
      create: withLastRoute(PollCreate),
      icon: () => <>🗳</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
  ]) || [];

const adminRoutes = (permissions) =>
  hasAdminPermissions(permissions, [
    {
      name: 'users',
      key: 'users',
      list: withLastRoute(UserList),
      show: withLastRoute(UserShow),
      icon: () => <>👩🏾</>,
      group: ResourceGroup.SETTINGS,
    },
    {
      name: 'dataDump',
      key: 'dataDump',
      options: { label: 'Data Dump' },
      list: withLastRoute(DataDump),
      icon: () => <>🏋🏾‍♂️</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'textImages',
      key: 'textImages',
      options: { label: 'Igbo Text Images' },
      list: withLastRoute(TextImageList),
      icon: () => <>📸</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'igboTextImages',
      key: 'igboTextImages',
      options: { label: 'Upload Igbo Text Images' },
      list: withLastRoute(IgboTextImages),
      icon: () => <>📸</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
    // {
    //   name: 'igboSoundbox',
    //   key: 'igboSoundbox',
    //   options: { label: 'Igbo Soundbox' },
    //   list: withLastRoute(IgboSoundbox),
    //   icon: () => <>🔊</>,
    //   group: ResourceGroup.DATA_COLLECTION,
    // },
    {
      name: 'igboDefinitions',
      key: 'igboDefinitions',
      options: { label: 'Igbo Definitions' },
      list: withLastRoute(IgboDefinitions),
      icon: () => <>✍🏾</>,
      group: ResourceGroup.DATA_COLLECTION,
    },
  ]) || [];

const crowdsourcerRoutes = (permissions) =>
  hasAtLeastCrowdsourcerPermissions(permissions, [
    // {
    //   name: 'leaderboard',
    //   key: 'leaderboard',
    //   options: { label: 'Leaderboard' },
    //   list: withLastRoute(Leaderboard),
    //   icon: () => <>🏆</>,
    //   group: ResourceGroup.DATA_COLLECTION,
    // },
  ]) || [];

export const getResourceObjects = (permissions: any): Resource[] => [
  ...defaultRoutes(permissions),
  ...editorRoutes(permissions),
  ...adminRoutes(permissions),
  ...crowdsourcerRoutes(permissions),
];

export const getCustomRouteObjects = (): any => [
  {
    exact: true,
    path: '/profile',
    component: withLastRoute(Profile),
    group: ResourceGroup.UNSPECIFIED,
  },
  {
    exact: true,
    path: '/translate',
    component: withLastRoute(TranslateIgboSentences),
    group: ResourceGroup.UNSPECIFIED,
  },
  {
    exact: true,
    path: '/notifications',
    component: withLastRoute(NotificationList),
    group: ResourceGroup.UNSPECIFIED,
  },
  {
    path: '/igboSoundbox',
    component: withLastRoute(IgboSoundbox),
    group: ResourceGroup.UNSPECIFIED,
  },
  {
    path: '/igboDefinitions',
    component: withLastRoute(IgboDefinitions),
    group: ResourceGroup.UNSPECIFIED,
  },
];
