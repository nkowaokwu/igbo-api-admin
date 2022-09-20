import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  Responsive,
  ListProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Book';
import {
  ArrayPreview,
  CompleteWordPreview,
  HeadwordField,
  IdField,
  ListActions,
  Select,
  WordClassTextField,
  WordPanel,
} from 'src/shared/components';

export const ConstructedTermIcon = Icon;

export const ConstructedTermList = (props: ListProps): ReactElement => {
  const { permissions } = props;

  return (
    <List
      {...props}
      actions={<ListActions />}
      bulkActionButtons={false}
      // pagination={<Pagination />}
      // empty={<Empty />}
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
