import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  Responsive,
  ListProps,
  CreateProps,
  SimpleForm,
  EditProps,
  Pagination,
  Empty,
  FunctionField,
} from 'react-admin';
import Icon from '@material-ui/icons/More';
import {
  ArrayPreview,
  CompleteWordPreview,
  BulkSuggestionActions,
  HeadwordField,
  IdField,
  ListActions,
  Select,
  WordClassTextField,
  ConstructedTermEdit as Edit,
  ConstructedTermCreate as Create,
  WordPanel,
  ReviewPreview,
  SourceField,
} from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';

export const ConstructedTermIcon = Icon;

export const ConstructedTermList = (props: ListProps): ReactElement => {
  const { permissions } = props;

  return (
    <List
      {...props}
      title="Constructed terms"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid expand={<WordPanel />}>
            <CompleteWordPreview label="Word Status" />
            <ReviewPreview label="You Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid expand={<WordPanel />}>
            <SourceField label="Source" source="source" />
            <CompleteWordPreview label="Word Status" />
            <ReviewPreview label="You Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <WordClassTextField label="Part of Speech" source="wordClass" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
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
