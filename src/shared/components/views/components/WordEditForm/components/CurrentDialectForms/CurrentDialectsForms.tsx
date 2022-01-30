import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import DialectForm from '../../DialectForm/DialectForm';
import CurrentDialectFormsInterface from './CurrentDialectFormsInterface';

const CurrentDialectsForms = ({
  record,
  originalRecord,
  control,
  getValues,
  setValue,
  setDialects,
  dialects,
}: CurrentDialectFormsInterface): ReactElement => (
  <Box>
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
      Add dialectal variation
    </Button>
    <Box
      className={'grid grid-flow-row grid-cols-1 '
      + `${dialects.length !== 1 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-4`}
    >
      {dialects.map((dialect, index) => (
        <Box key={`dialectal-variation-${dialect.word}`}>
          <DialectForm
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
    </Box>
  </Box>
);

export default CurrentDialectsForms;
