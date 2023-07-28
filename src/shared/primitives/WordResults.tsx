import React, { useRef, ReactElement, MutableRefObject, ForwardedRef } from 'react';
import { get } from 'lodash';
import { Box, Spinner, Text, chakra } from '@chakra-ui/react';
import useOnScreen from 'src/hooks/useOnScreen';

const WordResults = ({
  inputRef,
  isSearchingAutoCompleteResults,
  autoCompleteResults,
  onClick,
}: {
  inputRef: MutableRefObject<ForwardedRef<unknown>>;
  isSearchingAutoCompleteResults: boolean;
  autoCompleteResults: any[];
  onClick: (value: any) => void;
}): ReactElement => {
  const wordResultsRef = useRef(null);
  const isWordResultsClipped = useOnScreen(wordResultsRef);

  console.log({ isWordResultsClipped });
  return (
    <Box
      ref={wordResultsRef}
      data-test="auto-complete-container"
      position="absolute"
      {...(isWordResultsClipped
        ? { bottom: `calc(${inputRef.current.clientHeight}px + 1rem)` }
        : { top: `calc(${inputRef.current.clientHeight}px + 1rem)` })}
      left="0"
      boxShadow="lg"
      borderRadius="md"
      backgroundColor="white"
      width="full"
      borderColor="gray.200"
      borderWidth="1px"
      zIndex={1}
      maxHeight="500px"
      overflowY="scroll"
    >
      {isSearchingAutoCompleteResults ? (
        <Box width="full" display="flex" justifyContent="center" py={4}>
          <Spinner color="primary" />
        </Box>
      ) : (
        autoCompleteResults.map((result, index) => (
          <Box
            key={result.id}
            py={3}
            px={2}
            _hover={{ backgroundColor: 'selected' }}
            _active={{ backgroundColor: 'selected' }}
            cursor="pointer"
            userSelect="none"
            className="transition-all duration-100"
            onClick={() => onClick(result)}
            {...(!index ? { borderTopRadius: 'md' } : {})}
            {...(index === autoCompleteResults.length - 1 ? { borderBottomRadius: 'md' } : {})}
          >
            {result.word ? (
              <>
                <Text fontWeight="bold">
                  {result.word}
                  <chakra.span fontStyle="italic" color="gray.400" fontSize="sm" fontWeight="normal" ml={3}>
                    {get(result, 'definitions.0.wordClass')}
                  </chakra.span>
                </Text>
                <Text color="gray.600">{get(result, 'definitions[0].definitions[0]')}</Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold" className="akagu">
                  {result.nsibidi}
                  <chakra.span fontStyle="italic" color="gray.400" fontSize="sm" fontWeight="normal" ml={3}>
                    {get(result, 'pronunciations[0].text')}
                  </chakra.span>
                </Text>
                <Text color="gray.600">{get(result, 'definitions[0].text')}</Text>
              </>
            )}
          </Box>
        ))
      )}
    </Box>
  );
};

export default WordResults;
