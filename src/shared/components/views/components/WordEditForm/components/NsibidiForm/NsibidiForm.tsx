import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller, useFieldArray } from 'react-hook-form';
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
  const { fields: nsibidiCharacters, append, remove } = useFieldArray({
    control,
    name: nsibidiCharactersName,
  });
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
            append={append}
            remove={remove}
            nsibidiCharacterIds={nsibidiCharacters}
          />
        )}
        name={name || 'nsibidi'}
        control={control}
        defaultValue={defaultValue || (name ? get(record, name) : (record.nsibidi || getValues().nsibidi)) || ''}
      />
      {nsibidiCharacters.map(({ id: nsibidiCharacterId }, index) => {
        const currentNsibidiCharacterName = `${nsibidiCharactersName}.${index}.id`;
        return (
          <Controller
            render={(props) => (
              <input
                {...props}
                style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
              />
            )}
            name={currentNsibidiCharacterName}
            control={control}
            defaultValue={nsibidiCharacterId}
          />
        );
      })}
      {get(errors, `${name || 'nsibidi'}`) ? (
        <p className="error">{errors.nsibidi.message}</p>
      ) : null}
    </Box>
  );
});

export default NsibidiForm;
