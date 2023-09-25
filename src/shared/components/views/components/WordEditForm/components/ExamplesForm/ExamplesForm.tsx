import React, { ReactElement } from 'react';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';
import { useFieldArray } from 'react-hook-form';
import SummaryList from 'src/shared/components/views/shows/components/SummaryList';
import ReactAudioPlayer from 'react-audio-player';
import AddExampleButton from './AddExampleButton';
import SearchAndAddExampleButton from './SearchAndAddExampleButton';
import FormHeader from '../../../FormHeader';
import ExamplesFormInterface from './ExamplesFormInterface';
import Example from './Example';

const ExamplesForm = ({ control }: ExamplesFormInterface): ReactElement => {
  const { fields: examples, append } = useFieldArray({
    control,
    name: 'examples',
  });
  const { setValue } = control;
  const archivedExamples = examples.filter(({ archived = false }) => archived);

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <FormHeader title="Examples" tooltip="Example sentences should ideally in Standard Igbo." />
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
              {examples?.length ? (
                examples.map((example, index) => (
                  <Example
                    key={`example-${example.id}`}
                    example={example}
                    index={index}
                    control={control}
                    setValue={setValue}
                  />
                ))
              ) : (
                <Box className="flex w-full justify-center mb-2">
                  <Text className="italic text-gray-700" fontFamily="Silka">
                    No examples
                  </Text>
                </Box>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
      <Box className="w-full flex flex-row justify-center items-center space-x-3">
        <AddExampleButton append={append} />
        <SearchAndAddExampleButton append={append} />
      </Box>
      <SummaryList
        items={archivedExamples}
        title="Archived Examples 🗄"
        render={(archivedExample, archivedExampleIndex) => (
          <>
            <Text color="gray.600" mr={3}>{`${archivedExampleIndex + 1}.`}</Text>
            <Box>
              <Text>{archivedExample.igbo}</Text>
              <Text>{archivedExample.english}</Text>
              <Text>{archivedExample.nsibidi}</Text>
              <Text>{archivedExample.meaning}</Text>
              <ReactAudioPlayer
                src={archivedExample.pronunciation}
                style={{ height: '40px', width: '250px' }}
                controls
              />
            </Box>
          </>
        )}
      />
    </>
  );
};

export default ExamplesForm;
