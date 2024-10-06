import { ExampleSuggestionData } from 'src/backend/controllers/utils/interfaces/exampleSuggestionInterfaces';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import Collections from 'src/shared/constants/Collection';

export interface Notification {
  initiator: {
    email: string;
    displayName: string;
    photoURL: string;
    uid: string;
  };
  title: string;
  message: string;
  data: any;
  type: string;
  recipient: string;
  opened: boolean;
  link: string;
  created_at?: number;
}

export interface UpdatedRoleNotificationData {
  to: [string];
  displayName: string;
  role: UserRoles;
}

export interface DocumentDeletionRequestNotification {
  translator: string;
  translatorEmail: string;
  note: string;
  resource: string;
  id: string;
  word: string;
  definition: string;
}

export interface AudioPronunciationDeletionNotification {
  to: string;
  firstDenierEmail: string;
  secondDenierEmail: string;
  example: Partial<ExampleSuggestionData>;
  deletedAudioPronunciation: string;
}

export interface MemberInvite {
  to: string;
  projectId: string;
  permissionId: string;
  acceptUrl: string;
  projectTitle: string;
  grantingAdmin: string;
}

export interface MemberAcceptedInvite {
  to: string[];
  projectId: string;
  projectTitle: string;
  userEmail: string;
}

export interface DocumentUpdateNotification {
  author: string;
  to: string;
  translator: string;
  translatorEmail: string;
  type: string;
  resource: Collections;
  id: string;
  word: string;
}

export interface ExportedData {
  to: string;
  exportFileName: string;
  downloadUrl: string;
}
