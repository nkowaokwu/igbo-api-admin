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
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { sanitizeListRestProps, TopToolbar, useListContext } from 'react-admin';
import queryString from 'query-string';
import Collections from 'src/shared/constants/Collections';
import { CustomListActionProps } from 'src/shared/interfaces';
import { CreateButton } from 'src/shared/primitives';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import WordClass from 'src/shared/constants/WordClass';
import Filter from '../Filter';

/**
 * The filter props comes from parsing the URL
 * we want to set the default filters on first load
 * */
const getDefaultFilters = (filters): string[] => (
  Object.entries(filters).reduce((allFilters, [key, value]) => {
    if (value) {
      allFilters.push(key);
    }
    return allFilters;
  }, [])
);

/**
 * The filter props comes from parsing the URL for parts of speech
 * we want to set the default filters on first load
 * */
const getDefaultPartOfSpeechFilters = (filters): string[] => (
  Object.keys(filters).reduce((allFilters, key) => {
    if (key === 'wordClass') {
      allFilters.push(key);
    }
    return allFilters;
  }, [])
);

const ListActions = (props: CustomListActionProps): ReactElement => {
  const {
    className,
    exporter,
    resource,
    ...rest
  } = props;
  const { basePath, filterValues, setFilters } = useListContext();
  const [jumpToPage, setJumpToPage] = useState('');
  const [currentFilters, setCurrentFilters] = useState(getDefaultFilters(filterValues));
  const [currentPartOfSpeechFilter, setCurrentPartOfSpeechFilter] = useState(
    getDefaultPartOfSpeechFilters(filterValues),
  );
  const selectedFilters = currentFilters.length > 1 || (currentFilters.length === 1 && currentFilters[0] !== 'word');

  const isSuggestionResource = (
    resource === Collections.WORD_SUGGESTIONS || resource === Collections.EXAMPLE_SUGGESTIONS
  );
  const isWordResource = resource !== Collections.EXAMPLES && resource !== Collections.EXAMPLE_SUGGESTIONS;

  /* Insert page value into input whenever window location changes */
  useEffect(() => {
    const parsedHashQueries = queryString.parse(window.location.hash);
    // @ts-ignore
    setJumpToPage(parsedHashQueries[`/${resource}?page`] || parsedHashQueries.page || '');
  }, [window.location.hash]);

  /* Jumps to user-specified page */
  const handleJumpToPage = (e) => {
    e.preventDefault();
    const parsedHashQueries = queryString.parse(window.location.hash);
    if (parsedHashQueries[`/${resource}?page`]) {
      parsedHashQueries[`/${resource}?page`] = jumpToPage;
    } else {
      parsedHashQueries.page = jumpToPage;
    }
    window.location.hash = queryString.stringify(parsedHashQueries)
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
      if (filter !== 'word' && filter !== 'example') {
        allFilters[filter] = true;
      }
      return allFilters;
    }, {});
    if (currentPartOfSpeechFilter.length) {
      updatedFilters.wordClass = currentPartOfSpeechFilter;
    }
    setFilters(updatedFilters, []);
  }, [currentFilters, currentPartOfSpeechFilter]);

  return (
    <TopToolbar
      className={`${className} ${isSuggestionResource ? 'space-x-2' : ''} TopToolbar w-full flex-row`}
      {...sanitizeListRestProps(rest)}
    >
      <Filter {...props} />
      <Box
        className="flex flex-col lg:flex-row justify-end items-end
        lg:items-center space-y-2 lg:space-y-0 lg:space-x-3"
      >
        <form onSubmit={handleJumpToPage} className="flex flex-col lg:flex-row">
          <Box className="flex flex-row space-x-2">
            <Input
              width={32}
              value={jumpToPage}
              type="number"
              data-test="jump-to-page-input"
              onChange={handleOnJumpToPageChange}
              placeholder="Page #"
              name="page"
            />
            <Button type="submit" className="px-3" minWidth={24} colorScheme="green">Jump to page</Button>
          </Box>
        </form>
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
                {!isWordResource ? [
                  <MenuItemOption value="isProverb">
                    Is Proverb
                  </MenuItemOption>,
                ] : null}
                {isWordResource ? [
                  <MenuItemOption value="isStandardIgbo">
                    Is Standard Igbo
                  </MenuItemOption>,
                  <MenuItemOption value="pronunciation">
                    Has Pronunciation
                  </MenuItemOption>,
                ] : null}
                {isSuggestionResource ? [
                  <MenuItemOption value={SuggestionSource.COMMUNITY}>
                    From Nkọwa okwu
                  </MenuItemOption>,
                  <MenuItemOption value={SuggestionSource.INTERNAL}>
                    From Igbo API Editor Platform
                  </MenuItemOption>,
                ] : null}
                {isSuggestionResource ? [
                  <MenuItemOption value="authorId">
                    Is Author
                  </MenuItemOption>,
                ] : null}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Box>
        {isWordResource ? (
          <Box
            data-test="part-of-speech-filter"
            display="flex"
            justifyContent="flex-end"
            className="lg:space-x-3"
          >
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
        {isSuggestionResource ? (
          <CreateButton basePath={basePath} />
        ) : null}
      </Box>
    </TopToolbar>
  );
};

export default ListActions;
