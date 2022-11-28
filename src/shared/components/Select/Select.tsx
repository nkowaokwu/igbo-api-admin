import React, { ReactElement, useState } from 'react';
import { compact, flatten, get } from 'lodash';
import pluralize from 'pluralize';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  AddIcon,
  AtSignIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  NotAllowedIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { MergeType, Person, Link as LinkIcon } from '@mui/icons-material';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { useRedirect } from 'react-admin';
import { push } from 'react-router-redux';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import ActionTypes from 'src/shared/constants/ActionTypes';
import { hasAdminOrMergerPermissions, hasAdminPermissions } from 'src/shared/utils/permissions';
import { determineCreateSuggestionRedirection } from 'src/shared/utils';
import actionsMap from 'src/shared/constants/actionsMap';
import Collection from 'src/shared/constants/Collections';
import View from 'src/shared/constants/Views';
import Requirements from 'src/backend/shared/constants/Requirements';
import { TWITTER_APP_URL } from 'src/Core/constants';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
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
  const redirect = useRedirect();
  const toast = useToast();
  useFirebaseUid(setUid);
  const hasEnoughApprovals = (
    resource !== Collection.WORD_SUGGESTIONS
    || (record?.approvals?.length || 0) >= Requirements.MINIMUM_REQUIRED_APPROVALS
  );

  const clearConfirmOpen = () => {
    setAction(null);
  };

  const userCollectionOptions = [
    {
      value: 'view',
      label: (() => (
        <span>
          <Person className="-ml-1 mr-0" />
          View User
        </span>
      ))(),
      onSelect: () => redirect(View.SHOW, '/users', record.uid),
    },
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
        label: (() => (
          <span>
            <MergeType className="-ml-1 mr-0" />
            Merge
          </span>
        ))(),
        onSelect: () => setAction(actionsMap.Merge),
        props: {
          isDisabled: !hasEnoughApprovals,
          tooltipMessage: !hasEnoughApprovals
            ? `You are unable to merge this document until there 
            are at least ${pluralize('approval', Requirements.MINIMUM_REQUIRED_APPROVALS, true)} `
            : '',
        },
      },
    ])),
    (record.merged ? null : [{
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
    {
      value: 'notify',
      label: (() => (
        <span>
          <AtSignIcon className="mr-2" />
          Notify Editors
        </span>
      ))(),
      onSelect: () => setAction(actionsMap.Notify),
    }]),
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
          {`Request to Delete ${resource === Collection.WORDS
            ? 'Word'
            : resource === Collection.EXAMPLES
              ? 'Example'
              : 'Corpus'}`}
        </span>
      ))(),
      onSelect: () => setAction(actionsMap[ActionTypes.REQUEST_DELETE]),
    },
  ]));

  const pollCollectionOptions = [
    {
      value: 'createConstructedTerm',
      label: (() => (
        <span>
          <AddIcon className="mr-2" />
          Create Constructed Term
        </span>
      ))(),
      onSelect: ({ push }) => (
        determineCreateSuggestionRedirection({
          record: {
            id: 'default',
            word: get(record, 'igboWord'),
            attributes: {
              isConstructedTerm: true,
            },
            twitterPollId: (get(record, 'id') as string) || '',
            examples: [],
          },
          resource: Collection.POLLS,
          push,
        })
      ),
    },
    {
      value: 'viewPoll',
      label: (() => (
        <span>
          <ViewIcon className="mr-2" />
          Go to Tweet
        </span>
      ))(),
      onSelect: () => {
        window.location.href = `${TWITTER_APP_URL}/${get(record, 'id')}`;
      },
    },
    {
      value: 'deletePoll',
      label: (() => (
        <span className="text-red-500">
          <DeleteIcon className="mr-2" />
          Delete Poll
        </span>
      ))(),
      onSelect: () => setAction(actionsMap[ActionTypes.DELETE_POLL]),
    },
  ];

  const initialOptions = resource === Collection.USERS
    ? userCollectionOptions
    : (
      resource === Collection.WORD_SUGGESTIONS
      || resource === Collection.EXAMPLE_SUGGESTIONS
      || resource === Collection.CORPUS_SUGGESTIONS
    )
      ? suggestionCollectionOptions
      : resource === Collection.POLLS
        ? pollCollectionOptions
        : mergedCollectionOptions;

  const options = [
    ...initialOptions,
    {
      value: 'copyURL',
      label: (() => (
        <span>
          <LinkIcon className="mr-2" />
          Copy Document URL
        </span>
      ))(),
      onSelect: () => copyToClipboard({
        copyText: `${window.location.origin}/#/${resource}/${record.id}/show`,
        successMessage: 'Document URL has been copied to your clipboard',
      }, toast),
    },
  ];

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
      <Menu data-test="test-select-options" label="Editor's Action">
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
          {options.map(({
            value = '',
            label,
            onSelect,
            props = {},
          }) => (
            <Tooltip key={value} label={props.tooltipMessage}>
              <Box>
                <MenuItem
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
                  {...props}
                >
                  {label}
                </MenuItem>
              </Box>
            </Tooltip>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};

export default withRouter(connect(null, {
  push,
})(Select));
