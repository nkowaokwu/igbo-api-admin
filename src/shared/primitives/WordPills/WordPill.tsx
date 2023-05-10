import React, { ReactElement } from 'react';
import { get, truncate } from 'lodash';
import {
  Box,
  IconButton,
  Text,
  Tooltip,
  chakra,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const WordPill = ({
  nsibidi,
  definitions,
  pronunciation,
  word,
  onDelete,
  index,
}: {
  word?: string,
  nsibidi?: string,
  wordClass?: string,
  definitions: ({ text: string } | string)[],
  pronunciation?: string,
  onDelete: () => void;
  index: number,
}): ReactElement => (
  <Box
    data-test={`word-pill-${index}`}
    width="fit-content"
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    borderColor="blue.400"
    borderWidth="1px"
    backgroundColor="blue.50"
    borderRadius="md"
    p={2}
  >
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="start" className="space-x-2">
        <Text fontSize="sm" color="blue.500" fontWeight="bold">
          <chakra.span fontWeight="normal">
            {`${index + 1}. `}
          </chakra.span>
          {word || nsibidi}
        </Text>
        <Text fontSize="xs" fontStyle="italic" color="blue.400">
          {pronunciation || get(definitions, '[0].wordClass')}
        </Text>
      </Box>
      <Text fontSize="xs" color="blue.400">
        {truncate(get(definitions, '[0].text') || get(definitions, '[0].definitions[0]'))}
      </Text>
    </Box>
    <Tooltip label="Remove item">
      <IconButton
        variant="ghost"
        color="red.400"
        aria-label="Remove"
        minWidth={6}
        alignItems="start"
        justifyContent="end"
        onClick={onDelete}
        _hover={{
          backgroundColor: 'transparent',
        }}
        _active={{
          backgroundColor: 'transparent',
        }}
        icon={<CloseIcon boxSize={3} />}
      />
    </Tooltip>
  </Box>
);

export default WordPill;
