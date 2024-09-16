import React, { ReactElement, useState, useEffect } from 'react';
import { Box, Button, Input, IconButton, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';
import { sanitizeListRestProps, TopToolbar, useListContext, usePermissions } from 'react-admin';
import queryString from 'query-string';
import Collections from 'src/shared/constants/Collection';
import { CustomListActionProps } from 'src/shared/interfaces';
import { CreateButton } from 'src/shared/primitives';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import { hasAdminOrMergerPermissions, hasAdminPermissions } from 'src/shared/utils/permissions';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import DeleteOldWordSuggestionsButton from 'src/shared/components/actions/components/DeleteOldWordSuggestionsButton';
import FiltersDrawer from 'src/shared/components/FiltersDrawer';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import { postMemberInvite } from 'src/shared/InviteAPI';
import InviteMembersModal from 'src/shared/components/InviteMembersModal';
import Filter from '../Filter';

const ListActions = (props: CustomListActionProps): ReactElement => {
  const { className, exporter, resource, ...rest } = props;
  const { basePath } = useListContext();
  const [jumpToPage, setJumpToPage] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isInviteMembersModalOpen,
    onOpen: onOpenInviteMemberModal,
    onClose: onCloseInviteMembersModal,
  } = useDisclosure();
  const permissions = usePermissions();
  const isAdminOrMerger = hasAdminOrMergerPermissions(permissions?.permissions, true);
  const isAdmin = hasAdminPermissions(permissions?.permissions, true);
  const toast = useToast();

  const isSuggestionResource =
    resource === Collections.WORD_SUGGESTIONS ||
    resource === Collections.EXAMPLE_SUGGESTIONS ||
    resource === Collections.CORPUS_SUGGESTIONS;
  const isWordResource = resource === Collections.WORD_SUGGESTIONS || resource === Collections.WORDS;
  const isExampleResource = resource === Collections.EXAMPLE_SUGGESTIONS || resource === Collections.EXAMPLES;
  const isPollResource = resource === Collections.POLLS;
  const isNotificationResource = resource === Collections.NOTIFICATIONS;
  const isNsibidiResource = resource === Collections.NSIBIDI_CHARACTERS;
  const isUserResource = resource === Collections.USERS;

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

  const constructFilterCategories = () => {
    const filterCategories: { label: string; options: { value: string | WordClassEnum; label: string } }[] = [];

    filterCategories.push({
      label: isWordResource ? 'Word Attributes' : 'Example Attributes',
      options: []
        .concat([
          isExampleResource
            ? [
                { value: ExampleStyleEnum.PROVERB, label: 'Is Proverb' },
                { value: SentenceTypeEnum.DATA_COLLECTION, label: 'Is Data Collection' },
                { value: SentenceTypeEnum.BIBLICAL, label: 'Is Biblical' },
              ]
            : isWordResource
            ? [
                { value: WordAttributeEnum.IS_STANDARD_IGBO, label: 'Is Standard Igbo' },
                { value: 'noPronunciation', label: 'Has No Pronunciation' },
                { value: 'nsibidi', label: 'Has Nsịbịdị' },
                { value: 'noNsibidi', label: 'Has No Nsịbịdị' },
                { value: WordAttributeEnum.IS_CONSTRUCTED_TERM, label: 'Is Constructed Term' },
              ]
            : [],
        ])
        .concat(
          isSuggestionResource
            ? [
                { value: SuggestionSourceEnum.COMMUNITY, label: 'From Nkọwa okwu' },
                { value: SuggestionSourceEnum.INTERNAL, label: 'From Igbo API Editor Platform' },
                { value: 'userInteractions', label: 'Has Edited By You' },
                { value: 'authorId', label: 'Is Author' },
                { value: 'mergedBy', label: 'Is Merged By You' },
                isExampleResource
                  ? [
                      { value: SuggestionSourceEnum.IGBO_SPEECH, label: 'From IgboSpeech' },
                      { value: SuggestionSourceEnum.BBC, label: 'From BBC' },
                    ]
                  : [],
              ].flat()
            : [],
        )
        .concat([{ value: 'pronunciation', label: 'Has Pronunciation' }])
        .flat(),
    });

    if (isWordResource) {
      filterCategories.push({
        label: 'Parts of Speech',
        options: Object.values(WordClassEnum).map((wordClassEnum) => ({
          value: wordClassEnum,
          label: WordClass[wordClassEnum].label,
        })),
      });
    }

    return filterCategories;
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
      <FiltersDrawer
        isOpen={isFiltersOpen}
        header="Filter"
        onClose={() => setIsFiltersOpen(false)}
        filterCategories={constructFilterCategories()}
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
        {isPollResource || isNotificationResource || isNsibidiResource ? null : <Filter {...props} />}
        <Box
          className="flex flex-row justify-end items-end
        lg:items-center space-y-0 space-x-3"
        >
          <Tooltip label="Filter entries">
            <Box className="flex flex-row items-center space-x-3">
              <IconButton aria-label="Filter button" icon={<FiFilter />} onClick={() => setIsFiltersOpen(true)} />
            </Box>
          </Tooltip>
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
                />
                <Button type="submit" className="px-3" minWidth={24} colorScheme="purple">
                  Jump to page
                </Button>
              </Box>
            </form>
          )}
          {isUserResource && isAdmin ? (
            <Button rightIcon={<LuPlus />} onClick={onOpenInviteMemberModal}>
              Invite Member
            </Button>
          ) : null}
          {isSuggestionResource ||
          (isPollResource && isAdminOrMerger) ||
          resource === Collections.NSIBIDI_CHARACTERS ? (
            <CreateButton basePath={basePath} />
          ) : null}
          {isAdmin && isWordResource && isSuggestionResource ? <DeleteOldWordSuggestionsButton /> : null}
        </Box>
      </TopToolbar>
    </>
  );
};

export default ListActions;
