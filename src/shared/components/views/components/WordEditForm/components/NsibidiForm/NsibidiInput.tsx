import React, { useState, ReactElement, useEffect } from 'react';
import { Text, Tooltip, chakra } from '@chakra-ui/react';
import { Input } from 'src/shared/primitives';
import { getNsibidiCharacters } from 'src/shared/API';
import NsibidiDropdown from './components/NsibidiDropdown';

const NsibidiInput = React.forwardRef((props : {
  value: string
  onChange: (value: any) => void,
  placeholder?: string,
  'data-test'?: string,
  defaultValue?: string,
}, ref): ReactElement => {
  const [nsibidiOptions, setNsibidiOptions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isNsibidiDropdownVisible, setIsNsibidiDropdownVisible] = useState(false);
  const {
    value,
    placeholder = 'i.e. 貝名, 貝è捧捧, 和硝',
    'data-test': dataTest = 'nsibidi-input',
  } = props;

  const handleNsibidiChange = async (e: HTMLInputElement) => {
    const input = e.target.value;
    const nsibidiCharacters = await getNsibidiCharacters(input);
    // TODO: filter out characters that are already attached
    setNsibidiOptions(nsibidiCharacters);
  };

  const handleFocusInput = () => {
    setIsInputFocused(true);
  };

  const handleBlurInput = () => {
    setIsInputFocused(false);
  };

  useEffect(() => {
    setIsNsibidiDropdownVisible(nsibidiOptions.length && isInputFocused);
  }, [isInputFocused, nsibidiOptions]);
  return (
    <>
      <Input
        {...props}
        ref={ref}
        placeholder={placeholder}
        data-test={dataTest}
        onChange={handleNsibidiChange}
        onFocus={handleFocusInput}
        onBlur={handleBlurInput}
      />
      {value ? (
        <Tooltip
          label="The rendered script is the final Nsịbịdị that will be shown to users"
          placement="bottom-start"
        >
          <Text className=" mt-2">
            {'Rendered Nsịbịdị: '}
            <chakra.span className="akagu">{value}</chakra.span>
          </Text>
        </Tooltip>
      ) : null}
      {isNsibidiDropdownVisible ? (
        <NsibidiDropdown />
      ) : null}
    </>
  );
});

export default NsibidiInput;
