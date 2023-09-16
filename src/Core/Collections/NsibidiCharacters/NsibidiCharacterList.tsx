import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps } from 'react-admin';
import { ArrayPreview, BulkSuggestionActions, Select, ListActions, Pagination } from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const NsibidiCharacterList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
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
            <ArrayPreview label="Definitions" source="definitions" />
            <TextField label="Word Class" source="wordClass" className="akagu" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.NSIBIDI_CHARACTERS} label="Editor's Actions" permissions={permissions} />
            <TextField label="Nsịbịdị" source="nsibidi" className="akagu" />
            <ArrayPreview label="Definitions" source="definitions" />
            <TextField label="Pronunciation" source="pronunciation" />
            <TextField label="Word Class" source="wordClass" className="akagu" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default NsibidiCharacterList;
