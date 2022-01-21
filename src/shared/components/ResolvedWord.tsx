import React, { useEffect, useState, ReactElement } from 'react';
import { Box, Spinner, Tooltip } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import network from '../../Core/Dashboard/network';

const ResolvedWord = ({ wordId }: { wordId: string }): ReactElement => {
  const [resolvedWord, setResolvedWord] = useState(null);
  const [isLinked, setIsLinked] = useState(true);

  useEffect(() => {
    (async () => {
      const word = await network({ url: `/words/${wordId}` })
        .then(({ json: word }) => word)
        .catch(() => {
          setIsLinked(false);
          return { word: wordId };
        });
      setResolvedWord(word);
    })();
  }, []);

  return resolvedWord ? (
    isLinked ? (
      <a className="text-blue-400 underline" href={`#/words/${wordId}/show`}>{resolvedWord.word}</a>
    ) : (
      <Box display="flex" alignItems="center" className="space-x-2">
        <p>{resolvedWord.word}</p>
        <Tooltip
          label={`This word metadata is not linked. To properly link this 
          metadata to the word, edit this word and link this metadata.`}
        >
          <InfoOutlineIcon color="orange.600" width="4" className="ml-2" />
        </Tooltip>
      </Box>
    )
  ) : <Spinner />;
};

export default ResolvedWord;
