import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import DiffField from '../diffFields/DiffField';
import FormHeader from '../../components/FormHeader';

const Attributes = (
  {
    record,
    diffRecord,
  } : {
    record: Interfaces.Word,
    diffRecord: any,
  },
): ReactElement => {
  const {
    attributes: {
      isStandardIgbo,
      isAccented,
      isSlang,
      isConstructedTerm,
      isBorrowedTerm,
      isStem,
    } = {
      isStandardIgbo: false,
      isAccented: false,
      isSlang: false,
      isConstructedTerm: false,
      isBorrowedTerm: false,
      isStem: false,
    },
  } = record;

  return (
    <Box className="space-y-3 bg-gray-200 rounded-md p-3 mt-6 lg:mt-0" style={{ height: 'fit-content' }}>
      <FormHeader title="Word Attributes" />
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes.IS_STANDARD_IGBO.label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributes.IS_STANDARD_IGBO.value}`}
            diffRecord={diffRecord}
            fallbackValue={isStandardIgbo}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes.IS_ACCENTED.label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributes.IS_ACCENTED.value}`}
            diffRecord={diffRecord}
            fallbackValue={isAccented}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes.IS_SLANG.label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributes.IS_SLANG.value}`}
            diffRecord={diffRecord}
            fallbackValue={isSlang}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes.IS_CONSTRUCTED_TERM.label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributes.IS_CONSTRUCTED_TERM.value}`}
            diffRecord={diffRecord}
            fallbackValue={isConstructedTerm}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes.IS_BORROWED_TERM.label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributes.IS_BORROWED_TERM.value}`}
            diffRecord={diffRecord}
            fallbackValue={isBorrowedTerm}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes.IS_STEM.label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributes.IS_STEM.value}`}
            diffRecord={diffRecord}
            fallbackValue={isStem}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Attributes;
