/* eslint-disable react/no-array-index-key */
import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  Heading,
  Spinner,
  chakra,
} from '@chakra-ui/react';
import ReactAudioPlayer from 'react-audio-player';
import Dialects from 'src/backend/shared/constants/Dialects';
import Collection from 'src/shared/constants/Collections';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import DiffField from './DiffField';

/* Renders the visual red/green diff sections in the Show view */
const DialectDiff = (
  { record: propRecord, diffRecord, resource }:
  { record: Record, diffRecord: any, resource: string },
): ReactElement => {
  const record = { ...(propRecord || {}), dialects: propRecord?.dialects || {} };
  const updatedDialects = [];
  // @ts-ignore
  return record?.word ? (
    <Box className="w-full">
      {updatedDialects.length ? updatedDialects.map(({ value, label }) => (
        <>
          <Heading as="h1" className="text-xl mt-3">{label}</Heading>
          <Box className="flex flex-row items-center">
            <Heading as="h2" className="text-lg">Word:</Heading>
            <DiffField
              path={`dialects.${value}.dialects`}
              diffRecord={diffRecord}
              fallbackValue="No dialect changes"
            />
          </Box>
          <Box>
            <DiffField
              path={`dialects.${value}.pronunciation`}
              diffRecord={diffRecord}
              fallbackValue={record.dialects[value].pronunciation ? (
                <ReactAudioPlayer
                  src={record.dialects[value].pronunciation}
                  style={{ height: 40, width: 250 }}
                  controls
                />
              ) : <chakra.span>No audio pronunciation</chakra.span>}
              renderNestedObject={() => (
                <ReactAudioPlayer
                  src={record.dialects[value].pronunciation}
                  style={{ height: 40, width: 250 }}
                  controls
                />
              )}
            />
          </Box>
        </>
      )) : resource === Collection.WORDS || resource === Collection.WORD_SUGGESTIONS ? (
        <Accordion
          defaultIndex={[0]}
          allowMultiple
        >
          {Object.entries(record.dialects as Interfaces.WordDialect).map(([
            dialectalWord,
            {
              variations = [],
              dialects,
              pronunciation,
            },
          ], index) => (
            <AccordionItem key={index}>
              <AccordionButton>
                <Heading as="h2" size="sm" className="text-left">
                  {dialectalWord}
                </Heading>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} className="space-y-3">
                <Heading as="h2" size="sm" className="text-left mr-2">Dialects:</Heading>
                <ul style={{ listStyle: 'inside' }}>
                  {dialects.map((dialect) => (
                    <li>{Dialects[dialect].label}</li>
                  ))}
                </ul>
                <Heading as="h2" size="sm" className="text-left">
                  <chakra.span className="mr-2">Variations:</chakra.span>
                  <chakra.span fontWeight="normal" className="mr-2">
                    {variations.length ? variations.join(', ') : 'No variations'}
                  </chakra.span>
                </Heading>
                <ReactAudioPlayer
                  src={pronunciation}
                  style={{ height: 40, width: 250 }}
                  controls
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <chakra.span className="text-gray-500 italic">
          No dialect changes
        </chakra.span>
      )}
    </Box>
  ) : <Spinner />;
};

export default DialectDiff;
