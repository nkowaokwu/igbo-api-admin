import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  ReactElement,
} from 'react';
import { debounce } from 'lodash';
import {
  Box,
  Input as ChakraInput,
  Spinner,
  Text,
  chakra,
} from '@chakra-ui/react';
import { isMobile } from 'react-device-detect';
import getWord from 'src/utils/getWord';
import useEventListener from 'src/hooks/useEventListener';
import DiacriticsBankPopup from './DiacriticsBankPopup';
import { handlePosition, handleIsEditing } from './utils/positions';

const Input = React.forwardRef(({
  value,
  onChange,
  width,
  className,
  type,
  onSelect,
  searchApi,
  ...rest
} : {
  value: string,
  onChange: (value: any) => void,
  width?: string,
  className: string,
  placeholder: string,
  type?: string,
  onSelect?: (e: any) => void,
  searchApi?: boolean,
}, ref): ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionRect, setPositionRect] = useState({});
  const [autoCompleteWords, setAutoCompleteWords] = useState([]);
  const [isSearchingAutoCompleteWords, setIsSearchingAutoCompleteWords] = useState(false);
  const [isAutoCompleteVisible, setIsAutoCompleteVisible] = useState(false);
  const accentedLetterPopupRef = useRef(null);
  const inputRef = useRef(ref);

  const eventListenerData = {
    anchorRef: inputRef,
    accentedLetterPopupRef,
    setPositionRect,
    isMobile,
    setIsVisible,
  };

  const handleSelectAutocomplete = (word) => {
    onSelect(word);
  };

  const debounceInput = useCallback(debounce(async (search) => {
    setIsSearchingAutoCompleteWords(true);
    try {
      const words = await getWord(search);
      setAutoCompleteWords(words);
      setIsAutoCompleteVisible(!!words.length);
    } finally {
      setIsSearchingAutoCompleteWords(false);
    }
  }, 300), []);

  const handleDismissAutocomplete = (e) => {
    if (
      !e.target.closest('[data-test="search-bar-form"]')
      && !e.target.closest('[data-test="accented-letter-popup"]')) {
      setAutoCompleteWords([]);
    }
  };

  useEventListener('click', (e) => handleIsEditing({ e, ...eventListenerData }));
  useEventListener('scroll', (e) => handlePosition({ e, ...eventListenerData }));
  useEventListener('resize', (e) => handlePosition({ e, ...eventListenerData }));
  useEventListener('click', handleDismissAutocomplete);

  useEffect(() => {
    if (isSearchingAutoCompleteWords) {
      setIsVisible(false);
    }
  }, [isSearchingAutoCompleteWords]);

  return (
    <Box className="relative w-full">
      <ChakraInput
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e);
          if (searchApi) {
            debounceInput(e.target.value);
          }
        }}
        className={`${className} ${width}`}
        {...rest}
      />
      {searchApi && (isAutoCompleteVisible || isSearchingAutoCompleteWords) ? (
        <Box
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
          {isSearchingAutoCompleteWords ? (
            <Box width="full" display="flex" justifyContent="center" py={4}>
              <Spinner color="primary" />
            </Box>
          ) : (
            autoCompleteWords.map((word, index) => (
              <Box
                key={word.id}
                py={3}
                px={2}
                _hover={{ backgroundColor: 'selected' }}
                _active={{ backgroundColor: 'selected' }}
                cursor="pointer"
                userSelect="none"
                className="transition-all duration-100"
                onClick={() => handleSelectAutocomplete(word)}
                {...(!index ? { borderTopRadius: 'md' } : {})}
                {...(index === autoCompleteWords.length - 1 ? { borderBottomRadius: 'md' } : {})}
              >
                <Text fontWeight="bold">
                  {word.word}
                  <chakra.span
                    fontStyle="italic"
                    color="gray.400"
                    fontSize="sm"
                    fontWeight="normal"
                    ml={3}
                  >
                    {word.wordClass}
                  </chakra.span>
                </Text>
                <Text color="gray.600">{word.definitions[0]}</Text>
              </Box>
            ))
          )}
        </Box>
      ) : null}
      {type !== 'file' && !isSearchingAutoCompleteWords && isVisible ? (
        <DiacriticsBankPopup
          ref={accentedLetterPopupRef}
          inputRef={inputRef}
          positionRect={positionRect}
          isVisible={isVisible}
        />
      ) : null}
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
