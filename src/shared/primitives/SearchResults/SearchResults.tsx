import React, { useRef, ReactElement, MutableRefObject, ForwardedRef } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import useOnScreen from 'src/hooks/useOnScreen';
import Collection from 'src/shared/constants/Collection';
import ExampleResult from 'src/shared/primitives/SearchResults/components/ExampleResult';
import NsibidiCharacterResult from 'src/shared/primitives/SearchResults/components/NsibidiCharacterResult';
import WordResult from 'src/shared/primitives/SearchResults/components/WordResult';

const SearchResults = ({
  inputRef,
  isSearchingAutoCompleteResults,
  autoCompleteResults,
  onClick,
  collection,
}: {
  inputRef: MutableRefObject<ForwardedRef<unknown>>;
  isSearchingAutoCompleteResults: boolean;
  autoCompleteResults: any[];
  onClick: (value: any) => void;
  collection?: Collection;
}): ReactElement => {
  const wordResultsRef = useRef(null);
  const isWordResultsClipped = useOnScreen(wordResultsRef);
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
          <Spinner />
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
            {collection === Collection.EXAMPLES || collection === Collection.EXAMPLE_SUGGESTIONS ? (
              <ExampleResult result={result} data-test={`search-result-${index}`} />
            ) : collection === Collection.NSIBIDI_CHARACTERS ? (
              <NsibidiCharacterResult result={result} data-test={`search-result-${index}`} />
            ) : (
              <WordResult result={result} data-test={`search-result-${index}`} />
            )}
          </Box>
        ))
      )}
    </Box>
  );
};

export default SearchResults;
