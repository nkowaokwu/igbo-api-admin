import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Link,
  Text,
  Tooltip,
  Popover,
  PopoverContent,
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import WordClass from 'src/shared/constants/WordClass';
import { getWords } from 'src/shared/API';

const SuggestedWords = ({ word } : { word: string }): ReactElement => {
  const [openWordPopover, setOpenWordPopover] = useState(null);
  const [suggestedWords, setSuggestedWords] = useState([]);
  useEffect(() => {
    (async () => {
      const words = await getWords(word);
      setSuggestedWords(words);
    })();
  }, [word]);

  return (
    <Box onMouseLeave={() => setOpenWordPopover(null)}>
      <Tooltip
        label={`These are existing word documents. Please check to 
        see if these existing words need to be updated before 
        creating a new word.`}
      >
        <Box className="flex flex-row items-center">
          <Text my={2}>Similar existing words:</Text>
          <InfoOutlineIcon color="gray.600" boxSize={3} className="ml-2" />
        </Box>
      </Tooltip>

      <Box className="flex flex-row flex-wrap">
        {suggestedWords.map(({
          word,
          nsibidi,
          wordClass,
          definitions,
          id,
        }) => (
          <Box key={`suggested-word-${id}`}>
            <Box
              onMouseEnter={() => setOpenWordPopover(id)}
              className="flex flex-row items-center"
              mr={3}
            >
              <Link
                color="blue.400"
                href={`/words/${id}`}
                target="_blank"
                onMouseEnter={() => setOpenWordPopover(id)}
                mr={1}
              >
                <Text pointerEvents="none">{word}</Text>
              </Link>
              <ExternalLinkIcon color="blue.400" boxSize={3} />
            </Box>
            <Popover
              isOpen={id === openWordPopover}
              placement="bottom"
            >
              <PopoverContent p={5}>
                <Box className="flex flex-row items-center">
                  <Text fontWeight="bold" mr={2}>{word}</Text>
                  {nsibidi ? <Text color="green.500" fontWeight="bold" className="akagu">{nsibidi}</Text> : null}
                </Box>
                <Text fontStyle="italic">{WordClass[wordClass]?.label || wordClass}</Text>
                <Box>
                  {definitions.map((definition, index) => (
                    <Text>{`${index + 1}. ${definition}`}</Text>
                  ))}
                </Box>
              </PopoverContent>
            </Popover>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SuggestedWords;