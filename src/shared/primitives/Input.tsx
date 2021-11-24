import React, { useState, useRef, ReactElement } from 'react';
import { Box, Input as ChakraInput } from '@chakra-ui/react';
import { isMobile } from 'react-device-detect';
import DiacriticsBankPopup from './DiacriticsBankPopup';
import useEventListener from '../../hooks/useEventListener';
import { handlePosition, handleIsEditing } from './utils/positions';

const Input = React.forwardRef(({
  value,
  onChange,
  width,
  className,
  ...rest
} : {
  value: string,
  onChange: (value: any) => void,
  width?: string,
  className: string,
  placeholder: string,
}, ref): ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionRect, setPositionRect] = useState({});
  const accentedLetterPopupRef = useRef(null);
  const inputRef = useRef(ref);

  const eventListenerData = {
    anchorRef: inputRef,
    accentedLetterPopupRef,
    setPositionRect,
    isMobile,
    setIsVisible,
  };

  useEventListener('click', (e) => handleIsEditing({ e, ...eventListenerData }));
  useEventListener('scroll', (e) => handlePosition({ e, ...eventListenerData }));
  useEventListener('resize', (e) => handlePosition({ e, ...eventListenerData }));

  return (
    <Box className="relative w-full">
      <ChakraInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        className={`${className} ${width}`}
        {...rest}
      />
      <DiacriticsBankPopup
        ref={accentedLetterPopupRef}
        inputRef={inputRef}
        positionRect={positionRect}
        isVisible={isVisible}
      />
    </Box>
  );
});

Input.defaultProps = {
  width: '100%',
};

export default Input;
