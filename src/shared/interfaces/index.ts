import {
  CreateProps,
  ListActionsProps,
  OnFailure,
  OnSuccess,
  Record,
  RedirectionSideEffect,
  TransformData,
} from 'react-admin';
import Collections from '../constants/Collections';

export interface EditFormProps {
  view: string,
  record: Record,
  save: (record: Partial<Record>, redirect: RedirectionSideEffect, callbacks?: {
    onSuccess?: OnSuccess;
    onFailure?: OnFailure;
    transform?: TransformData;
  }) => void,
  resource: Collections,
  history: any,
  isPreExistingSuggestion?: boolean,
};

export interface CommentsProps {
  editorsNotes: string,
  userComments: string,
  showUserComments?: boolean,
};

export interface ArrayPreviewProps {
  source: string,
  label?: string,
  record?: Record,
  resource: Collections,
};

export interface WordClassTextFieldProps {
  source: string,
  label?: string,
  record?: Record,
}

export interface ArrayLengthProps {
  source: string,
  label?: string,
  record?: [],
};

export interface ArrayInputProps {
  source: string,
  label: string,
  individualLabel: string,
}

export interface IdFieldProps {
  label?: string,
  source: string,
  record?: Record,
}

export interface CustomListActionProps extends ListActionsProps {
  data?: Record,
};

interface History {
  location: {
    state: { [key: string]: any }
  }
};

export interface HistoryProps extends CreateProps {
  history?: History;
};
