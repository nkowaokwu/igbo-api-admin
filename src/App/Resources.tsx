import React from 'react';
import {
  hasAdminPermissions,
  hasEditorPermissions,
  hasAtLeastTranscriberPermissions,
  hasAccessToPlatformPermissions,
} from 'src/shared/utils/permissions';
import WordList from 'src/Core/Collections/Words/WordList';
import WordShow from 'src/Core/Collections/Words/WordShow';
import ExampleList from 'src/Core/Collections/Examples/ExampleList';
import ExampleShow from 'src/Core/Collections/Examples/ExampleShow';
import CorpusList from 'src/Core/Collections/Corpora/CorpusList';
import CorpusShow from 'src/Core/Collections/Corpora/CorpusShow';
import WordSuggestionList from 'src/Core/Collections/WordSuggestions/WordSuggestionList';
import WordSuggestionEdit from 'src/Core/Collections/WordSuggestions/WordSuggestionEdit';
import WordSuggestionCreate from 'src/Core/Collections/WordSuggestions/WordSuggestionCreate';
import WordSuggestionShow from 'src/Core/Collections/WordSuggestions/WordSuggestionShow';
import ExampleSuggestionList from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionList';
import ExampleSuggestionEdit from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionEdit';
import ExampleSuggestionCreate from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionCreate';
import ExampleSuggestionShow from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionShow';
import CorpusSuggestionList from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionList';
import CorpusSuggestionEdit from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionEdit';
import CorpusSuggestionCreate from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionCreate';
import CorpusSuggestionShow from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionShow';
import NotificationList from 'src/Core/Collections/Notifications/NotificationList';
import PollList from 'src/Core/Collections/Polls/PollList';
import PollCreate from 'src/Core/Collections/Polls/PollCreate';
import UserList from 'src/Core/Collections/Users/UserList';
import UserShow from 'src/Core/Collections/Users/UserShow';
import IgboSoundbox from 'src/Core/Collections/IgboSoundbox';
import IgboDefinitions from 'src/Core/Collections/IgboDefinitions';
import DataDump from 'src/Core/Collections/DataDump';
import withLastRoute from './withLastRoute';

const defaultRoutes = (permissions) => hasAccessToPlatformPermissions(permissions, [
  {
    name: '#',
    options: { label: 'Dashboard' },
    icon: () => <>🏠</>,
    exact: true,
  },
]) || [];

const editorRoutes = (permissions) => hasEditorPermissions(permissions, [
  {
    name: 'words',
    key: 'words',
    list: withLastRoute(WordList),
    show: withLastRoute(WordShow),
    icon: () => <>📗</>,
  },
  {
    name: 'examples',
    key: 'examples',
    list: ExampleList,
    show: ExampleShow,
    icon: () => <>📘</>,
  },
  {
    name: 'corpora',
    key: 'corpora',
    options: { label: 'Corpora' },
    list: withLastRoute(CorpusList),
    show: withLastRoute(CorpusShow),
    create: null,
    icon: () => <>📚</>,
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
  },
  {
    name: 'notifications',
    key: 'notifications',
    options: { label: 'Platform Notifications' },
    list: withLastRoute(NotificationList),
    icon: () => <>🔔</>,
  },
  {
    name: 'polls',
    key: 'polls',
    options: { label: 'Constructed Term Polls' },
    list: withLastRoute(PollList),
    create: withLastRoute(PollCreate),
    icon: () => <>🗳</>,
  },
]) || [];

const adminRoutes = (permissions) => hasAdminPermissions(permissions, [
  {
    name: 'users',
    key: 'users',
    list: withLastRoute(UserList),
    show: withLastRoute(UserShow),
    icon: () => <>👩🏾</>,
  },
  {
    name: 'dataDump',
    key: 'dataDump',
    options: { label: 'Data Dump' },
    list: DataDump,
    icon: () => <>🏋🏾‍♂️</>,
  },
]) || [];

const transcriberRoutes = (permissions) => hasAtLeastTranscriberPermissions(permissions, [
  {
    name: 'igboSoundbox',
    key: 'igboSoundbox',
    options: { label: 'Igbo Soundbox' },
    list: IgboSoundbox,
    icon: () => <>🔊</>,
  },
  {
    name: 'igboDefinitions',
    key: 'igboDefinitions',
    options: { label: 'Igbo Definitions' },
    list: IgboDefinitions,
    icon: () => <>✍🏾</>,
  },
]) || [];

export const getResourceObjects = (permissions: any): any => [
  ...defaultRoutes(permissions),
  ...editorRoutes(permissions),
  ...adminRoutes(permissions),
  ...transcriberRoutes(permissions),
];
