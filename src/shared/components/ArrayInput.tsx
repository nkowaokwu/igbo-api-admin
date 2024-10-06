import React, { ReactElement } from 'react';
import { Box, Button } from '@material-ui/core';
import { TextInput, ArrayInput, SimpleFormIterator } from 'react-admin';
import { ArrayInputProps } from '../interfaces';

const CustomArrayInput = ({ source, label, individualLabel }: ArrayInputProps): ReactElement => {
  const [isArrayView, setIsArrayView] = React.useState(true);
  return (
    <>
      <Box className="flex justify-between items-center">
        <Box>
          <h1 className="text-2xl mt-5">{`${label} - ${isArrayView ? 'Array View' : 'String View'}`}</h1>
          {isArrayView ? (
            <p className="text-gray-600">Adding and deleting too slow? Switch to String View to make faster edits</p>
          ) : (
            <p className="text-gray-600">
              Each definition is separated by commas! Use semi-colons to convey separation within any given definition
            </p>
          )}
        </Box>
        <Button color="secondary" onClick={() => setIsArrayView(!isArrayView)}>
          Toggle View
        </Button>
      </Box>

      {isArrayView ? (
        <ArrayInput source={source} label="">
          <SimpleFormIterator>
            <TextInput source="" label={individualLabel} />
          </SimpleFormIterator>
        </ArrayInput>
      ) : (
        <TextInput multiline source={source} />
      )}
    </>
  );
};

export default CustomArrayInput;
