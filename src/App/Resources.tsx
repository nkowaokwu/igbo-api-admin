import React from 'react';
import { FiHome, FiBarChart, FiBook, FiBookOpen, FiFolder } from 'react-icons/fi';
import {
  LuSettings,
  LuHardDriveUpload,
  LuFileStack,
  LuFileEdit,
  LuUserCheck,
  LuCamera,
  LuText,
  LuVote,
} from 'react-icons/lu';

import {
  hasAdminPermissions,
  hasEditorPermissions,
  hasAtLeastCrowdsourcerPermissions,
  hasAccessToPlatformPermissions,
  hasPlatformAdminPermissions,
} from 'src/shared/utils/permissions';
import Home from 'src/Core/Home';
import Pricing from 'src/Core/Pricing';
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
const ProjectSettings = React.lazy(() => import('src/Core/Collections/ProjectSettings'));
const IgboSoundbox = React.lazy(() => import('src/Core/Collections/IgboSoundbox'));
const IgboDefinitions = React.lazy(() => import('src/Core/Collections/IgboDefinitions'));
const IgboTextImages = React.lazy(() => import('src/Core/Collections/TextImages'));
const TextImageList = React.lazy(() => import('src/Core/Collections/TextImages/TextImageList'));
const DataDump = React.lazy(() => import('src/Core/Collections/DataDump'));
const Profile = React.lazy(() => import('src/Core/Profile'));
const Stats = React.lazy(() => import('src/Core/Stats'));
const TranslateIgboSentences = React.lazy(() => import('src/Core/TranslateIgboSentences'));
const ProjectList = React.lazy(() => import('src/Core/Collections/Projects/ProjectList'));

