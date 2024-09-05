import React, { ReactElement, useState } from 'react';
import { Box, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useListFilterContext } from 'react-admin';
import Collection from 'src/shared/constants/Collection';
import Input from 'src/shared/primitives/Input';
import FilterInterface from './FilterInterface';

const Filter = (props: FilterInterface): ReactElement => {
  const { setFilters, filterValues } = useListFilterContext(props);
  const { resource } = props;
  const filterKey =
    resource === Collection.EXAMPLES || resource === Collection.EXAMPLE_SUGGESTIONS
      ? 'example'
      : resource === Collection.WORDS ||
        resource === Collection.WORD_SUGGESTIONS ||
        resource === Collection.NSIBIDI_CHARACTERS
      ? 'word'
      : 'displayName';
  const placeholderText =
    resource === Collection.EXAMPLES || resource === Collection.EXAMPLE_SUGGESTIONS
      ? 'example'
      : resource === Collection.WORDS || resource === Collection.WORD_SUGGESTIONS
      ? 'word'
      : 'name or email';
  const [searchValue, setSearchValue] = useState(
    typeof filterValues?.[filterKey] === 'string' ? filterValues[filterKey].normalize('NFD') : '',
  );

  return (
    <Box className="flex items-end w-full">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          data-test="search-bar"
          className="h-10 w-full px-4 rounded-lg border-solid border-gray-400"
          borderWidth="1px"
          backgroundColor="white"
          outline="none"
          autoFocus
          onChange={(e) => {
            const value = e.target.value.normalize('NFD');
            setFilters({ ...filterValues, [filterKey]: value }, null);
            setSearchValue(value);
          }}
          _placeholder={{ color: 'var(--chakra-colors-gray-500)' }}
          placeholder={`Search by ${placeholderText}`}
          value={searchValue}
          style={{ paddingLeft: 34 }}
        />
      </InputGroup>
    </Box>
  );
};

export default Filter;
