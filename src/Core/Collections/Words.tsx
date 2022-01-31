import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  TextField,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Book';
import {
  ArrayPreview,
  AudioRecordingPreview,
  CompleteWordPreview,
  HeadwordField,
  StandardIgboPreview,
  ListActions,
  Pagination,
  Select,
  WordClassTextField,
  WordPanel,
  WordShow as Show,
} from '../../shared/components';
import { WordShowActions } from '../../actions/wordActions';
import Empty from '../Empty';

export const WordIcon = Icon;

export const WordList = (props: ListProps): ReactElement => {
  const { permissions } = props;

  return (
    <List
      {...props}
      actions={<ListActions />}
      bulkActionButtons={false}
      pagination={<Pagination />}
      empty={<Empty />}
    >
      <Responsive
        small={(
          <Datagrid expand={<WordPanel />}>
            <HeadwordField label="Headword" source="word" />
            <CompleteWordPreview label="Is Complete Word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid expand={<WordPanel />}>
            <AudioRecordingPreview label="Audio Recording" />
            <StandardIgboPreview label="Is Standard Igbo" />
            <HeadwordField label="Headword" source="word" />
            <WordClassTextField label="Part of Speech" source="wordClass" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
            <ArrayPreview label="Stems" source="stems" />
            <TextField label="Id" source="id" />
            <CompleteWordPreview label="Is Complete Word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

const WordTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>{`Word ${record ? `"${record.word}"` : ''}`}</span>
);

export const WordShow = (props: ShowProps): ReactElement => (
  <Show
    actions={<WordShowActions />}
    title={<WordTitle />}
    {...props}
  >
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);
