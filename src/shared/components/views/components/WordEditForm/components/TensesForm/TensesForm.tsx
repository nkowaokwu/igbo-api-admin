import React, { ReactElement } from 'react';
import { capitalize } from 'lodash';
import { Controller } from 'react-hook-form';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Input } from 'src/shared/primitives';
import TenseEnum from 'src/backend/shared/constants/TenseEnum';
import FormHeader from '../../../FormHeader';
import TensesFormInterface from './TensesFormInterface';

const DEFAULT_TENSES = Object.values(TenseEnum).reduce(
  (finalTenses, tense) => ({
    ...finalTenses,
    [tense]: '',
  }),
  {},
);
const TENSES_DOC = 'https://www.notion.so/Verb-Conjugation-Rules-1a37590fdfca42518ee5ea2d049229a9';

const TensesForm = ({ record, errors, control }: TensesFormInterface): ReactElement => (
  <Box className="w-full">
    <FormHeader
      title="Tenses"
      tooltip="Common verb conjugations (tenses) for the given word. Click here to see verb conjugation rules."
      onClick={() => {
        window.open(TENSES_DOC, '_blank');
      }}
    />
    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(record.tenses || DEFAULT_TENSES).map(([key, value]) => (
        <Box key={key}>
          <Controller
            render={({ field: { onChange, ref } }) => {
              const label = capitalize(key.replace(/([A-Z])/g, ' $1'));
              return (
                <Box>
                  <Text className="text-gray-700 mb-2">
                    {`${label}:`}
                    {key === TenseEnum.PRESENT_PASSIVE ? (
                      <Tooltip
                        label={
                          'The present passive verb tense should only be filled in if the ' +
                          'current verb is considered "special" like a medial verb'
                        }
                      >
                        <InfoOutlineIcon color="gray" boxSize={4} className="ml-2" />
                      </Tooltip>
                    ) : null}
                  </Text>
                  <Input
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={record?.tenses?.[key]}
                    placeholder={label}
                    ref={ref}
                    data-test={`tenses-${key}-input`}
                    mb={4}
                  />
                </Box>
              );
            }}
            defaultValue={value}
            name={`tenses.${key}`}
            control={control}
          />
          {errors.tenses?.[key] ? <p className="error relative">Fill in associated tense</p> : null}
        </Box>
      ))}
    </Box>
  </Box>
);

export default TensesForm;
