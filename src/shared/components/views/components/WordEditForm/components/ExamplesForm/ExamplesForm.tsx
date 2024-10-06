import React, { ReactElement } from 'react';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';
import { get } from 'lodash';
import { useFieldArray } from 'react-hook-form';
import { LuArchive } from 'react-icons/lu';
import ReactAudioPlayer from 'react-audio-player';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import AddExampleButton from './AddExampleButton';
import SearchAndAddExampleButton from './SearchAndAddExampleButton';
import FormHeader from '../../../FormHeader';
import ExamplesFormInterface from './ExamplesFormInterface';
import Example from './Example';

const ExamplesForm = ({ control, setValue, getValues }: ExamplesFormInterface): ReactElement => {
  const {
    fields: examples,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'examples',
  });
  const archivedExamples = examples.filter(({ archived = false }) => archived);

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <FormHeader title="Sentences" tooltip="Example sentences should ideally in Standard Igbo." />
      </Box>
      <Box className="flex items-center my-5 w-full justify-between">
        <Accordion defaultIndex={[0]} allowMultiple className="w-full">
          <AccordionItem key="1">
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontFamily="Silka">{`Sentences (${examples.length})`}</Text>
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
                    remove={remove}
                    index={index}
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                  />
                ))
              ) : (
                <Box className="flex w-full justify-center mb-2">
                  <Text className="italic text-gray-700" fontFamily="Silka">
                    No sentences
                  </Text>
                </Box>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
      <Box className="w-full flex flex-col lg:flex-row justify-center items-center space-y-3 lg:space-y-0 lg:space-x-3">
        <AddExampleButton append={append} />
        <SearchAndAddExampleButton append={append} />
      </Box>
      {archivedExamples.length ? (
        <ShowTextRenderer title="Archived sentences" icon={<LuArchive />}>
          {archivedExamples.map((archivedExample, archivedExampleIndex) => (
            <>
              <Text color="gray.600" mr={3}>{`${archivedExampleIndex + 1}.`}</Text>
              <Box>
                <Text>{get(archivedExample, 'source.text')}</Text>
                <Text>{get(archivedExample, 'translations.0.text')}</Text>
                <Text>{archivedExample.nsibidi}</Text>
                <Text>{archivedExample.meaning}</Text>
                <ReactAudioPlayer
                  src={archivedExample.pronunciation}
                  style={{ height: '40px', width: '250px' }}
                  controls
                />
              </Box>
            </>
          ))}
        </ShowTextRenderer>
      ) : null}
    </>
  );
};

export default ExamplesForm;
