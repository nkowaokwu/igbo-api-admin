import { compact, flatten } from 'lodash';
import Loadable from 'react-loadable';
import { WordIcon } from 'src/Core/Collections/Words';
import { ExampleIcon } from 'src/Core/Collections/Examples';
import { WordSuggestionIcon } from 'src/Core/Collections/WordSuggestions';
import { ExampleSuggestionIcon } from 'src/Core/Collections/ExampleSuggestions';
import { GenericWordIcon } from 'src/Core/Collections/GenericWords';
import { NotificationIcon } from 'src/Core/Collections/Notifications';
import { UserIcon } from 'src/Core/Collections/Users';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import PlatformLoader from './PlatformLoader';

const AsyncWordList = Loadable({
  loader: () => import('src/Core/Collections/Words/WordList'),
  loading: PlatformLoader,
});
const AsyncWordShow = Loadable({
  loader: () => import('src/Core/Collections/Words/WordShow'),
  loading: PlatformLoader,
});
const AsyncExampleList = Loadable({
  loader: () => import('src/Core/Collections/Examples/ExampleList'),
  loading: PlatformLoader,
});
const AsyncExampleShow = Loadable({
  loader: () => import('src/Core/Collections/Examples/ExampleShow'),
  loading: PlatformLoader,
});
const AsyncCorpusList = Loadable({
  loader: () => import('src/Core/Collections/Corpora/CorpusList'),
  loading: PlatformLoader,
});
const AsyncCorpusShow = Loadable({
  loader: () => import('src/Core/Collections/Corpora/CorpusShow'),
  loading: PlatformLoader,
});
const AsyncWordSuggestionList = Loadable({
  loader: () => import('src/Core/Collections/WordSuggestions/WordSuggestionList'),
  loading: PlatformLoader,
});
const AsyncWordSuggestionEdit = Loadable({
  loader: () => import('src/Core/Collections/WordSuggestions/WordSuggestionEdit'),
  loading: PlatformLoader,
});
const AsyncWordSuggestionCreate = Loadable({
  loader: () => import('src/Core/Collections/WordSuggestions/WordSuggestionCreate'),
  loading: PlatformLoader,
});
const AsyncWordSuggestionShow = Loadable({
  loader: () => import('src/Core/Collections/WordSuggestions/WordSuggestionShow'),
  loading: PlatformLoader,
});
const AsyncExampleSuggestionList = Loadable({
  loader: () => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionList'),
  loading: PlatformLoader,
});
const AsyncExampleSuggestionEdit = Loadable({
  loader: () => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionEdit'),
  loading: PlatformLoader,
});
const AsyncExampleSuggestionCreate = Loadable({
  loader: () => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionCreate'),
  loading: PlatformLoader,
});
const AsyncExampleSuggestionShow = Loadable({
  loader: () => import('src/Core/Collections/ExampleSuggestions/ExampleSuggestionShow'),
  loading: PlatformLoader,
});
const AsyncCorpusSuggestionList = Loadable({
  loader: () => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionList'),
  loading: PlatformLoader,
});
const AsyncCorpusSuggestionEdit = Loadable({
  loader: () => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionEdit'),
  loading: PlatformLoader,
});
const AsyncCorpusSuggestionCreate = Loadable({
  loader: () => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionCreate'),
  loading: PlatformLoader,
});
const AsyncCorpusSuggestionShow = Loadable({
  loader: () => import('src/Core/Collections/CorpusSuggestions/CorpusSuggestionShow'),
  loading: PlatformLoader,
});
const AsyncNotificationList = Loadable({
  loader: () => import('src/Core/Collections/Notifications/NotificationList'),
  loading: PlatformLoader,
});
const AsyncPollList = Loadable({
  loader: () => import('src/Core/Collections/Polls/PollList'),
  loading: PlatformLoader,
});
const AsyncPollCreate = Loadable({
  loader: () => import('src/Core/Collections/Polls/PollCreate'),
  loading: PlatformLoader,
});
const AsyncGenericWordList = Loadable({
  loader: () => import('src/Core/Collections/GenericWords/GenericWordList'),
  loading: PlatformLoader,
});
const AsyncGenericWordEdit = Loadable({
  loader: () => import('src/Core/Collections/GenericWords/GenericWordEdit'),
  loading: PlatformLoader,
});
const AsyncGenericWordShow = Loadable({
  loader: () => import('src/Core/Collections/GenericWords/GenericWordShow'),
  loading: PlatformLoader,
});
const AsyncUserList = Loadable({
  loader: () => import('src/Core/Collections/Users/UserList'),
  loading: PlatformLoader,
});
const AsyncUserShow = Loadable({
  loader: () => import('src/Core/Collections/Users/UserShow'),
  loading: PlatformLoader,
});

export const getResourceObjects = (permissions) => compact(flatten([
  {
    name: 'words',
    key: 'words',
    list: AsyncWordList,
    show: AsyncWordShow,
    icon: WordIcon,
  },
  {
    name: 'examples',
    key: 'examples',
    list: AsyncExampleList,
    show: AsyncExampleShow,
    icon: ExampleIcon,
  },
  {
    name: 'corpora',
    key: 'corpora',
    options: { label: 'Corpora' },
    list: AsyncCorpusList,
    show: AsyncCorpusShow,
    create: null,
  },
  {
    name: 'wordSuggestions',
    key: 'wordSuggestions',
    options: { label: 'Word Suggestions' },
    list: AsyncWordSuggestionList,
    edit: AsyncWordSuggestionEdit,
    create: AsyncWordSuggestionCreate,
    show: AsyncWordSuggestionShow,
    icon: WordSuggestionIcon,
  },
  {
    name: 'exampleSuggestions',
    key: 'exampleSuggestions',
    options: { label: 'Example Suggestions' },
    list: AsyncExampleSuggestionList,
    edit: AsyncExampleSuggestionEdit,
    create: AsyncExampleSuggestionCreate,
    show: AsyncExampleSuggestionShow,
    icon: ExampleSuggestionIcon,
  },
  {
    name: 'corpusSuggestions',
    key: 'corpusSuggestions',
    options: { label: 'Corpus Suggestions' },
    list: AsyncCorpusSuggestionList,
    edit: AsyncCorpusSuggestionEdit,
    create: AsyncCorpusSuggestionCreate,
    show: AsyncCorpusSuggestionShow,
  },
  {
    name: 'notifications',
    key: 'notifications',
    options: { label: 'Platform Notifications' },
    list: AsyncNotificationList,
    icon: NotificationIcon,
  },
  {
    name: 'polls',
    key: 'polls',
    options: { label: 'Constructed Term Polls' },
    list: AsyncPollList,
    create: AsyncPollCreate,
  },
  hasAdminPermissions(permissions, [{
    name: 'genericWords',
    key: 'genericWords',
    options: { label: 'Generic Words' },
    list: AsyncGenericWordList,
    edit: AsyncGenericWordEdit,
    show: AsyncGenericWordShow,
    icon: GenericWordIcon,
  },
  {
    name: 'users',
    key: 'users',
    list: AsyncUserList,
    show: AsyncUserShow,
    icon: UserIcon,
  }]),
]));
