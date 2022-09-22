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
import View from 'src/shared/constants/Views';
import { getWords } from 'src/shared/API';

const SuggestedWords = ({ word, id: wordId } : { word: string, id: string }): ReactElement => {
  const [openWordPopover, setOpenWordPopover] = useState(null);
  const [suggestedWords, setSuggestedWords] = useState([]);
  useEffect(() => {
    (async () => {
      const words = await getWords(word);
      setSuggestedWords(words);
    })();
  }, [word]);

  const filteredWordSuggestions = suggestedWords.filter(({ id }) => wordId !== id);
  return (
    <Box onMouseLeave={() => setOpenWordPopover(null)}>
      {filteredWordSuggestions.length ? (
        <>
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
            {filteredWordSuggestions.length ? filteredWordSuggestions.map(({
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
                    href={`#/words/${id}/${View.SHOW}`}
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
                        <Text key={definition}>{`${index + 1}. ${definition}`}</Text>
                      ))}
                    </Box>
                  </PopoverContent>
                </Popover>
              </Box>
            )) : <Text color="gray.400" fontStyle="italic" fontSize="sm">No similar words</Text>}
          </Box>
        </>
      ) : null}
    </Box>
  );
};

export default SuggestedWords;
