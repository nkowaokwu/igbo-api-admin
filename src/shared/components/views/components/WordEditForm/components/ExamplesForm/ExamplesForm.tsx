import React, { ReactElement } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Text,
} from '@chakra-ui/react';
import { useFieldArray } from 'react-hook-form';
import AddExampleButton from './AddExampleButton';
import FormHeader from '../../../FormHeader';
import ExamplesFormInterface from './ExamplesFormInterface';
import Example from './Example';

const ExamplesForm = ({ control }: ExamplesFormInterface): ReactElement => {
  const { fields: examples, append, remove } = useFieldArray({
    control,
    name: 'examples',
  });
  const { setValue } = control;

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <FormHeader
          title="Examples"
          tooltip="Example sentences should ideally in Standard Igbo."
        />
      </Box>
      <Box className="flex items-center my-5 w-full justify-between">
        <Accordion defaultIndex={[0]} allowMultiple className="w-full">
          <AccordionItem key="1">
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontFamily="Silka">{`Examples (${examples.length})`}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {examples?.length ? examples.map((example, index) => (
                <Example
                  key={`example-${example.createdAt}`}
                  example={example}
                  remove={remove}
                  index={index}
                  control={control}
                  setValue={setValue}
                />
              )) : (
                <Box className="flex w-full justify-center mb-2">
                  <Text className="italic text-gray-700" fontFamily="Silka">No examples</Text>
                </Box>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
      <AddExampleButton append={append} />
    </>
  );
};

export default ExamplesForm;
