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
  examples,
  setExamples,
  getValues,
  definitionGroupId,
}: ExamplesFormInterface): ReactElement => (
  // List of examples associated with the definition schema
  // const definitionsGroupExamples = examples.filter(({ associatedDefinitionsSchemas }) => (
  //   associatedDefinitionsSchemas?.includes(definitionGroupId)
  //   || (definitionGroupIndex === 0 && (!associatedDefinitionsSchemas || !associatedDefinitionsSchemas.length))
  // ));

  // Determines if the example form should be rendered especially if there's no associated definitions schema
  // const shouldRenderExampleForm = (example) => (
  //   example.associatedDefinitionsSchemas?.includes?.(definitionGroupId)
  //   || (
  //     definitionGroupIndex === 0
  //     && (!example.associatedDefinitionsSchemas || !example.associatedDefinitionsSchemas.length)
  //   )
  // );
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
                {`Examples (${examples.length})`}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {examples?.length ? examples.map((example, index) => (
              <Example
                key={`example-${example.createdAt}`}
                setExamples={setExamples}
                examples={examples}
                example={example}
                getValues={getValues}
                index={index}
                definitionGroupId={definitionGroupId}
              />
            )) : (
              <Box className="flex w-full justify-center mb-2">
                <Text className="italic text-gray-700">No examples</Text>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
    <AddExampleButton
      examples={examples}
      setExamples={setExamples}
      definitionGroupId={definitionGroupId}
    />
  </>
);

export default ExamplesForm;
