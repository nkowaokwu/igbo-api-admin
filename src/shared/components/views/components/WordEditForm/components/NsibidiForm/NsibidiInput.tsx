import React, { ReactElement } from 'react';
import { Text, Tooltip, chakra } from '@chakra-ui/react';
import { Input } from 'src/shared/primitives';

const NsibidiInput = React.forwardRef((props : {
  value: string
  onChange: (value: any) => void,
  placeholder?: string,
  'data-test'?: string,
  defaultValue?: string,
}, ref): ReactElement => {
  const {
    value,
    placeholder = 'i.e. 貝名, 貝è捧捧, 和硝',
    'data-test': dataTest = 'nsibidi-input',
  } = props;
  return (
    <>
      <Input
        {...props}
        ref={ref}
        className="form-input"
        placeholder={placeholder}
        data-test={dataTest}
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
    </>
  );
});

export default NsibidiInput;
