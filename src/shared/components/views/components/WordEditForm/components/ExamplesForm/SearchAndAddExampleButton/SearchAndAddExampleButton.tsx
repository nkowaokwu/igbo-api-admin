import React, { ReactElement, useEffect, useState } from 'react';
import { omit } from 'lodash';
import { Box, Button, IconButton, Tooltip } from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { Input } from 'src/shared/primitives';
import Collection from 'src/shared/constants/Collection';

const SearchAndAddExampleButton = ({
  append,
}: {
  append: (value: Partial<Record<string, any>> | Partial<Record<string, any>>[], shouldFocus?: boolean) => void;
}): ReactElement => {
  const [isSearching, setIsSearching] = useState(false);
  const [exampleSearch, setExampleSearch] = useState('');

  useEffect(() => {}, [exampleSearch]);

  const handleToggleSearching = () => {
    setIsSearching(!isSearching);
  };

  const handleExampleSearch = (e) => setExampleSearch(e.target.value);

  const handleClearAndClose = () => {
    setExampleSearch('');
    setIsSearching(false);
  };

  const handleSelectedExampleSuggestion = (example) => {
    const exampleSuggestion = omit(example, ['id', 'updatedAt']);
    append({ ...exampleSuggestion, originalExampleId: example.id });
    handleClearAndClose();
  };

  return !isSearching ? (
    <Box className="w-full flex flex-row justify-end flex-1" my={6}>
      <Tooltip label="Attach an existing example to this word suggestion">
        <Button
          width="full"
          variant="primary"
          aria-label="Search and Add Sentence"
          onClick={handleToggleSearching}
          leftIcon={<AddIcon />}
        >
          Attach Existing Sentence
        </Button>
      </Tooltip>
    </Box>
  ) : (
    <Box className="flex flex-row justify-center items-center space-x-2 flex-1">
      <Input
        placeholder="Search example sentence"
        collection={Collection.EXAMPLES}
        searchApi
        onSelect={handleSelectedExampleSuggestion}
        px={2}
        value={exampleSearch}
        onChange={handleExampleSearch}
        className="w-full"
      />
      <Tooltip label="Cancel searching for an example suggestion">
        <IconButton
          cursor="pointer"
          variant="ghost"
          icon={<CloseIcon boxSize={6} color="red" background="transparent" />}
          aria-label="Close search bar"
          onClick={handleClearAndClose}
        />
      </Tooltip>
    </Box>
  );
};

export default SearchAndAddExampleButton;
