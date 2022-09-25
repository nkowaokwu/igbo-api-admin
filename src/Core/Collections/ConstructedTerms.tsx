import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  Responsive,
  ListProps,
  CreateProps,
  SimpleForm,
  EditProps,
  ShowProps,
  SimpleShowLayout,
} from 'react-admin';
import Icon from '@material-ui/icons/More';
import {
  ArrayPreview,
  CompleteWordPreview,
  HeadwordField,
  IdField,
  ListActions,
  Select,
  WordClassTextField,
  WordShow as Show,
  ConstructedTermEdit as Edit,
  ConstructedTermCreate as Create,
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
      pagination={false}
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

const ConstructedTermTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Constructed Term '}
    {record ? `"${record.word}"` : ''}
  </span>
);

export const ConstructedTermShow = (props: ShowProps): ReactElement => (
  <Show title={<ConstructedTermTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export const ConstructedTermEdit = (props: EditProps): ReactElement => (
  <Edit title={<ConstructedTermTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Edit>
);

export const ConstructedTermCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Constructed term" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);
