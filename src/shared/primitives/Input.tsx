import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  ReactElement,
} from 'react';
import { act } from 'react-dom/test-utils';
import { debounce, get } from 'lodash';
import {
  Box,
  Input as ChakraInput,
  InputProps,
  Spinner,
  Text,
  chakra,
} from '@chakra-ui/react';
import { isMobile } from 'react-device-detect';
import useEventListener from 'src/hooks/useEventListener';
import { getNsibidiCharacters, getWords } from '../API';
import DiacriticsBankPopup from './DiacriticsBankPopup';
import { handlePosition, handleIsEditing } from './utils/positions';
import Collections from '../constants/Collections';

const Input = React.forwardRef(({
  value,
  onChange,
  width,
  className,
  type,
  onSelect,
  searchApi,
  collection,
  ...rest
} : {
  value?: string,
  onChange: (value: any) => void,
  width?: string,
  className: string,
  placeholder: string,
  type?: string,
  onBlur?: () => void,
  defaultValue?: string,
  onSelect?: (e: any) => void,
  searchApi?: boolean,
  collection?: Collections,
  isDisabled?: boolean,
} | InputProps, ref): ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionRect, setPositionRect] = useState({});
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);
  const [isSearchingAutoCompleteResults, setIsSearchingAutoCompleteResults] = useState(false);
  const [isAutoCompleteVisible, setIsAutoCompleteVisible] = useState(false);
  const accentedLetterPopupRef = useRef(null);
  const inputRef = useRef(ref);

  const eventListenerData = {
    anchorRef: inputRef,
    setPositionRect,
    isMobile,
    setIsVisible,
  };

  const handleSelectAutocomplete = (word) => {
    onSelect(word);
  };

  const debounceInput = useCallback(debounce(async (search) => {
    setIsSearchingAutoCompleteResults(true);
    const fetchMethod = collection === Collections.NSIBIDI_CHARACTERS ? getNsibidiCharacters : getWords;
    try {
      const results = await fetchMethod(search);
      act(() => {
        setAutoCompleteResults(results);
      });
      setIsAutoCompleteVisible(!!results.length);
    } finally {
      setIsSearchingAutoCompleteResults(false);
    }
  }, 300), []);

  const handleDismissAutocomplete = (e) => {
    if (
      !e.target.closest('[data-test="search-bar-form"]')
      && !e.target.closest('[data-test="accented-letter-popup"]')) {
      act(() => {
        setAutoCompleteResults([]);
      });
    }
  };

  useEventListener('click', (e) => handleIsEditing({ e, ...eventListenerData, accentedLetterPopupRef }));
  useEventListener('scroll', (e) => handlePosition({ e, ...eventListenerData }));
  useEventListener('resize', (e) => handlePosition({ e, ...eventListenerData }));
  useEventListener('click', handleDismissAutocomplete);

  useEffect(() => {
    if (isSearchingAutoCompleteResults) {
      setIsVisible(false);
    }
  }, [isSearchingAutoCompleteResults]);

  const handleTextInput = useCallback((e) => {
    onChange(e);
    if (searchApi) {
      debounceInput(e.target.value);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('insertDiacritic', handleTextInput);
    }
  }, []);

  return (
    <Box className="relative w-full">
      <ChakraInput
        ref={inputRef}
        value={value}
        className={`${className} ${width}`}
        onChange={(e) => {
          onChange(e);
          if (searchApi) {
            debounceInput(e.target.value);
          }
        }}
        {...rest}
      />
      {searchApi && (isAutoCompleteVisible || isSearchingAutoCompleteResults) ? (
        <Box
          data-test="auto-complete-container"
          position="absolute"
          top={`calc(${inputRef.current.clientHeight}px + 1rem)`}
          left="0"
          boxShadow="lg"
          borderRadius="md"
          backgroundColor="white"
          width="full"
          borderColor="gray.200"
          borderWidth="1px"
          zIndex={1}
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
                onClick={() => handleSelectAutocomplete(result)}
                {...(!index ? { borderTopRadius: 'md' } : {})}
                {...(index === autoCompleteResults.length - 1 ? { borderBottomRadius: 'md' } : {})}
              >
                {result.word ? (
                  <>
                    <Text fontWeight="bold">
                      {result.word}
                      <chakra.span
                        fontStyle="italic"
                        color="gray.400"
                        fontSize="sm"
                        fontWeight="normal"
                        ml={3}
                      >
                        {result.wordClass}
                      </chakra.span>
                    </Text>
                    <Text color="gray.600">{get(result, 'definitions[0].definitions[0]')}</Text>
                  </>
                ) : (
                  <>
                    <Text fontWeight="bold">
                      {result.nsibidi}
                      <chakra.span
                        fontStyle="italic"
                        color="gray.400"
                        fontSize="sm"
                        fontWeight="normal"
                        ml={3}
                      >
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
      ) : null}
      <DiacriticsBankPopup
        ref={accentedLetterPopupRef}
        inputRef={inputRef}
        positionRect={positionRect}
        isVisible={type !== 'file' && !isSearchingAutoCompleteResults && isVisible}
      />
    </Box>
  );
});

Input.defaultProps = {
  width: '100%',
  onSelect: () => {},
  searchApi: false,
  type: null,
};

export default Input;
