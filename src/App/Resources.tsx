import React from 'react';
import { compact, flatten } from 'lodash';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import AsyncWordList from 'src/Core/Collections/Words/WordList';
import AsyncWordShow from 'src/Core/Collections/Words/WordShow';
import AsyncExampleList from 'src/Core/Collections/Examples/ExampleList';
import AsyncExampleShow from 'src/Core/Collections/Examples/ExampleShow';
import AsyncCorpusList from 'src/Core/Collections/Corpora/CorpusList';
import AsyncCorpusShow from 'src/Core/Collections/Corpora/CorpusShow';
import AsyncWordSuggestionList from 'src/Core/Collections/WordSuggestions/WordSuggestionList';
import AsyncWordSuggestionEdit from 'src/Core/Collections/WordSuggestions/WordSuggestionEdit';
import AsyncWordSuggestionCreate from 'src/Core/Collections/WordSuggestions/WordSuggestionCreate';
import AsyncWordSuggestionShow from 'src/Core/Collections/WordSuggestions/WordSuggestionShow';
import AsyncExampleSuggestionList from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionList';
import AsyncExampleSuggestionEdit from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionEdit';
import AsyncExampleSuggestionCreate from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionCreate';
import AsyncExampleSuggestionShow from 'src/Core/Collections/ExampleSuggestions/ExampleSuggestionShow';
import AsyncCorpusSuggestionList from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionList';
import AsyncCorpusSuggestionEdit from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionEdit';
import AsyncCorpusSuggestionCreate from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionCreate';
import AsyncCorpusSuggestionShow from 'src/Core/Collections/CorpusSuggestions/CorpusSuggestionShow';
import AsyncNotificationList from 'src/Core/Collections/Notifications/NotificationList';
import AsyncPollList from 'src/Core/Collections/Polls/PollList';
import AsyncPollCreate from 'src/Core/Collections/Polls/PollCreate';
import AsyncUserList from 'src/Core/Collections/Users/UserList';
import AsyncUserShow from 'src/Core/Collections/Users/UserShow';
import withLastRoute from './withLastRoute';

export const getResourceObjects = (permissions) => compact(flatten([
  {
    name: 'words',
    key: 'words',
    list: withLastRoute(AsyncWordList),
    show: withLastRoute(AsyncWordShow),
    icon: () => <>📗</>,
  },
  {
    name: 'examples',
    key: 'examples',
    list: AsyncExampleList,
    show: AsyncExampleShow,
    icon: () => <>📘</>,
  },
  {
    name: 'corpora',
    key: 'corpora',
    options: { label: 'Corpora' },
    list: withLastRoute(AsyncCorpusList),
    show: withLastRoute(AsyncCorpusShow),
    create: null,
    icon: () => <>📚</>,
  },
  {
    name: 'wordSuggestions',
    key: 'wordSuggestions',
    options: { label: 'Word Suggestions' },
    list: withLastRoute(AsyncWordSuggestionList),
    edit: withLastRoute(AsyncWordSuggestionEdit),
    create: withLastRoute(AsyncWordSuggestionCreate),
    show: withLastRoute(AsyncWordSuggestionShow),
    icon: () => <>📒</>,
  },
  {
    name: 'exampleSuggestions',
    key: 'exampleSuggestions',
    options: { label: 'Example Suggestions' },
    list: withLastRoute(AsyncExampleSuggestionList),
    edit: withLastRoute(AsyncExampleSuggestionEdit),
    create: withLastRoute(AsyncExampleSuggestionCreate),
    show: withLastRoute(AsyncExampleSuggestionShow),
    icon: () => <>📕</>,
  },
  {
    name: 'corpusSuggestions',
    key: 'corpusSuggestions',
    options: { label: 'Corpus Suggestions' },
    list: withLastRoute(AsyncCorpusSuggestionList),
    edit: withLastRoute(AsyncCorpusSuggestionEdit),
    create: withLastRoute(AsyncCorpusSuggestionCreate),
    show: withLastRoute(AsyncCorpusSuggestionShow),
    icon: () => <>📓</>,
  },
  {
    name: 'notifications',
    key: 'notifications',
    options: { label: 'Platform Notifications' },
    list: withLastRoute(AsyncNotificationList),
    icon: () => <>🔔</>,
  },
  {
    name: 'polls',
    key: 'polls',
    options: { label: 'Constructed Term Polls' },
    list: withLastRoute(AsyncPollList),
    create: withLastRoute(AsyncPollCreate),
    icon: () => <>🗳</>,
  },
  hasAdminPermissions(permissions, [
    {
      name: 'users',
      key: 'users',
      list: withLastRoute(AsyncUserList),
      show: withLastRoute(AsyncUserShow),
      icon: () => <>👩🏾</>,
    },
  ]),
]));
