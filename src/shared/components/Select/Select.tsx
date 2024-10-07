import React, { ReactElement, useState } from 'react';
import { compact, flatten, get, omit } from 'lodash';
import pluralize from 'pluralize';
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Tooltip,
  useToast,
  IconButton,
  Button,
  useDisclosure,
  chakra,
} from '@chakra-ui/react';
import { FiEye, FiEdit3, FiExternalLink } from 'react-icons/fi';
import {
  LuAtSign,
  LuBan,
  LuCheckCircle2,
  LuEye,
  LuLink,
  LuMerge,
  LuMoreHorizontal,
  LuMoreVertical,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import { useRefresh } from 'ra-core';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import ActionTypes from 'src/shared/constants/ActionTypes';
import { hasAdminOrMergerPermissions, hasAdminPermissions } from 'src/shared/utils/permissions';
import { determineCreateSuggestionRedirection } from 'src/shared/utils';
import actionsMap from 'src/shared/constants/actionsMap';
import Collection from 'src/shared/constants/Collection';
import Requirements from 'src/backend/shared/constants/Requirements';
import { TWITTER_APP_URL } from 'src/Core/constants';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
import RolesDrawer from 'src/shared/components/Select/components/RolesDrawer';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import { deleteMemberInvite } from 'src/shared/InviteAPI';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import Confirmation from '../Confirmation';
import SelectInterface from './SelectInterface';

const Select = ({
  collection,
  record = { id: '', merged: null },
  permissions,
  resource = '',
  push,
  view,
  showButtonLabels,
}: SelectInterface): ReactElement => {
  const [value, setValue] = useState(null);
  const [action, setAction] = useState(null);
  const [uid, setUid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  /* Required to determine when to render the confirmation model */
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const refresh = useRefresh();
  useFirebaseUid(setUid);
  const hasEnoughApprovals =
    resource !== Collection.WORD_SUGGESTIONS ||
    (record?.approvals?.length || 0) >= Requirements.MINIMUM_REQUIRED_APPROVALS;

  const suggestionResources = [
    Collection.WORD_SUGGESTIONS,
    Collection.EXAMPLE_SUGGESTIONS,
    Collection.CORPUS_SUGGESTIONS,
    Collection.NSIBIDI_CHARACTERS,
  ];
  const mergedResources = [Collection.WORDS, Collection.EXAMPLES, Collection.CORPORA];

  const isProjectResource = resource === Collection.PROJECTS;
  const isSuggestionResource = suggestionResources.includes(resource as Collection);
  const isMergedResource = mergedResources.includes(resource as Collection);
  const isUserResource = Collection.USERS === resource;
  const isPendingResource = record?.status === EntityStatus.PENDING;

  const clearConfirmOpen = () => {
    setIsConfirmOpen(false);
  };

  const withConfirm = (value: any) => {
    setIsConfirmOpen(true);
    return value;
  };

  const handleOnNavigateToProjectAsAdmin = () => {
    window.localStorage.setItem(LocalStorageKeys.PROJECT_ID, record.id);
    window.location.reload();
  };

  const onDeleteMemberInvite = async ({ record }) => {
    try {
      await deleteMemberInvite({ email: record.email });
      toast({
        title: 'Deleted member invite',
        description: 'The member invite has been deleted.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to submit bulk upload example sentences request.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const userCollectionOptions = [
    !isPendingResource && record?.uid !== uid ? { value: 'roles', label: 'Change role', onSelect: onOpen } : null,
    isPendingResource
      ? {
          value: 'delete invite',
          label: 'Delete invite',
          onSelect: onDeleteMemberInvite,
        }
      : null,
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
                  <chakra.span display="flex" alignItems="center">
                    <LuMerge className="mr-2 inline" />
                    Finalize
                  </chakra.span>
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
              value: 'approve',
              label: (() => (
                <chakra.span display="flex" alignItems="center" className="text-green-500">
                  <LuCheckCircle2 className="mr-2 inline" />
                  {record?.approvals?.includes(uid) ? 'Approved' : 'Approve'}
                </chakra.span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap.Approve)),
            },
            {
              value: 'deny',
              label: (() => (
                <chakra.span display="flex" alignItems="center" className="text-yellow-800">
                  <LuBan className="mr-2 inline" />
                  {record?.denials?.includes(uid) ? 'Denied' : 'Deny'}
                </chakra.span>
              ))(),
              onSelect: () => withConfirm(setAction(actionsMap.Deny)),
            },
            {
              value: 'notify',
              label: (() => (
                <chakra.span display="flex" alignItems="center">
                  <LuAtSign className="mr-2 inline" />
                  Notify Editors
                </chakra.span>
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
                  <chakra.span display="flex" alignItems="center" className="text-red-500">
                    <LuTrash2 className="mr-2 inline" />
                    Delete
                  </chakra.span>
                ))(),
                onSelect: () => withConfirm(setAction(actionsMap.Delete)),
              },
            ],
      ),
    ]),
  );

  const mergedCollectionOptions = compact(
    flatten([
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
                <chakra.span display="flex" alignItems="center" className="text-red-500">
                  <LuTrash2 className="mr-2 inline" />
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
                </chakra.span>
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
                <chakra.span display="flex" alignItems="center" className="text-red-500">
                  <LuTrash2 className="mr-2 inline" />
                  Delete Nsịbịdị character
                </chakra.span>
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
        <chakra.span display="flex" alignItems="center">
          <LuPlus className="mr-2 inline" />
          Create Constructed Term
        </chakra.span>
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
        <chakra.span display="flex" alignItems="center">
          <LuEye className="mr-2 inline" />
          Go to Tweet
        </chakra.span>
      ))(),
      onSelect: () => {
        window.location.href = `${TWITTER_APP_URL}/${get(record, 'id')}`;
      },
    },
    {
      value: 'deletePoll',
      label: (() => (
        <chakra.span display="flex" alignItems="center" className="text-red-500">
          <LuTrash2 className="mr-2 inline" />
          Delete Poll
        </chakra.span>
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

  const options = compact([
    ...initialOptions,
    {
      value: 'copyURL',
      label: (() => (
        <chakra.span display="flex" alignItems="center">
          <LuLink className="mr-2 inline" />
          Copy Document URL
        </chakra.span>
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
  ]);

  const FullButton = showButtonLabels ? Button : IconButton;

  const onSaveUserRole = ({ value }: { value: UserRoles; label: string }) => {
    setValue(value);
    withConfirm(setAction(actionsMap.Convert));
    onClose();
  };

  return (
    <>
      <Confirmation
        collection={collection}
        resource={resource}
        record={record}
        action={action}
        selectionValue={value}
        onClose={clearConfirmOpen}
        onConfirm={refresh}
        view={view}
        setIsLoading={setIsLoading}
        isOpen={isConfirmOpen}
      />
      <RolesDrawer isOpen={isOpen} onSave={onSaveUserRole} onClose={onClose} defaultRole={record?.role} />
      <Box display="flex" flexDirection="row" alignItems="center" className="space-x-1">
        {/* @ts-expect-error label */}
        <Menu data-test="test-select-options" label="Editor's Action">
          <Tooltip label="More options">
            <MenuButton
              as={IconButton}
              variant={showButtonLabels ? '' : 'ghost'}
              maxWidth="160px"
              aria-label="Actions menu"
              icon={isLoading ? <Spinner size="xs" /> : showButtonLabels ? <LuMoreHorizontal /> : <LuMoreVertical />}
              data-test="actions-menu"
              role="button"
              fontFamily="system-ui"
              fontWeight="normal"
              isDisabled={isLoading}
              backgroundColor="white"
              _hover={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              _active={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              m={0}
            />
          </Tooltip>
          <MenuList boxShadow="xl">
            {options.map(({ value = '', label, onSelect, props = {} } = {}) => (
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
        {(isSuggestionResource || isMergedResource || isUserResource) && !isPendingResource ? (
          <Tooltip label="View entry">
            <FullButton
              variant={showButtonLabels ? '' : 'ghost'}
              aria-label="View entry button"
              {...{
                [showButtonLabels ? 'leftIcon' : 'icon']: <FiEye style={{ width: 'var(--chakra-sizes-10)' }} />,
              }}
              backgroundColor="white"
              _hover={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              _active={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              onClick={() => push(actionsMap.View(resource, record.id))}
            >
              {showButtonLabels ? 'View entry' : ''}
            </FullButton>
          </Tooltip>
        ) : null}
        {isSuggestionResource || isMergedResource ? (
          <Tooltip label="Edit entry">
            <FullButton
              variant={showButtonLabels ? '' : 'ghost'}
              aria-label="Edit entry button"
              {...{
                [showButtonLabels ? 'leftIcon' : 'icon']: <FiEdit3 style={{ width: 'var(--chakra-sizes-10)' }} />,
              }}
              icon={<FiEdit3 style={{ width: 'var(--chakra-sizes-10)' }} />}
              backgroundColor="white"
              _hover={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              _active={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              onClick={() =>
                isMergedResource
                  ? determineCreateSuggestionRedirection({ record, resource, push })
                  : push(actionsMap.Edit(resource, record.id))
              }
            >
              {showButtonLabels ? 'Edit' : ''}
            </FullButton>
          </Tooltip>
        ) : null}
        {isProjectResource ? (
          <Tooltip label="Go to project">
            <FullButton
              variant={showButtonLabels ? '' : 'ghost'}
              aria-label="Go to project button"
              icon={<FiExternalLink style={{ width: 'var(--chakra-sizes-10)' }} />}
              backgroundColor="white"
              _hover={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              _active={{
                backgroundColor: 'gray.200',
                color: 'gray.800',
              }}
              onClick={handleOnNavigateToProjectAsAdmin}
            >
              {showButtonLabels ? 'View entry' : ''}
            </FullButton>
          </Tooltip>
        ) : null}
      </Box>
    </>
  );
};

export default withRouter(
  connect(null, {
    push,
  })(Select),
);
