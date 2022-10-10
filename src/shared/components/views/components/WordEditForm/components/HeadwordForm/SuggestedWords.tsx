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
import { getWords, getWordSuggestions } from 'src/shared/API';

const SuggestedWords = ({ word, id: wordId } : { word: string, id: string }): ReactElement => {
  const [openWordPopover, setOpenWordPopover] = useState(null);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [suggestedWordSuggestions, setSuggestedWordSuggestions] = useState([]);
  useEffect(() => {
    (async () => {
      if (word) {
        const words = await getWords((word).normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        const suggestedWords = await getWordSuggestions((word).normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        setSuggestedWords(words);
        setSuggestedWordSuggestions(suggestedWords);
      }
    })();
  }, [word]);

  const filteredWords = suggestedWords.filter(({ id }) => wordId !== id);
  const filteredWordSuggestions = suggestedWordSuggestions.filter(({ id }) => wordId !== id);

  return (
    <Box className="suggested-words-container" onMouseLeave={() => setOpenWordPopover(null)}>
      {filteredWords.length ? (
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
          <Box className="flex flex-row flex-wrap relative">
            {filteredWords.length ? filteredWords.map(({
              word,
              nsibidi,
              wordClass,
              definitions,
              id,
            }) => (
              <Box key={`suggested-word-${id} relative`}>
                <Box
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
                  placement="bottom-start"
                >
                  <PopoverContent top={7} p={5}>
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
          <Tooltip
            label={`These are existing word suggestion documents. Please check to 
            see if these existing word suggestions need to be updated before 
            creating a new word.`}
          >
            <Box className="flex flex-row items-center">
              <Text my={2}>Similar existing word suggestions:</Text>
              <InfoOutlineIcon color="gray.600" boxSize={3} className="ml-2" />
            </Box>
          </Tooltip>
          <Box className="flex flex-row flex-wrap relative">
            {filteredWordSuggestions.length ? filteredWordSuggestions.map(({
              word,
              nsibidi,
              wordClass,
              definitions,
              id,
            }) => (
              <Box key={`suggested-word-${id} relative`}>
                <Box
                  className="flex flex-row items-center"
                  mr={3}
                >
                  <Link
                    color="blue.400"
                    href={`#/wordSuggestions/${id}/${View.SHOW}`}
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
                  placement="bottom-start"
                >
                  <PopoverContent top={7} p={5}>
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
