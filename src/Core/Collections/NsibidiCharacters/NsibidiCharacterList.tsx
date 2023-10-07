import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps } from 'react-admin';
import { BulkSuggestionActions, Select, ListActions, Pagination, ArrayPreview } from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const NsibidiCharacterList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <>
      <List
        {...props}
        title="Nsịbịdị Characters"
        actions={<ListActions />}
        bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
        pagination={<Pagination />}
        empty={<Empty />}
        sort={{ field: 'approvals', order: 'DESC' }}
      >
        <Responsive
          small={
            <Datagrid>
              <Select collection={Collection.NSIBIDI_CHARACTERS} label="Editor's Actions" permissions={permissions} />
              <TextField label="Nsịbịdị" source="nsibidi" className="akagu" />
            </Datagrid>
          }
          medium={
            <Datagrid>
              <Select collection={Collection.NSIBIDI_CHARACTERS} label="Editor's Actions" permissions={permissions} />
              <TextField label="Nsịbịdị" source="nsibidi" className="akagu" />
              <ArrayPreview label="Radicals" source="radicals" />
            </Datagrid>
          }
        />
      </List>
    </>
  );
};

export default NsibidiCharacterList;
