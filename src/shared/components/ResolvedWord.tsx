import React, { useEffect, useState, ReactElement } from 'react';
import {
  Box,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { getWord } from '../API';
import Collections from '../constants/Collections';

const ResolvedWord = ({ wordId }: { wordId: string }): ReactElement => {
  const [resolvedWord, setResolvedWord] = useState(null);
  const [isLinked, setIsLinked] = useState(true);

  useEffect(() => {
    (async () => {
      const word = await getWord(wordId, { dialects: true })
        .catch(() => {
          setIsLinked(false);
          return { word: wordId };
        });
      setResolvedWord(word);
    })();
  }, []);

  return resolvedWord ? (
    isLinked ? (
      <a className="text-blue-400 underline" href={`#/${Collections.WORDS}/${wordId}/show`}>{resolvedWord.word}</a>
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
