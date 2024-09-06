import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps } from 'react-admin';
import { Select, ListActions, Pagination, ArrayPreview } from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import Empty from '../../Empty';

const NsibidiCharacterList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <>
      <List
        {...props}
        title="Nsịbịdị Characters"
        actions={<ListActions />}
        bulkActionButtons={false}
        pagination={<Pagination />}
        empty={<Empty />}
        sort={{ field: 'approvals', order: 'DESC' }}
      >
        <Responsive
          small={
            <Datagrid>
              <Select collection={Collection.NSIBIDI_CHARACTERS} permissions={permissions} />
              <TextField label="Nsịbịdị" source="nsibidi" className="akagu" />
            </Datagrid>
          }
          medium={
            <Datagrid>
              <Select collection={Collection.NSIBIDI_CHARACTERS} permissions={permissions} />
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
