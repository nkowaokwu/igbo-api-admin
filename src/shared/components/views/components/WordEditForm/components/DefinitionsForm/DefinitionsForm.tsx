import React, { ReactElement } from 'react';
import { Controller } from 'react-hook-form';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import FormHeader from '../../../FormHeader';
import { Textarea } from '../../../../../../primitives';
import DefinitionsFormInterface from './DefinitionsFormInterface';

const DefinitionsForm = ({
  definitions,
  setDefinitions,
  errors,
  control,
}: DefinitionsFormInterface): ReactElement => (
  <Box className="w-full">
    <Box className="flex items-start my-5 w-full justify-between">
      <Box className="flex flex-col">
        <FormHeader
          title="Definitions"
          tooltip="Separate definitions if each are vastly different in contextual meaning"
        />
      </Box>
      <Button
        colorScheme="teal"
        aria-label="Add Definition"
        onClick={() => {
          const updateDefinitions = [...definitions];
          updateDefinitions.push('');
          setDefinitions(updateDefinitions);
        }}
        leftIcon={<AddIcon />}
      >
        Add Definition
      </Button>
    </Box>
    {definitions.map((definition, index) => (
      <Box key={definition}>
        <Box className="list-container">
          <h3 className="text-xl text-gray-600 mr-2">
            {`${index + 1}.`}
          </h3>
          <Controller
            render={(props) => (
              <Textarea
                {...props}
                rows={3}
                className="form-textarea"
                placeholder="Definition"
                data-test={`definitions-${index}-input`}
              />
            )}
            name={`definitions[${index}]`}
            defaultValue={definition}
            control={control}
            rules={{
              required: !index,
            }}
          />
          {index ? (
            <Button
              colorScheme="red"
              onClick={() => {
                const updateDefinitions = [...definitions];
                updateDefinitions.splice(index, 1);
                setDefinitions(updateDefinitions);
              }}
              className="ml-3"
              leftIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          ) : null }
        </Box>
      </Box>
    ))}
    {errors.definitions && (
      <span className="error relative">Definition is required</span>
    )}
  </Box>
);
export default DefinitionsForm;
