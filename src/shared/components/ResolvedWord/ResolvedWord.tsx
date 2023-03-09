import React, { useEffect, useState, ReactElement } from 'react';
import {
  Box,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { getWord, getWordSuggestion } from '../../API';
import Collections from '../../constants/Collections';

const ResolvedWord = ({ wordId, isSuggestion }: { wordId: string, isSuggestion: boolean }): ReactElement => {
  const [resolvedWord, setResolvedWord] = useState(null);
  const [isLinked, setIsLinked] = useState(true);
  const wordResource = isSuggestion ? Collections.WORD_SUGGESTIONS : Collections.WORDS;
  const getDocument = isSuggestion ? getWordSuggestion : getWord;

  useEffect(() => {
    (async () => {
      const word = await getDocument(wordId, { dialects: true })
        .catch(() => {
          setIsLinked(false);
          return { word: wordId };
        });
      setResolvedWord(word);
    })();
  }, []);

  return resolvedWord ? (
    isLinked ? (
      <a className="text-blue-400 underline" href={`#/${wordResource}/${wordId}/show`}>{resolvedWord.word}</a>
    ) : (
      <Tooltip
        label={`This word metadata is not linked. To properly link this 
        metadata to the word, edit this word and link this metadata.`}
        backgroundColor="orange.300"
        color="black"
      >
        <Box display="flex" alignItems="center" fontFamily="monospace" className="space-x-2">
          <Text color="orange.600" fontWeight="bold" cursor="default">{resolvedWord.word}</Text>
          <WarningIcon color="orange.600" boxSize={3} className="ml-2" />
        </Box>
      </Tooltip>
    )
  ) : <Spinner />;
};

export default ResolvedWord;
