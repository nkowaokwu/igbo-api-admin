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
  name,
}: NsidibiFormInterface, ref): ReactElement => (
  <Box ref={ref} className="flex flex-col w-full">
    <FormHeader
      title="Nsịbịdị"
      tooltip={`Nsịbịdị is a West African native script that relies on buildable icons.
      Since Nsịbịdị isn't officially supported by unicode values like Latin or Chinese script,
      please reach out to the #translators Slack group to request the ability to edt this field.
      `}
    />
    <Controller
      render={(props) => (
        <NsibidiInput {...props} />
      )}
      name={name || 'nsibidi'}
      control={control}
      defaultValue={name ? get(record, name) : (record.nsibidi || getValues().nsibidi)}
    />
  </Box>
));

export default NsibidiForm;
