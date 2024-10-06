import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import FormHeader from '../../../FormHeader';
import NsibidiFormInterface from './NsibidiFormInterface';
import NsibidiInput from './NsibidiInput';

const NsibidiForm = React.forwardRef(
  (
    { control, getValues, name = 'nsibidi', errors, hideFormHeader, defaultValue, ...rest }: NsibidiFormInterface,
    ref,
  ): ReactElement => {
    const isIgboAPIProject = useIsIgboAPIProject();
    const nsibidiCharactersName = `${name}Characters` || 'nsibidiCharacters';
    return isIgboAPIProject ? (
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
          render={({ field: props }) => (
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
          defaultValue={defaultValue || getValues(name) || ''}
          control={control}
        />
        {get(errors, `${name || 'nsibidi'}`) ? (
          <p className="error">{errors.nsibidi?.message || errors[name]?.message}</p>
        ) : null}
      </Box>
    ) : null;
  },
);

export default NsibidiForm;
