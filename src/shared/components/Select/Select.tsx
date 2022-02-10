import React, { ReactElement, useState } from 'react';
import { compact, flatten } from 'lodash';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  AddIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  NotAllowedIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import ActionTypes from 'src/shared/constants/ActionTypes';
import { hasAdminOrMergerPermissions, hasAdminPermissions } from 'src/shared/utils/permissions';
import { determineCreateSuggestionRedirection } from 'src/shared/utils';
import actionsMap from 'src/shared/constants/actionsMap';
import Collection from 'src/shared/constants/Collections';
import View from 'src/shared/constants/Views';
import Confirmation from '../Confirmation';
import SelectInterface from './SelectInterface';

const Select = ({
  collection,
  record = { id: '', merged: null },
  permissions,
  resource = '',
  push,
  view,
}: SelectInterface): ReactElement => {
  const [value, setValue] = useState(null);
  const [action, setAction] = useState(null);
  const [uid, setUid] = useState('');
  useFirebaseUid(setUid);

  const clearConfirmOpen = () => {
    setAction(null);
  };

  const userCollectionOptions = [
    { value: 'user', label: 'Set as User', onSelect: () => setAction(actionsMap.Convert) },
    { value: 'editor', label: 'Set as Editor', onSelect: () => setAction(actionsMap.Convert) },
    { value: 'merger', label: 'Set as Merger', onSelect: () => setAction(actionsMap.Convert) },
    { value: 'admin', label: 'Set as Admin', onSelect: () => setAction(actionsMap.Convert) },
    {
      value: 'assignGroup',
      label: 'Assign Editing Group',
      onSelect: () => setAction(actionsMap.AssignEditingGroup),
    },
    hasAdminPermissions(permissions, {
      value: 'deleteUser',
      label: 'Delete User',
      onSelect: () => setAction(actionsMap.DeleteUser),
    }),
  ];

  const suggestionCollectionOptions = compact(flatten([
    hasAdminOrMergerPermissions(permissions, (record.merged ? null : [
      {
        value: 'merge',
        label: 'Merge',
        onSelect: () => setAction(actionsMap.Merge),
      },
    ])),
    {
      value: 'edit',
      label: (() => (
        <span>
          <EditIcon className="mr-2" />
          Edit
        </span>
      ))(),
      onSelect: ({ push, resource, id }) => push(actionsMap.Edit(resource, id)),
    },
    view === View.SHOW ? null : (
      {
        value: 'view',
        label: (() => (
          <span>
            <ViewIcon className="mr-2" />
            View
          </span>
        ))(),
        onSelect: ({ push, resource, id }) => push(actionsMap.View(resource, id)),
      }
    ),
    {
      value: 'approve',
      label: (() => (
        <span className="text-green-500">
          <CheckCircleIcon className="mr-2" />
          {record?.approvals?.includes(uid) ? 'Approved' : 'Approve'}
        </span>
      ))(),
      onSelect: () => setAction(actionsMap.Approve),
    },
    {
      value: 'deny',
      label: (() => (
        <span className="text-yellow-800">
          <NotAllowedIcon className="mr-2" />
          {record?.denials?.includes(uid) ? 'Denied' : 'Deny'}
        </span>
      ))(),
      onSelect: () => setAction(actionsMap.Deny),
    },
    hasAdminOrMergerPermissions(permissions, (record.merged ? null : [
      {
        value: 'delete',
        label: (() => (
          <span className="text-red-500">
            <DeleteIcon className="mr-2" />
            Delete
          </span>
        ))(),
        onSelect: () => setAction(actionsMap.Delete),
      },
    ])),
  ]));

  const mergedCollectionOptions = compact(flatten([
    {
      value: 'view',
      label: (() => (
        <span>
          <ViewIcon className="mr-2" />
          View
        </span>
      ))(),
      onSelect: ({ push, resource, id }) => push(actionsMap.View(resource, id)),
    },
    {
      value: 'suggestNewEdit',
      label: (() => (
        <span>
          <AddIcon className="mr-2" />
          Suggest New Edit
        </span>
      ))(),
      onSelect: ({ record, resource, push }) => (
        determineCreateSuggestionRedirection({ record, resource, push })
      ),
    },
    hasAdminPermissions(permissions, resource === Collection.WORDS ? [{
      value: 'combineWord',
      label: 'Combine Word Into...',
      onSelect: () => setAction(actionsMap.Combine),
    }] : null),
    {
      value: 'requestDelete',
      label: (() => (
        <span className="text-red-500">
          <DeleteIcon className="mr-2" />
          {`Request to Delete ${resource === Collection.WORDS ? 'Word' : 'Example'}`}
        </span>
      ))(),
      onSelect: () => setAction(actionsMap[ActionTypes.REQUEST_DELETE]),
    },
  ]));

  const options = resource === Collection.USERS
    ? userCollectionOptions
    : resource !== Collection.WORDS && resource !== Collection.EXAMPLES
      ? suggestionCollectionOptions
      : mergedCollectionOptions;

  return (
    <>
      <Confirmation
        collection={collection}
        resource={resource}
        record={record}
        action={action}
        selectionValue={value}
        onClose={clearConfirmOpen}
        view={view}
      />
      <Menu className="test-select-options" label="Editor's Action">
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          data-test={`select-menu-${resource}`}
          role="button"
          fontWeight="normal"
          backgroundColor="white"
          borderWidth="1px"
          borderColor="green.600"
          borderRadius="md"
          _hover={{
            backgroundColor: 'gray.100',
            color: 'gray.800',
          }}
          _active={{
            backgroundColor: 'gray.100',
            color: 'gray.800',
          }}
        >
          Actions
        </MenuButton>
        <MenuList>
          {options.map(({ value, label, onSelect }) => (
            <MenuItem
              key={value}
              value={value}
              onClick={() => {
                setValue(value);
                onSelect({
                  push,
                  resource,
                  record,
                  id: record.id,
                });
              }}
            >
              {label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};

export default withRouter(connect(null, {
  push,
})(Select));
