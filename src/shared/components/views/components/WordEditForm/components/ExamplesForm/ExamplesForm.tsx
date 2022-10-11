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
import AddExampleButton from './AddExampleButton';
import FormHeader from '../../../FormHeader';
import ExamplesFormInterface from './ExamplesFormInterface';
import Example from './Example';

const ExamplesForm = ({
  errors,
  examples,
  setExamples,
  getValues,
  setValue,
  control,
}: ExamplesFormInterface): ReactElement => (
  <>
    <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
      <FormHeader
        title="Examples"
        tooltip="Example sentences should ideally in Standard Igbo."
      />
      <AddExampleButton examples={examples} setExamples={setExamples} />
    </Box>
    <Box className="flex items-center my-5 w-full justify-between">
      <Accordion defaultIndex={[0]} allowMultiple className="w-full">
        <AccordionItem key="1">
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {`Examples (${examples.length})`}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {examples?.length ? examples.map((example, index) => (
              <Box key={example.id}>
                <Example
                  key={`example-${example.id}`}
                  setExamples={setExamples}
                  examples={examples}
                  example={example}
                  getValues={getValues}
                  setValue={setValue}
                  control={control}
                  index={index}
                />
                {errors.examples?.[index] ? (
                  <p className="error">
                    {errors.examples[index]?.pronunciation?.message || errors.examples[index]?.message}
                  </p>
                ) : null}
              </Box>
            )) : (
              <Box className="flex w-full justify-center mb-2">
                <Text className="italic text-gray-700">No examples</Text>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  </>
);

export default ExamplesForm;
