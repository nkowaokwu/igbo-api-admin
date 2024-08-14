import React, { ReactElement, useState } from 'react';
import { compact, flatten, get, omit } from 'lodash';
import pluralize from 'pluralize';
import { Box, Button, Menu, MenuButton, MenuList, MenuItem, Spinner, Tooltip, useToast } from '@chakra-ui/react';
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
import Collection from 'src/shared/constants/Collection';
import View from 'src/shared/constants/Views';
import Requirements from 'src/backend/shared/constants/Requirements';
import { TWITTER_APP_URL } from 'src/Core/constants';
import UserRoles from 'src/backend/shared/constants/UserRoles';
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
  const [isLoading, setIsLoading] = useState(false);
  /* Required to determine when to render the confirmation model */
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const redirect = useRedirect();
  const toast = useToast();
  useFirebaseUid(setUid);
  const hasEnoughApprovals =
    !!window.Cypress ||
    resource !== Collection.WORD_SUGGESTIONS ||
    (record?.approvals?.length || 0) >= Requirements.MINIMUM_REQUIRED_APPROVALS;

  const clearConfirmOpen = () => {
    setIsConfirmOpen(false);
  };

  const withConfirm = (value: any) => {
    setIsConfirmOpen(true);
    return value;
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
    { value: UserRoles.USER, label: 'Set as User', onSelect: () => withConfirm(setAction(actionsMap.Convert)) },
    {
      value: UserRoles.CROWDSOURCER,
      label: 'Set as Crowdsourcer',
      onSelect: () => withConfirm(setAction(actionsMap.Convert)),
    },
    {
      value: UserRoles.TRANSCRIBER,
      label: 'Set as Transcriber',
      onSelect: () => withConfirm(setAction(actionsMap.Convert)),
    },
    { value: UserRoles.EDITOR, label: 'Set as Editor', onSelect: () => withConfirm(setAction(actionsMap.Convert)) },
    { value: UserRoles.MERGER, label: 'Set as Merger', onSelect: () => withConfirm(setAction(actionsMap.Convert)) },
    {
      value: UserRoles.NSIBIDI_MERGER,
      label: 'Set as Nsịbịdị Merger',
      onSelect: () => withConfirm(setAction(actionsMap.Convert)),
    },
    { value: UserRoles.ADMIN, label: 'Set as Admin', onSelect: () => withConfirm(setAction(actionsMap.Convert)) },
    hasAdminPermissions(permissions, {
      value: 'deleteUser',
      label: 'Delete User',
      onSelect: () => withConfirm(setAction(actionsMap.DeleteUser)),
    }),
  ];

  const suggestionCollectionOptions = compact(
    flatten([
      hasAdminOrMergerPermissions(
        permissions,
        record.merged
          ? null
          : [
              {
                value: 'merge',
                label: (() => (
                  <span>
                    <MergeType className="-ml-1 mr-0" />
                    Merge
                  </span>
                ))(),
                onSelect: () => withConfirm(setAction(actionsMap.Merge)),
                props: {
                  isDisabled: !hasEnoughApprovals,
                  tooltipMessage: !hasEnoughApprovals
                    ? `You are unable to merge this document until there 
            are at least ${pluralize('approval', Requirements.MINIMUM_REQUIRED_APPROVALS, true)} `
                    : '',
                },
              },
            ],
      ),
      record.merged
        ? null
        : [
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
            view === View.SHOW
              ? null
              : {
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
              value: 'approve',
              label: (() => (
                <span className="text-green-500">
                  <CheckCircleIcon className="mr-2" />
                  {record?.approvals?.includes(uid) ? 'Approved' : 'Approve'}
                </span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap.Approve)),
            },
            {
              value: 'deny',
              label: (() => (
                <span className="text-yellow-800">
                  <NotAllowedIcon className="mr-2" />
                  {record?.denials?.includes(uid) ? 'Denied' : 'Deny'}
                </span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap.Deny)),
            },
            {
              value: 'notify',
              label: (() => (
                <span>
                  <AtSignIcon className="mr-2" />
                  Notify Editors
                </span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap.Notify)),
            },
          ],
      hasAdminOrMergerPermissions(
        permissions,
        record.merged
          ? null
          : [
              {
                value: 'delete',
                label: (() => (
                  <span className="text-red-500">
                    <DeleteIcon className="mr-2" />
                    Delete
                  </span>
                ))(),
                onSelect: () => withConfirm(setAction(actionsMap.Delete)),
              },
            ],
      ),
    ]),
  );

  const mergedCollectionOptions = compact(
    flatten([
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
        onSelect: ({ record, resource, push }) => determineCreateSuggestionRedirection({ record, resource, push }),
      },
      hasAdminPermissions(
        permissions,
        resource === Collection.WORDS
          ? [
              {
                value: 'combineWord',
                label: 'Combine Word Into...',
                onSelect: () => withConfirm(setAction(actionsMap.Combine)),
              },
            ]
          : null,
      ),
      hasAdminOrMergerPermissions(
        permissions,
        resource !== Collection.NSIBIDI_CHARACTERS
          ? {
              value: 'requestDelete',
              label: (() => (
                <span className="text-red-500">
                  <DeleteIcon className="mr-2" />
                  {`Request to Delete ${
                    resource === Collection.WORDS
                      ? 'Word'
                      : resource === Collection.EXAMPLES
                      ? 'Example'
                      : resource === Collection.CORPORA
                      ? 'Corpus'
                      : resource === Collection.TEXT_IMAGES
                      ? 'Text Image'
                      : ''
                  }`}
                </span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap[ActionTypes.REQUEST_DELETE])),
            }
          : null,
      ),
      hasAdminPermissions(
        permissions,
        resource === Collection.NSIBIDI_CHARACTERS
          ? {
              value: 'delete',
              label: (() => (
                <span className="text-red-500">
                  <DeleteIcon className="mr-2" />
                  Delete Nsịbịdị character
                </span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap[ActionTypes.DELETE])),
            }
          : null,
      ),
    ]),
  );

  const pollCollectionOptions = [
    {
      value: 'createConstructedTerm',
      label: (() => (
        <span>
          <AddIcon className="mr-2" />
          Create Constructed Term
        </span>
      ))(),
      onSelect: ({ push }) =>
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
        }),
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
      onSelect: () => withConfirm(setAction(actionsMap[ActionTypes.DELETE_POLL])),
    },
  ];

  const initialOptions =
    resource === Collection.USERS
      ? userCollectionOptions
      : resource === Collection.WORD_SUGGESTIONS ||
        resource === Collection.EXAMPLE_SUGGESTIONS ||
        resource === Collection.CORPUS_SUGGESTIONS
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
      onSelect: () =>
        copyToClipboard(
          {
            copyText: `${window.location.origin}/#/${resource}/${record.id}/show`,
            successMessage: 'Document URL has been copied to your clipboard',
          },
          toast,
        ),
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
        setIsLoading={setIsLoading}
        isOpen={isConfirmOpen}
      />
      {/* @ts-expect-error label */}
      <Menu data-test="test-select-options" label="Editor's Action">
        <MenuButton
          as={Button}
          maxWidth="160px"
          rightIcon={<ChevronDownIcon />}
          data-test="actions-menu"
          role="button"
          fontFamily="system-ui"
          fontWeight="normal"
          backgroundColor="white"
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius="md"
          isDisabled={isLoading}
          width="full"
          _hover={{
            backgroundColor: 'white',
            color: 'gray.800',
          }}
          _active={{
            backgroundColor: 'white',
            color: 'gray.800',
          }}
        >
          {isLoading ? <Spinner size="xs" /> : 'Actions'}
        </MenuButton>
        <MenuList boxShadow="xl">
          {options.map(({ value = '', label, onSelect, props = {} }) => (
            <Tooltip key={value} label={props.tooltipMessage}>
              <Box px={2}>
                <MenuItem
                  value={value}
                  outline="none"
                  boxShadow="none"
                  border="none"
                  px={1}
                  fontFamily="system-ui"
                  borderRadius="md"
                  onClick={() => {
                    setValue(value);
                    onSelect({
                      push,
                      resource,
                      record,
                      id: record.id,
                    });
                  }}
                  {...omit(props, ['tooltipMessage'])}
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

export default withRouter(
  connect(null, {
    push,
  })(Select),
);
