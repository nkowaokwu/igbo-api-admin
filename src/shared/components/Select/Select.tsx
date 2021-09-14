import React, { ReactElement, useState } from 'react';
import { compact, flatten } from 'lodash';
import {
  AddIcon,
  CheckCircleIcon,
  DeleteIcon,
  EditIcon,
  NotAllowedIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import Select from 'react-select';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Confirmation from '../Confirmation';
import { hasAdminOrMergerPermissions, hasAdminPermissions } from '../../utils/permissions';
import { determineCreateSuggestionRedirection } from '../../utils';
import actionsMap from '../../constants/actionsMap';
import useFirebaseUid from '../../../hooks/useFirebaseUid';
import Collection from '../../constants/Collections';
import View from '../../constants/Views';
import SelectInterface from './SelectInterface';

const CustomSelect = ({
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
    { value: 'user', label: 'Set as User', onSelect: ({ setAction }) => setAction(actionsMap.Convert) },
    { value: 'editor', label: 'Set as Editor', onSelect: ({ setAction }) => setAction(actionsMap.Convert) },
    { value: 'merger', label: 'Set as Merger', onSelect: ({ setAction }) => setAction(actionsMap.Convert) },
    { value: 'admin', label: 'Set as Admin', onSelect: ({ setAction }) => setAction(actionsMap.Convert) },
    {
      value: 'assignGroup',
      label: 'Assign Editing Group',
      onSelect: ({ setAction }) => setAction(actionsMap.AssignEditingGroup),
    },
    hasAdminPermissions(permissions, {
      value: 'deleteUser',
      label: 'Delete User',
      onSelect: ({ setAction }) => setAction(actionsMap.DeleteUser),
    }),
  ];

  const suggestionCollectionOptions = compact(flatten([
    hasAdminOrMergerPermissions(permissions, (record.merged ? null : [
      {
        value: 'merge',
        label: 'Merge',
        onSelect: ({ setAction }) => setAction(actionsMap.Merge),
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
      onSelect: ({ setAction }) => setAction(actionsMap.Approve),
    },
    {
      value: 'deny',
      label: (() => (
        <span className="text-yellow-800">
          <NotAllowedIcon className="mr-2" />
          {record?.denials?.includes(uid) ? 'Denied' : 'Deny'}
        </span>
      ))(),
      onSelect: ({ setAction }) => setAction(actionsMap.Deny),
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
        onSelect: ({ setAction }) => setAction(actionsMap.Delete),
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
      onSelect: ({ setAction }) => setAction(actionsMap.Combine),
    }] : null),
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
      <Select
        className="test-select-options"
        options={options}
        styles={{
          control: (styles) => ({ ...styles, width: '12em' }),
        }}
        placeholder="Action"
        onChange={({ onSelect, value }) => {
          setValue(value);
          onSelect({
            push,
            setAction,
            resource,
            record,
            id: record.id,
          });
        }}
        label="Editor's Action"
      />
    </>
  );
};

export default withRouter(connect(null, {
  push,
})(CustomSelect));
