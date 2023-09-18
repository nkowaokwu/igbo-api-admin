import React, { useCallback, useEffect, useState, useRef, ReactElement } from 'react';
import { act } from 'react-dom/test-utils';
import { debounce, omit, noop } from 'lodash';
import { Box, Input as ChakraInput, InputProps } from '@chakra-ui/react';
import { isMobile } from 'react-device-detect';
import useEventListener from 'src/hooks/useEventListener';
import WordResults from 'src/shared/primitives/WordResults';
import { getNsibidiCharacters, getWords } from '../API';
import DiacriticsBankPopup from './DiacriticsBankPopup';
import { handlePosition, handleIsEditing } from './utils/positions';
import Collections from '../constants/Collection';

const Input = React.forwardRef(
  (
    {
      value,
      onChange,
      width,
      className,
      type,
      onSelect,
      searchApi,
      collection,
      hideDiacritics,
      ...rest
    }: {
      value?: string;
      onChange: (value: any) => void;
      width?: string;
      className?: string;
      placeholder?: string;
      type?: string;
      onBlur?: () => void;
      defaultValue?: string;
      onSelect?: (e: any) => void;
      searchApi?: boolean;
      collection?: Collections;
      isDisabled?: boolean;
      hideDiacritics?: boolean;
    } & InputProps,
    ref,
  ): ReactElement => {
    const [isVisible, _setIsVisible] = useState(false);
    const [positionRect, setPositionRect] = useState({});
    const [autoCompleteResults, setAutoCompleteResults] = useState([]);
    const [isSearchingAutoCompleteResults, setIsSearchingAutoCompleteResults] = useState(false);
    const [isAutoCompleteVisible, setIsAutoCompleteVisible] = useState(false);
    const accentedLetterPopupRef = useRef(null);
    const inputRef = useRef(ref);

    const setIsVisible = hideDiacritics ? noop : _setIsVisible;

    const eventListenerData = {
      anchorRef: inputRef,
      setPositionRect,
      isMobile,
      setIsVisible,
    };

    const handleSelectAutocomplete = (word) => {
      onSelect(word);
    };

    const debounceInput = useCallback(
      debounce(async (search) => {
        setIsSearchingAutoCompleteResults(true);
        const fetchMethod = collection === Collections.NSIBIDI_CHARACTERS ? getNsibidiCharacters : getWords;
        if (!search) {
          setIsSearchingAutoCompleteResults(false);
          return;
        }
        try {
          const results = await fetchMethod(search);
          act(() => {
            setAutoCompleteResults(results);
          });
          setIsAutoCompleteVisible(!!results.length);
        } finally {
          setIsSearchingAutoCompleteResults(false);
        }
      }, 300),
      [],
    );

    const handleDismissAutocomplete = (e) => {
      if (
        !e.target.closest('[data-test="search-bar-form"]') &&
        !e.target.closest('[data-test="accented-letter-popup"]')
      ) {
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
          {...omit(rest, ['enableSearch', 'nsibidiFormName'])}
        />
        {searchApi && (isAutoCompleteVisible || isSearchingAutoCompleteResults) ? (
          <WordResults
            inputRef={inputRef}
            isSearchingAutoCompleteResults={isSearchingAutoCompleteResults}
            autoCompleteResults={autoCompleteResults}
            onClick={handleSelectAutocomplete}
          />
        ) : null}
        <DiacriticsBankPopup
          ref={accentedLetterPopupRef}
          inputRef={inputRef}
          positionRect={positionRect}
          isVisible={type !== 'file' && !isSearchingAutoCompleteResults && isVisible}
        />
      </Box>
    );
  },
);

Input.defaultProps = {
  width: '100%',
  onSelect: () => {},
  searchApi: false,
  type: null,
};

export default Input;
