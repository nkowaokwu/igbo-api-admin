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
import Collections from '../../constants/Collections';
import { CustomListActionProps } from '../../interfaces';
import { CreateButton } from '../../primitives';
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
  const isSuggestion = resource === 'wordSuggestions' || resource === 'exampleSuggestions';

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
    const updatedFilters = currentFilters.reduce((allFilters, filter) => {
      allFilters[filter] = true;
      return allFilters;
    }, {});
    setFilters(updatedFilters, []);
  }, [currentFilters]);

  return (
    <TopToolbar
      className={`${className} ${isSuggestion ? 'space-x-2' : ''} TopToolbar w-full`}
      {...sanitizeListRestProps(rest)}
    >
      <Filter {...props} />
      <Box display="flex" justifyContent="flex-end" className="lg:space-x-3">
        <form onSubmit={handleJumpToPage} className="flex flex-row">
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
        <Menu closeOnSelect={false} placement="bottom-end">
          <MenuButton
            as={Button}
            colorScheme={!currentFilters.length ? 'blue' : 'yellow'}
            backgroundColor={currentFilters.length ? 'yellow.100' : 'white'}
            variant="outline"
            rightIcon={<ChevronDownIcon />}
          >
            {!currentFilters.length ? 'Filters' : 'Filters selected'}
          </MenuButton>
          <MenuList minWidth="240px" zIndex={10}>
            <MenuOptionGroup
              defaultValue={currentFilters}
              onChange={setCurrentFilters}
              title="Word Attributes"
              type="checkbox"
            >
              {resource !== Collections.EXAMPLES && resource !== Collections.EXAMPLE_SUGGESTIONS ? [
                <MenuItemOption value="isStandardIgbo">
                  Is Standard Igbo
                </MenuItemOption>,
                <MenuItemOption value="pronunciation">
                  Has Pronunciation
                </MenuItemOption>,
              ] : null}
              {resource !== Collections.WORDS && resource !== Collections.EXAMPLES ? [
                <MenuItemOption value="authorId">
                  Is Author
                </MenuItemOption>,
              ] : null}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
        {isSuggestion ? (
          <CreateButton basePath={basePath} />
        ) : null}
      </Box>
    </TopToolbar>
  );
};

export default ListActions;
