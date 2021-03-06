import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Book';
import {
  ArrayPreview,
  CompleteWordPreview,
  HeadwordField,
  IdField,
  ListActions,
  Pagination,
  Select,
  WordClassTextField,
  WordPanel,
  WordShow as Show,
} from 'src/shared/components';
import { WordShowActions } from 'src/actions/wordActions';
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
            <CompleteWordPreview label="Word Status" />
            <HeadwordField label="Headword" source="word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid expand={<WordPanel />}>
            <CompleteWordPreview label="Word Status" />
            <HeadwordField label="Headword" source="word" />
            <WordClassTextField label="Part of Speech" source="wordClass" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
            <ArrayPreview label="Stems" source="stems" />
            <IdField label="Id" source="id" />
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
