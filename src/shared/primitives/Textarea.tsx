import React, {
  useEffect,
  useState,
  useRef,
  ReactElement,
} from 'react';
import { Box, Textarea as ChakraTextarea } from '@chakra-ui/react';
import { isMobile } from 'react-device-detect';
import useEventListener from 'src/hooks/useEventListener';
import DiacriticsBankPopup from './DiacriticsBankPopup';
import { handlePosition, handleIsEditing } from './utils/positions';

const Textarea = React.forwardRef(({
  value,
  onChange,
  className,
  ...rest
} : {
  value: string,
  onChange: (value: any) => void,
  width?: string,
  className: string,
  placeholder: string,
  rows?: number,
}, ref): ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionRect, setPositionRect] = useState({});
  const accentedLetterPopupRef = useRef(null);
  const inputRef = useRef(ref);

  const eventListenerData = {
    anchorRef: inputRef,
    setPositionRect,
    isMobile,
    setIsVisible,
  };

  useEventListener('click', (e) => handleIsEditing({ e, ...eventListenerData, accentedLetterPopupRef }));
  useEventListener('scroll', (e) => handlePosition({ e, ...eventListenerData }));
  useEventListener('resize', (e) => handlePosition({ e, ...eventListenerData }));

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('insertDiacritic', onChange);
    }
  }, []);

  return (
    <Box className="relative w-full">
      <ChakraTextarea
        ref={inputRef}
        value={value}
        className={className}
        onChange={onChange}
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

Textarea.defaultProps = {
  width: '100%',
  rows: 8,
};

export default Textarea;
