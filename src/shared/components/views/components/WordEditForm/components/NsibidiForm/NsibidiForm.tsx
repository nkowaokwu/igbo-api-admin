import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import FormHeader from '../../../FormHeader';
import NsidibiFormInterface from './NsidibiFormInterface';
import NsibidiInput from './NsibidiInput';

const NsibidiForm = React.forwardRef(({
  control,
  record,
  getValues,
  setValue,
  name = 'nsibidi',
  errors,
  hideFormHeader,
  defaultValue,
  ...rest
}: NsidibiFormInterface, ref): ReactElement => {
  const nsibidiCharactersName = `${name}Characters` || 'nsibidiCharacters';
  return (
    <Box ref={ref} className="flex flex-col w-full">
      {!hideFormHeader ? (
        <FormHeader
          title="Nsịbịdị"
          tooltip={`Nsịbịdị is a West African native script that relies on ideographic glyphs.
          Since Nsịbịdị isn't officially supported by unicode values like Latin or Chinese script,
          please reach out to the #translators Slack group to request the ability to edt this field.
          `}
        />
      ) : null}
      <Controller
        render={(props) => (
          <NsibidiInput
            {...props}
            {...rest}
            placeholder="Input in Nsịbịdị"
            data-test="definition-group-nsibidi-input"
            nsibidiFormName={nsibidiCharactersName}
            control={control}
          />
        )}
        name={name}
        defaultValue={defaultValue || (name ? get(record, name) : (record.nsibidi || getValues().nsibidi)) || ''}
        control={control}
      />
      {get(errors, `${name || 'nsibidi'}`) ? (
        <p className="error">{errors.nsibidi.message}</p>
      ) : null}
    </Box>
  );
});

export default NsibidiForm;
