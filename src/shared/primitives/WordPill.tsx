import React, { ReactElement } from 'react';
import { truncate } from 'lodash';
import {
  Box,
  IconButton,
  Text,
  Tooltip,
  chakra,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const WordPill = ({
  word,
  wordClass,
  definitions,
  onDelete,
  index,
}: {
  word: string,
  wordClass: string,
  definitions: [string],
  onDelete: () => void;
  index: number,
}): ReactElement => (
  <Box
    data-test={`word-pill-${index}`}
    width="full"
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
  >
    <Box display="flex" flexDirection="column" className="space-y-1">
      <Box display="flex" flexDirection="row" alignItems="center" className="space-x-2">
        <Text fontSize="sm" color="blue.500" fontWeight="bold">
          <chakra.span fontWeight="normal">
            {`${index + 1}. `}
          </chakra.span>
          {word}
        </Text>
        <Text fontSize="sm" fontStyle="italic" color="blue.400">{wordClass}</Text>
      </Box>
      <Text fontSize="sm" color="blue.400">
        {truncate(definitions[0])}
      </Text>
    </Box>
    <Tooltip label="Remove item">
      <IconButton
        variant="ghost"
        color="red.400"
        aria-label="Remove"
        onClick={onDelete}
        _hover={{
          backgroundColor: 'transparent',
        }}
        _active={{
          backgroundColor: 'transparent',
        }}
        icon={<CloseIcon boxSize={4} />}
      />
    </Tooltip>
  </Box>
);

export default WordPill;
