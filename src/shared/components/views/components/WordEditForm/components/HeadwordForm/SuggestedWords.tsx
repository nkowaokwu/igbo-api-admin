import React, {
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { debounce } from 'lodash';
import {
  Box,
  Link,
  Text,
  Tooltip,
  Popover,
  PopoverContent,
  chakra,
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import WordClass from 'src/backend/shared/constants/WordClass';
import View from 'src/shared/constants/Views';
import { getWords, getWordSuggestions } from 'src/shared/API';

const SuggestedWords = ({ word, id: wordId } : { word: string, id: string | Record['id'] }): ReactElement => {
  const [openWordPopover, setOpenWordPopover] = useState(null);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [suggestedWordSuggestions, setSuggestedWordSuggestions] = useState([]);

  const searchWordsAndWordSuggestions = useCallback(debounce(async (inputtedWord: string) => {
    if (inputtedWord) {
      const words = await getWords((inputtedWord).normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      const suggestedWords = await getWordSuggestions((inputtedWord).normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      setSuggestedWords(words);
      setSuggestedWordSuggestions(suggestedWords);
    }
  }, 400), []);

  useEffect(() => {
    searchWordsAndWordSuggestions(word);
  }, [word]);

  const filteredWords = word ? suggestedWords.filter(({ id }) => wordId !== id) : [];
  const filteredWordSuggestions = word ? suggestedWordSuggestions.filter(({ id }) => wordId !== id) : [];

  return (
    <Box className="suggested-words-container" onMouseLeave={() => setOpenWordPopover(null)}>
      {filteredWords.length || filteredWordSuggestions.length ? (
        <Text color="orange.500" fontSize="sm" className="italic mt-4">
          {'⚠️ If you are seeing similar existing below, '}
          <chakra.span fontWeight="bold">please consider deleting this document if necessary</chakra.span>
          {' and edit those existing documents to avoid duplicates.'}
        </Text>
      ) : null}
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
            {filteredWords.map(({
              word,
              nsibidi,
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
                    <Box>
                      {definitions.map(({ definitions: nestedDefinitions, wordClass, _id }, index) => (
                        <Text key={_id}>
                          {`${index + 1}. (${WordClass[wordClass]?.label || wordClass}) ${nestedDefinitions[0]}`}
                        </Text>
                      ))}
                    </Box>
                  </PopoverContent>
                </Popover>
              </Box>
            ))}
          </Box>
        </>
      ) : null}
      {filteredWordSuggestions.length ? (
        <>
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
            {filteredWordSuggestions.map(({
              word,
              nsibidi,
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
                    <Box>
                      {definitions.map(({ definitions: nestedDefinitions, wordClass, _id }, index) => (
                        <Text key={_id}>
                          {`${index + 1}. (${WordClass[wordClass]?.label || wordClass}) ${nestedDefinitions[0]}`}
                        </Text>
                      ))}
                    </Box>
                  </PopoverContent>
                </Popover>
              </Box>
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  );
};

export default SuggestedWords;
