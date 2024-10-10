import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import FormHeader from '../../../FormHeader';
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
  <Box>
    <Box className="flex flex-row justify-between items-center">
      <FormHeader
        title="Dialectal Variations"
        subtitle="Click on 'Add Dialectal Variation' to create a new dialectal variation 👇🏾"
        tooltip="These are the dialectal (sound) variations with the current word."
      />
    </Box>
    <Box className="my-4">
      <Box
        className={`grid grid-flow-row grid-cols-1 ${
          dialects.length !== 1 ? 'xl:grid-cols-2' : 'xl:grid-cols-1'
        } gap-4`}
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
        {errors.dialects ? <p className="error">{errors.dialects.message}</p> : null}
      </Box>
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
        width="full"
        variant="primary"
        leftIcon={<AddIcon color="white" boxSize={5} />}
      >
        Add Dialectal Variation
      </Button>
    </Box>
  </Box>
);

export default CurrentDialectsForms;
