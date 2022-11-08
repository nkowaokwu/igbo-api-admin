import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import DialectForm from '../../DialectForm/DialectForm';
import CurrentDialectFormsInterface from './CurrentDialectFormsInterface';

const CurrentDialectsForms = ({
  errors,
  record,
  originalRecord,
  control,
  getValues,
  setValue,
  setDialects,
  dialects,
}: CurrentDialectFormsInterface): ReactElement => (
  <Box className="mb-4">
    <Button
      onClick={() => {
        setDialects([
          ...dialects,
          {
            word: 'New dialectal variation',
            dialects: [],
            variations: [],
            pronunciation: '',
          },
        ]);
      }}
      colorScheme="green"
      leftIcon={<AddIcon color="white" boxSize={5} />}
    >
      Add Dialectal Variation
    </Button>
    <Box
      className={'grid grid-flow-row grid-cols-1 '
      + `${dialects.length !== 1 ? 'xl:grid-cols-2' : 'xl:grid-cols-1'} gap-4`}
    >
      {dialects.map((dialect, index) => (
        // eslint-disable-next-line
        <Box key={`dialectal-variation-${dialect.word}-${dialect.id || ''}-${index}`}>
          <DialectForm
            errors={errors}
            index={index}
            record={record}
            control={control}
            getValues={getValues}
            setValue={setValue}
            setDialects={setDialects}
            dialects={dialects}
            originalRecord={originalRecord}
          />
        </Box>
      ))}
      {errors.dialects ? (
        <p className="error">{errors.dialects.message}</p>
      ) : null}
    </Box>
  </Box>
);

export default CurrentDialectsForms;
