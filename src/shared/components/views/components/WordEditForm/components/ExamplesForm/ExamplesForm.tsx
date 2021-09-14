import React, { ReactElement } from 'react';
import { Controller } from 'react-hook-form';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Input } from '../../../../../../primitives';
import AddExampleButton from './AddExampleButton';
import FormHeader from '../../../FormHeader';
import ExamplesFormInterface from './ExamplesFormInterface';

const ExamplesForm = ({
  examples,
  setExamples,
  getValues,
  control,
}: ExamplesFormInterface): ReactElement => (
  <>
    <FormHeader
      title="Examples"
      tooltip="Example sentences should ideally in Standard Igbo."
    />
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

            <AddExampleButton examples={examples} setExamples={setExamples} />
            {examples?.length ? examples.map(({
              igbo,
              english,
              id = '',
              associatedWords,
              originalExampleId,
            }, index) => {
              const formData = getValues();
              return (
                <Box className="list-container" key={`${igbo}-${english}`}>
                  <Box
                    data-example-id={id}
                    data-original-example-id={originalExampleId}
                    data-associated-words={associatedWords}
                    className="flex flex-col w-full space-y-3"
                  >
                    <Controller
                      render={(props) => (
                        <Input
                          {...props}
                          className="form-input invisible"
                          placeholder="Original Example Id"
                          data-test={`examples-${index}-originalExampleId`}
                        />
                      )}
                      name={`examples[${index}].originalExampleId`}
                      defaultValue={originalExampleId}
                      control={control}
                    />
                    <Controller
                      render={(props) => (
                        <Input
                          {...props}
                          className="form-input invisible"
                          placeholder="Example Id"
                          data-test={`examples-${index}-id`}
                        />
                      )}
                      name={`examples[${index}].id`}
                      defaultValue={id}
                      control={control}
                    />
                    <h3 className="text-gray-700">Igbo:</h3>
                    <Controller
                      render={(props) => (
                        <Input
                          {...props}
                          className="form-input"
                          placeholder="Example in Igbo"
                          data-test={`examples-${index}-igbo-input`}
                        />
                      )}
                      name={`examples[${index}].igbo`}
                      defaultValue={igbo || (formData.examples && formData.examples[index]?.igbo) || ''}
                      control={control}
                    />
                    <h3 className="text-gray-700">English:</h3>
                    <Controller
                      render={(props) => (
                        <Input
                          {...props}
                          className="form-input"
                          placeholder="Example in English"
                          data-test={`examples-${index}-english-input`}
                        />
                      )}
                      name={`examples[${index}].english`}
                      defaultValue={english || (formData.examples && formData.examples[index]?.english) || ''}
                      control={control}
                    />
                  </Box>
                  <Button
                    colorScheme="red"
                    aria-label="Delete Example"
                    onClick={() => {
                      const updateExamples = [...examples];
                      updateExamples.splice(index, 1);
                      setExamples(updateExamples);
                    }}
                    className="ml-3"
                    leftIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </Box>
              );
            }) : (
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
