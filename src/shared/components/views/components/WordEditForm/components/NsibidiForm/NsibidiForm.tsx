import React, { ReactElement } from 'react';
import {
  Box,
  Text,
  Tooltip,
  chakra,
} from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import FormHeader from '../../../FormHeader';
import NsidibiFormInterface from './NsidibiFormInterface';

const NsibidiForm = ({
  control,
  record,
  getValues,
}: NsidibiFormInterface): ReactElement => (
  <Box className="flex flex-col w-full">
    <FormHeader
      title="Nsịbịdị"
      tooltip={`Nsịbịdị is a West African native script that relies on buildable icons.
      Since Nsịbịdị isn't officially supported by unicode values like Latin or Chinese script,
      please reach out to the #translators Slack group to request the ability to edt this field.
      `}
    />
    <Controller
      render={(props) => (
        <>
          <Input
            {...props}
            className="form-input"
            placeholder="i.e. 貝名, 貝è捧捧, 和硝"
            data-test="nsibidi-input"
          />
          {props.value ? (
            <Tooltip label="The rendered script is the final Nsịbịdị that will be shown to users">
              <Text className="mt-2">
                {'Rendered Nsịbịdị: '}
                <chakra.span className="akagu">{props.value}</chakra.span>
              </Text>
            </Tooltip>
          ) : null}
        </>
      )}
      name="nsibidi"
      control={control}
      defaultValue={record.nsibidi || getValues().nsibidi}
    />
  </Box>
);

export default NsibidiForm;
