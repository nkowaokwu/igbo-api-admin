import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  SimpleForm,
  FunctionField,
  TextField,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
  EditProps,
  CreateProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Spellcheck';
import {
  ArrayPreview,
  AudioRecordingPreview,
  BulkSuggestionActions,
  CompleteWordPreview,
  HeadwordField,
  ListActions,
  Pagination,
  ReviewPreview,
  Select,
  StandardIgboPreview,
  WordClassTextField,
  WordPanel,
  WordShow as Show,
  WordSuggestionCreate as Create,
  WordSuggestionEdit as Edit,
} from '../../shared/components';
import { hasAdminOrMergerPermissions } from '../../shared/utils/permissions';
import Empty from '../Empty';

export const WordSuggestionIcon = Icon;

export const WordSuggestionList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Word Suggestions"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid expand={<WordPanel />}>
            <ReviewPreview label="Already Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <CompleteWordPreview label="Is Complete Word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid expand={<WordPanel />}>
            <AudioRecordingPreview label="Audio Recording" />
            <StandardIgboPreview label="Is Standard Igbo" />
            <ReviewPreview label="Already Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <WordClassTextField label="Part of Speech" source="wordClass" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
            {/* TODO: move these out to reusable component */}
            <FunctionField
              label="Approvals"
              render={(record) => (
                <span data-test="approval">{record.approvals.length}</span>
              )}
            />
            <FunctionField
              label="Denials"
              render={(record) => (
                <span data-test="denial">{record.denials.length}</span>
              )}
            />
            <TextField label="Id" source="id" />
            <TextField label="Origin Word Id" source="originalWordId" />
            <CompleteWordPreview label="Is Complete Word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

const WordSuggestionTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Word Suggestion '}
    {record ? `"${record.word}"` : ''}
  </span>
);

export const WordSuggestionShow = (props: ShowProps): ReactElement => (
  <Show title={<WordSuggestionTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export const WordSuggestionEdit = (props: EditProps): ReactElement => (
  <Edit title={<WordSuggestionTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Edit>
);

export const WordSuggestionCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Word Suggestion" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);
