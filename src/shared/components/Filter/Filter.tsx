import React, { ReactElement, useState } from 'react';
import { Box, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useListFilterContext } from 'react-admin';
import Collection from 'src/shared/constants/Collections';
import Input from 'src/shared/primitives/Input';
import FilterInterface from './FilterInterface';

const CustomFilter = (props: FilterInterface): ReactElement => {
  const { setFilters, filterValues } = useListFilterContext(props);
  const { resource } = props;
  const filterKey = resource === Collection.EXAMPLES || resource === Collection.EXAMPLE_SUGGESTIONS
    ? 'example'
    : resource === Collection.WORDS || resource === Collection.WORD_SUGGESTIONS
      ? 'word'
      : 'displayName';
  const placeholderText = resource === Collection.EXAMPLES || resource === Collection.EXAMPLE_SUGGESTIONS
    ? 'example'
    : resource === Collection.WORDS || resource === Collection.WORD_SUGGESTIONS
      ? 'word'
      : 'name or email';
  const [searchValue, setSearchValue] = useState(
    typeof filterValues?.[filterKey] === 'string' ? filterValues[filterKey].normalize('NFD') : '',
  );

  return (
    <Box className="flex items-end lg:ml-4">
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
        >
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          data-test="search-bar"
          className="h-10 w-full lg:w-64 bg-gray-300 px-4 rounded-lg border border-solid border-gray-400"
          onChange={(e) => {
            const value = e.target.value.normalize('NFD');
            setFilters({ ...filterValues, [filterKey]: value }, null);
            setSearchValue(value);
          }}
          placeholder={`Search by ${placeholderText}`}
          value={searchValue}
          style={{ paddingLeft: 34 }}
        />
      </InputGroup>
    </Box>
  );
};

const Filter = (props: any): ReactElement => (
  <CustomFilter {...props} />
);

export default Filter;
