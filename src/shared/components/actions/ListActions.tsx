import React, { ReactElement, useState, useEffect } from 'react';
import { Box, Button, HStack, Input, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';
import { sanitizeListRestProps, TopToolbar, useListContext, usePermissions } from 'react-admin';
import queryString from 'query-string';
import Collection from 'src/shared/constants/Collection';
import { CustomListActionProps } from 'src/shared/interfaces';
import { CreateButton } from 'src/shared/primitives';
import { hasAdminOrMergerPermissions, hasAdminPermissions } from 'src/shared/utils/permissions';
import FiltersModal from 'src/shared/components/FiltersModal';
import { postMemberInvite } from 'src/shared/InviteAPI';
import InviteMembersModal from 'src/shared/components/InviteMembersModal';
import ExampleSuggestionFilterConfig from 'src/shared/components/FiltersModal/configs/ExampleSuggestionFilterConfig';
import WordSuggestionFilterConfig from 'src/shared/components/FiltersModal/configs/WordSuggestionFilterConfig';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import UserFilterConfig from 'src/shared/components/FiltersModal/configs/UserFilterConfig';

const ListActions = (props: CustomListActionProps): ReactElement => {
  const { className, exporter, resource, ...rest } = props;
  const { basePath, filterValues } = useListContext();
  const [jumpToPage, setJumpToPage] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isInviteMembersModalOpen,
    onOpen: onOpenInviteMemberModal,
    onClose: onCloseInviteMembersModal,
  } = useDisclosure();
  const permissions = usePermissions();
  const isIgboAPIProject = useIsIgboAPIProject();
  const isAdminOrMerger = hasAdminOrMergerPermissions(permissions?.permissions, true);
  const isAdmin = hasAdminPermissions(permissions?.permissions, true);
  const toast = useToast();

  const ResourceToFilterConfig = {
    [Collection.WORDS]: WordSuggestionFilterConfig,
    [Collection.WORD_SUGGESTIONS]: WordSuggestionFilterConfig,
    [Collection.EXAMPLES]: ExampleSuggestionFilterConfig(isIgboAPIProject),
    [Collection.EXAMPLE_SUGGESTIONS]: ExampleSuggestionFilterConfig(isIgboAPIProject),
    [Collection.USERS]: UserFilterConfig,
  };

  const isSuggestionResource =
    resource === Collection.WORD_SUGGESTIONS ||
    resource === Collection.EXAMPLE_SUGGESTIONS ||
    resource === Collection.CORPUS_SUGGESTIONS;
  const isPollResource = resource === Collection.POLLS;
  const isUserResource = resource === Collection.USERS;

  /* Jumps to user-specified page */
  const handleJumpToPage = (e) => {
    e.preventDefault();
    const parsedHashQueries = queryString.parse(window.location.hash);
    if (parsedHashQueries[`/${resource}?page`]) {
      parsedHashQueries[`/${resource}?page`] = jumpToPage;
    } else {
      parsedHashQueries.page = jumpToPage;
    }
    window.location.hash = queryString
      .stringify(parsedHashQueries)
      .replace('%2F', '/')
      .replace('%3F', '?')
      .replace(`/${resource}&`, `/${resource}?`);
  };

  /* Handles input from user */
  const handleOnJumpToPageChange = ({ target }: { target: { value: string } }) => {
    setJumpToPage(target.value);
  };

  const onInviteMember = async ({ email }: { email: string }) => {
    setIsLoading(true);
    try {
      await postMemberInvite({ email });
      toast({
        title: 'Success',
        description: 'Your invitation has been sent to your teammate.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      onCloseInviteMembersModal();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Unable to send invitation to your teammate.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* Insert page value into input whenever window location changes */
  useEffect(() => {
    const parsedHashQueries = queryString.parse(window.location.hash);
    setJumpToPage(
      // @ts-expect-error string
      parsedHashQueries[`/${resource}?page`] || parsedHashQueries.page || '',
    );
  }, [window.location.hash]);

  return (
    <>
      <FiltersModal
        resource={resource as Collection}
        config={ResourceToFilterConfig[resource] || []}
        isOpen={isFiltersOpen}
        header="Filter"
        onClose={() => setIsFiltersOpen(false)}
      />
      <InviteMembersModal
        isOpen={isInviteMembersModalOpen}
        onClose={onCloseInviteMembersModal}
        onInviteMember={onInviteMember}
        isLoading={isLoading}
      />
      <TopToolbar
        className={`${className} ${
          isSuggestionResource ? 'space-x-2' : ''
        } TopToolbar w-full flex-col md:flex-row space-x-3`}
        {...sanitizeListRestProps(rest)}
      >
        <HStack width="full" justifyContent="space-between">
          <HStack gap={2}>
            {ResourceToFilterConfig[resource]?.length ? (
              <Tooltip label="Filter entries">
                <Box className="flex flex-row items-center space-x-3">
                  <Button aria-label="Filter button" leftIcon={<FiFilter />} onClick={() => setIsFiltersOpen(true)}>
                    {Object.values(filterValues).length ? 'Filter applied' : 'Filter'}
                  </Button>
                </Box>
              </Tooltip>
            ) : null}
            {isPollResource ? null : (
              <form onSubmit={handleJumpToPage} className="flex flex-col lg:flex-row">
                <Box className="flex flex-row space-x-2">
                  <Input
                    width={16}
                    value={jumpToPage}
                    type="number"
                    data-test="jump-to-page-input"
                    onChange={handleOnJumpToPageChange}
                    placeholder="Page #"
                    name="page"
                    variant="primary"
                  />
                  <Button type="submit" className="px-3" minWidth={24}>
                    Jump to page
                  </Button>
                </Box>
              </form>
            )}
          </HStack>
          <HStack gap={2}>
            {isUserResource && isAdmin ? (
              <Button rightIcon={<LuPlus />} onClick={onOpenInviteMemberModal} variant="primary">
                Invite Member
              </Button>
            ) : null}
            {isSuggestionResource ||
            (isPollResource && isAdminOrMerger) ||
            resource === Collection.NSIBIDI_CHARACTERS ? (
              <CreateButton basePath={basePath} />
            ) : null}
          </HStack>
        </HStack>
      </TopToolbar>
    </>
  );
};

export default ListActions;
