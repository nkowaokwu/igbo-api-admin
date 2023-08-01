import React, { ReactElement, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  IconButton,
  Tooltip,
  MenuDivider,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import { sanitizeListRestProps, TopToolbar, useListContext, usePermissions } from 'react-admin';
import queryString from 'query-string';
import Collections from 'src/shared/constants/Collections';
import { CustomListActionProps } from 'src/shared/interfaces';
import { CreateButton } from 'src/shared/primitives';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Filter from '../Filter';

/**
 * The filter props comes from parsing the URL
 * we want to set the default filters on first load
 * */
const getDefaultFilters = (filters): string[] =>
  Object.entries(filters).reduce((allFilters, [key, value]) => {
    if (value) {
      allFilters.push(key);
    }
    return allFilters;
  }, []);

/**
 * The filter props comes from parsing the URL for parts of speech
 * we want to set the default filters on first load
 * */
const getDefaultPartOfSpeechFilters = (filters): string[] =>
  Object.keys(filters).reduce((allFilters, key) => {
    if (key === 'wordClass') {
      allFilters.push(key);
    }
    return allFilters;
  }, []);

const ListActions = (props: CustomListActionProps): ReactElement => {
  const { className, exporter, resource, ...rest } = props;
  const { basePath, filterValues, setFilters } = useListContext();
  const [jumpToPage, setJumpToPage] = useState('');
  const [currentFilters, setCurrentFilters] = useState(getDefaultFilters(filterValues));
  const [currentPartOfSpeechFilter, setCurrentPartOfSpeechFilter] = useState(
    getDefaultPartOfSpeechFilters(filterValues),
  );
  const { permissions = {} } = usePermissions();

  const selectedFilters = currentFilters.length > 1 || (currentFilters.length === 1 && currentFilters[0] !== 'word');

  const isSuggestionResource =
    resource === Collections.WORD_SUGGESTIONS ||
    resource === Collections.EXAMPLE_SUGGESTIONS ||
    resource === Collections.CORPUS_SUGGESTIONS;
  const isWordResource = resource === Collections.WORD_SUGGESTIONS || resource === Collections.WORDS;
  const isPollResource = resource === Collections.POLLS;
  const isNotificationResource = resource === Collections.NOTIFICATIONS;
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
  useEffect(() => {
    const updatedFilters: { wordClass?: string[] } = currentFilters.reduce((allFilters, filter) => {
      if (filter === 'noNsibidi') {
        // @ts-expect-error nsibidi
        allFilters.nsibidi = false;
      } else if (filter === 'noPronunciation') {
        // @ts-expect-error pronunciation
        allFilters.pronunciation = false;
      } else if (filter !== 'word' && filter !== 'example') {
        allFilters[filter] = true;
      }
      return allFilters;
    }, {});
    if (currentPartOfSpeechFilter.length) {
      updatedFilters.wordClass = currentPartOfSpeechFilter;
    }
    setFilters(updatedFilters, []);
  }, [currentFilters, currentPartOfSpeechFilter]);

  /* Insert page value into input whenever window location changes */
  useEffect(() => {
    const parsedHashQueries = queryString.parse(window.location.hash);
    setJumpToPage(
      // @ts-expect-error string
      parsedHashQueries[`/${resource}?page`] || parsedHashQueries.page || '',
    );
  }, [window.location.hash]);

  return (
    <TopToolbar
      className={`${className} ${isSuggestionResource ? 'space-x-2' : ''} TopToolbar w-full flex-row`}
      {...sanitizeListRestProps(rest)}
    >
      {isPollResource || isNotificationResource ? null : <Filter {...props} />}
      <Box
        className="flex flex-col lg:flex-row justify-end items-end
        lg:items-center space-y-2 lg:space-y-0 lg:space-x-3"
      >
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
              <Button type="submit" className="px-3" minWidth={24} colorScheme="green">
                Jump to page
              </Button>
            </Box>
          </form>
        )}
        <Box className="flex flex-row items-center space-x-3">
          {isPollResource || isUserResource ? null : (
            <Box
              data-test={isWordResource ? 'word-attributes-filter' : 'example-attributes-filter'}
              display="flex"
              justifyContent="flex-end"
              className="lg:space-x-3"
            >
              <Menu closeOnSelect={false} placement="bottom-end">
                <MenuButton
                  as={Button}
                  colorScheme={selectedFilters ? 'yellow' : 'blue'}
                  backgroundColor={selectedFilters ? 'yellow.100' : 'white'}
                  variant="outline"
                  rightIcon={<ChevronDownIcon />}
                >
                  {!selectedFilters ? 'Filters' : 'Filters selected'}
                </MenuButton>
                {selectedFilters ? (
                  <Tooltip label="Clear filters">
                    <IconButton
                      aria-label="Clear filters"
                      variant="ghost"
                      icon={<DeleteIcon color="red" />}
                      onClick={() => setCurrentFilters([])}
                    />
                  </Tooltip>
                ) : null}
                <MenuList minWidth="240px" zIndex={10}>
                  <MenuOptionGroup
                    defaultValue={currentFilters}
                    onChange={(value) => {
                      const cleanedValue = Array.isArray(value)
                        ? value.filter((v) => v !== 'wordClass')
                        : value === 'wordClass'
                        ? ['']
                        : [value];
                      setCurrentFilters(cleanedValue);
                    }}
                    title={isWordResource ? 'Word Attributes' : 'Example Attributes'}
                    type="checkbox"
                  >
                    {!isWordResource
                      ? [
                          <MenuItemOption value="isProverb" key="isProverb">
                            Is Proverb
                          </MenuItemOption>,
                          <MenuItemOption value="isDataCollection" key="isDataCollection">
                            Is Data Collection
                          </MenuItemOption>,
                          <MenuItemOption value="isBiblical" key="isBiblical">
                            Is Biblical
                          </MenuItemOption>,
                        ]
                      : null}
                    {isWordResource
                      ? [
                          <MenuItemOption
                            value={WordAttributeEnum.IS_STANDARD_IGBO}
                            key={WordAttributeEnum.IS_STANDARD_IGBO}
                          >
                            Is Standard Igbo
                          </MenuItemOption>,
                          <MenuItemOption value="noPronunciation" key="noPronunciation">
                            Has No Pronunciation
                          </MenuItemOption>,
                          <MenuItemOption value="nsibidi" key="nsibidi">
                            Has Nsịbịdị
                          </MenuItemOption>,
                          <MenuItemOption value="noNsibidi" key="noNsibidi">
                            Has No Nsịbịdị
                          </MenuItemOption>,
                          <MenuItemOption
                            value={WordAttributeEnum.IS_CONSTRUCTED_TERM}
                            key={WordAttributeEnum.IS_CONSTRUCTED_TERM}
                          >
                            Is Constructed Term
                          </MenuItemOption>,
                        ]
                      : null}
                    {isSuggestionResource
                      ? [
                          <MenuDivider key="divider" />,
                          <MenuItemOption value={SuggestionSourceEnum.COMMUNITY} key={SuggestionSourceEnum.COMMUNITY}>
                            From Nkọwa okwu
                          </MenuItemOption>,
                          <MenuItemOption value={SuggestionSourceEnum.INTERNAL} key={SuggestionSourceEnum.INTERNAL}>
                            From Igbo API Editor Platform
                          </MenuItemOption>,
                          <MenuItemOption value="userInteractions" key="userInteractions">
                            Has Edited
                          </MenuItemOption>,
                          <MenuItemOption value="authorId" key="authorId">
                            Is Author
                          </MenuItemOption>,
                          <MenuItemOption value="mergedBy" key="mergedBy">
                            Merged By You
                          </MenuItemOption>,
                        ]
                      : null}
                    <MenuItemOption value="pronunciation" key="pronunciation">
                      Has Pronunciation
                    </MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </Box>
          )}
          {isWordResource && !isPollResource && !isUserResource ? (
            <Box data-test="part-of-speech-filter" display="flex" justifyContent="flex-end" className="lg:space-x-3">
              <Menu closeOnSelect={false} placement="bottom-end">
                <MenuButton
                  as={Button}
                  colorScheme={!currentPartOfSpeechFilter.length ? 'blue' : 'yellow'}
                  backgroundColor={currentPartOfSpeechFilter.length ? 'yellow.100' : 'white'}
                  variant="outline"
                  rightIcon={<ChevronDownIcon />}
                >
                  {!currentPartOfSpeechFilter.length ? 'Part of Speech' : 'Part of Speech selected'}
                </MenuButton>
                <MenuList minWidth="240px" zIndex={10}>
                  <MenuOptionGroup
                    defaultValue={currentPartOfSpeechFilter}
                    // @ts-expect-error onChange
                    onChange={setCurrentPartOfSpeechFilter}
                    title="Part of speech"
                    type="checkbox"
                  >
                    {Object.values(WordClass).map(({ value, label }) => (
                      <MenuItemOption key={value} value={value}>
                        {label}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </Box>
          ) : null}
        </Box>
        {isSuggestionResource ||
        (isPollResource && hasAdminOrMergerPermissions(permissions, true)) ||
        resource === Collections.NSIBIDI_CHARACTERS ? (
          <CreateButton basePath={basePath} />
        ) : null}
      </Box>
    </TopToolbar>
  );
};

export default ListActions;
