import React, { ReactElement } from 'react';
import { Textarea } from '@chakra-ui/react';
import { ConfirmationInputInterface } from './ConfirmationInterface';

/* Custom form for taking in notes */
const InputNoteForm = ({
  onChange,
  value,
  onSubmit,
  header,
  ...rest
}: ConfirmationInputInterface): ReactElement => (
  <form onSubmit={onSubmit}>
    <h1 className="text-gray-700 mb-2">{header}</h1>
    <Textarea
      required
      className="h-10 w-full lg:w-64 bg-gray-300 px-4 rounded-lg border border-solid border-gray-400"
      type="text"
      value={value}
      onChange={onChange}
      {...rest}
    />
  </form>
);

export default InputNoteForm;
