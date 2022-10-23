import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  Responsive,
  ListProps,
  BulkDeleteButton,
} from 'react-admin';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import {
  ArrayPreview,
  ReviewPreview,
  ListActions,
  Pagination,
  Select,
} from 'src/shared/components';
import Collection from 'src/shared/constants/Collections';
import Empty from '../../Empty';

const GenericWordsBulkActions = (props): ReactElement => (
  <BulkDeleteButton {...props} />
);

const GenericWordList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Generic Words"
      actions={<ListActions />}
      pagination={<Pagination />}
      empty={<Empty />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <GenericWordsBulkActions />)}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid>
            <ReviewPreview label="You Reviewed" />
            <TextField label="Word" source="word" />
            <ArrayPreview label="Definitions" source="definitions" />
            <Select collection={Collection.WORDS} label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <ReviewPreview label="You Reviewed" />
            <TextField label="Word" source="word" />
            <TextField label="Part of Speech" source="wordClass" />
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
            <Select collection={Collection.WORDS} label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

export default GenericWordList;
