/* eslint-disable react/no-array-index-key */
import React, { ReactElement } from 'react';
import { capitalize } from 'lodash';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  Heading,
  Spinner,
  Text,
  chakra,
} from '@chakra-ui/react';
import Collection from 'src/shared/constants/Collections';

/* Renders the visual red/green diff sections in the Show view */
const TenseDiff = (
  { record: propRecord, resource }:
  { record: Interfaces.Word, resource: string },
): ReactElement => {
  const record = { ...(propRecord || {}), tenses: propRecord?.tenses || {} };
  // @ts-ignore
  return record?.word ? (
    <Box className="w-full">
      {resource === Collection.WORDS || resource === Collection.WORD_SUGGESTIONS ? (
        <Accordion
          defaultIndex={[0]}
          allowMultiple
        >
          {Object.entries(record.tenses).map(([tenseKey, tenseValue]) => (
            <AccordionItem key={tenseKey}>
              <AccordionButton>
                <Heading as="h2" size="sm" className="text-left">
                  {capitalize(tenseKey.replace(/([A-Z])/g, ' $1'))}
                </Heading>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} className="space-y-3">
                <Text>{tenseValue}</Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <chakra.span className="text-gray-500 italic">
          No tense changes
        </chakra.span>
      )}
    </Box>
  ) : <Spinner />;
};

export default TenseDiff;
