import React, { ReactElement } from 'react';
import { capitalize } from 'lodash';
import { Controller } from 'react-hook-form';
import { Box } from '@chakra-ui/react';
import { Input } from 'src/shared/primitives';
import Tense from 'src/backend/shared/constants/Tense';
import FormHeader from '../../../FormHeader';
import TensesFormInterface from './TensesFormInterface';

const DEFAULT_TENSES = Object.values(Tense).reduce((finalTenses, tense) => ({
  ...finalTenses,
  [tense.value]: '',
}), {});
const TENSES_DOC = 'https://www.notion.so/Verb-Conjugation-Rules-1a37590fdfca42518ee5ea2d049229a9';

const TensesForm = ({
  record,
  errors,
  control,
}: TensesFormInterface): ReactElement => (
  <Box className="w-full">
    <FormHeader
      title="Tenses"
      tooltip="Common verb conjugations (tenses) for the given word. Click here to see verb conjugation rules."
      onClick={() => {
        window.open(TENSES_DOC, '_blank');
      }}
    />
    {Object.entries(record.tenses || DEFAULT_TENSES).map(([key, value]) => (
      <>
        <Controller
          render={({ onChange, ref }) => {
            const label = capitalize(key.replace(/([A-Z])/g, ' $1'));
            return (
              <>
                <h3 className="text-gray-700 mb-2">{`${label}:`}</h3>
                <Input
                  onChange={(e) => onChange(e.target.value)}
                  defaultValue={record?.tenses?.[key]}
                  placeholder={label}
                  ref={ref}
                  data-test={`tenses-${key}-input`}
                  mb={4}
                />
              </>
            );
          }}
          defaultValue={value}
          name={`tenses.${key}`}
          control={control}
        />
        {errors.tenses?.[key] ? (
          <p className="error relative">Fill in associated tense</p>
        ) : null}
      </>
    ))}
  </Box>
);

export default TensesForm;