export enum ResourceGroup {
  UNSPECIFIED = 'UNSPECIFIED',
  GET_STARTED = 'GET_STARTED',
  LEXICAL = 'LEXICAL',
  DATA_COLLECTION = 'DATA_COLLECTION',
  SETTINGS = 'SETTINGS',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

export const ResourceGroupLabels = {
  [ResourceGroup.UNSPECIFIED]: '',
  [ResourceGroup.GET_STARTED]: 'Get started',
  [ResourceGroup.LEXICAL]: 'Published data',
  [ResourceGroup.DATA_COLLECTION]: 'Draft data',
  [ResourceGroup.SETTINGS]: 'Project',
  [ResourceGroup.PLATFORM_ADMIN]: 'Platform admin',
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
  generalProject?: boolean; // Routes visible for any general project
}

const defaultRoutes = (permissions) =>
  hasAccessToPlatformPermissions(permissions, [
    {
      name: '#',
      options: { label: 'Dashboard' },
      icon: () => <FiHome />,
      exact: true,
      group: ResourceGroup.UNSPECIFIED,
      generalProject: true,
    },
  ]) || [];

const editorRoutes = (permissions) =>
  hasEditorPermissions(permissions, [
    {
      name: 'stats',
      key: 'stats',
      list: withLastRoute(Stats),
      icon: () => <FiBarChart />,
      group: ResourceGroup.UNSPECIFIED,
    },
    {
      name: 'words',
      key: 'words',
      list: withLastRoute(WordList),
      show: withLastRoute(WordShow),
      icon: () => <FiBook />,
      group: ResourceGroup.LEXICAL,
    },
    {
      name: 'examples',
      key: 'examples',
      options: { label: 'Sentences' },
      list: withLastRoute(ExampleList),
      show: withLastRoute(ExampleShow),
      icon: () => <FiBookOpen />,
      group: ResourceGroup.LEXICAL,
      generalProject: true,
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
      icon: () => <LuFileStack />,
      group: ResourceGroup.LEXICAL,
      generalProject: false,
    },
    {
      name: 'wordSuggestions',
      key: 'wordSuggestions',
      options: { label: 'Word Drafts' },
      list: withLastRoute(WordSuggestionList),
      edit: withLastRoute(WordSuggestionEdit),
      create: withLastRoute(WordSuggestionCreate),
      show: withLastRoute(WordSuggestionShow),
      icon: () => <LuFileEdit />,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'exampleSuggestions',
      key: 'exampleSuggestions',
      options: { label: 'Sentence Drafts' },
      list: withLastRoute(ExampleSuggestionList),
      edit: withLastRoute(ExampleSuggestionEdit),
      create: withLastRoute(ExampleSuggestionCreate),
      show: withLastRoute(ExampleSuggestionShow),
      icon: () => <LuFileEdit />,
      group: ResourceGroup.DATA_COLLECTION,
      generalProject: true,
    },
    {
      name: 'corpusSuggestions',
      key: 'corpusSuggestions',
      options: { label: 'Corpus Drafts' },
      list: withLastRoute(CorpusSuggestionList),
      edit: withLastRoute(CorpusSuggestionEdit),
      create: withLastRoute(CorpusSuggestionCreate),
      show: withLastRoute(CorpusSuggestionShow),
      icon: () => <LuFileEdit />,
      group: ResourceGroup.DATA_COLLECTION,
      generalProject: false,
    },
    {
      name: 'polls',
      key: 'polls',
      options: { label: 'Constructed Term Polls' },
      list: withLastRoute(PollList),
      create: withLastRoute(PollCreate),
      icon: () => <LuVote />,
      group: ResourceGroup.DATA_COLLECTION,
    },
  ]) || [];

const getStartedRoutes = (permissions) =>
  hasAdminPermissions(permissions, [
    {
      name: 'dataDump',
      key: 'dataDump',
      options: { label: 'Import Data' },
      list: withLastRoute(DataDump),
      icon: () => <LuHardDriveUpload />,
      group: ResourceGroup.GET_STARTED,
      generalProject: true,
    },
  ]) || [];

const platformAdminRoutes = (permissions) =>
  hasPlatformAdminPermissions(permissions, [
    {
      name: 'projects',
      key: 'projects',
      options: { label: 'Projects' },
      list: withLastRoute(ProjectList),
      icon: () => <FiFolder />,
      group: ResourceGroup.PLATFORM_ADMIN,
      generalProject: true,
    },
  ]) || [];

const settingsRoutes = (permissions) =>
  hasAdminPermissions(permissions, [
    {
      name: 'settings',
      key: 'settings',
      noLayout: true,
      list: withLastRoute(ProjectSettings),
      icon: () => <LuSettings />,
      group: ResourceGroup.SETTINGS,
      generalProject: true,
    },
    {
      name: 'users',
      key: 'users',
      options: { label: 'Members' },
      list: withLastRoute(UserList),
      show: withLastRoute(UserShow),
      icon: () => <LuUserCheck />,
      group: ResourceGroup.SETTINGS,
      generalProject: true,
    },
    {
      name: 'textImages',
      key: 'textImages',
      options: { label: 'Igbo Text Images' },
      list: withLastRoute(TextImageList),
      icon: () => <LuCamera />,
      group: ResourceGroup.DATA_COLLECTION,
    },
    {
      name: 'igboTextImages',
      key: 'igboTextImages',
      options: { label: 'Upload Igbo Text Images' },
      list: withLastRoute(IgboTextImages),
      icon: () => <LuCamera />,
      group: ResourceGroup.DATA_COLLECTION,
    },
    /* {
      name: 'soundbox',
      key: 'soundbox',
      options: { label: 'Igbo Soundbox' },
      list: withLastRoute(IgboSoundbox),
      icon: () => <>🔊</>,
      group: ResourceGroup.DATA_COLLECTION,
    }, */
    {
      name: 'igboDefinitions',
      key: 'igboDefinitions',
      options: { label: 'Igbo Definitions' },
      list: withLastRoute(IgboDefinitions),
      icon: () => <LuText />,
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
  ...getStartedRoutes(permissions),
  ...editorRoutes(permissions),
  ...settingsRoutes(permissions),
  ...crowdsourcerRoutes(permissions),
  ...platformAdminRoutes(permissions),
];

export const getCustomRouteObjects = (): any => [
  {
    exact: true,
    path: '/home',
    component: () => <Home />,
    group: ResourceGroup.UNSPECIFIED,
    noLayout: true,
    generalProject: true,
  },
  {
    exact: true,
    path: '/pricing',
    component: () => <Pricing />,
    group: ResourceGroup.UNSPECIFIED,
    noLayout: true,
    generalProject: true,
  },
  {
    exact: true,
    path: '/profile',
    component: withLastRoute(Profile),
    group: ResourceGroup.UNSPECIFIED,
    generalProject: true,
  },
  {
    exact: true,
    path: '/translate',
    component: withLastRoute(TranslateIgboSentences),
    group: ResourceGroup.UNSPECIFIED,
    generalProject: true,
  },
  {
    exact: true,
    path: '/notifications',
    component: withLastRoute(NotificationList),
    group: ResourceGroup.UNSPECIFIED,
  },
  {
    path: '/soundbox',
    component: withLastRoute(IgboSoundbox),
    group: ResourceGroup.UNSPECIFIED,
    generalProject: true,
  },
  {
    path: '/igboDefinitions',
    component: withLastRoute(IgboDefinitions),
    group: ResourceGroup.UNSPECIFIED,
  },
];
