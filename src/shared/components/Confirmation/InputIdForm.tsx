import React, { ReactElement } from 'react';
import { Input } from '@chakra-ui/react';
import { ConfirmationInputInterface } from './ConfirmationInterface';

/* Custom form for taking in word ids */
const InputIdForm = ({
  onChange,
  value,
  onSubmit,
  header,
  ...rest
} : ConfirmationInputInterface): ReactElement => (
  <form onSubmit={onSubmit}>
    <h1 className="text-gray-700 mb-2">{header}</h1>
    <Input
      required
      className="h-10 w-full lg:w-64 bg-gray-300 px-4 rounded-lg border border-solid border-gray-400"
      type="text"
      value={value}
      onChange={onChange}
      {...rest}
    />
  </form>
);

export default InputIdForm;
