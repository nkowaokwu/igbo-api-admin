import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import DiffField from '../diffFields/DiffField';
import FormHeader from '../../components/FormHeader';

const Attributes = ({ record, diffRecord }: { record: Interfaces.Word; diffRecord: any }): ReactElement => {
  const {
    attributes: { isStandardIgbo, isAccented, isSlang, isConstructedTerm, isBorrowedTerm, isStem } = {
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
            {WordAttributes[WordAttributeEnum.IS_STANDARD_IGBO].label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributeEnum.IS_STANDARD_IGBO}`}
            diffRecord={diffRecord}
            fallbackValue={isStandardIgbo}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes[WordAttributeEnum.IS_ACCENTED].label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributeEnum.IS_ACCENTED}`}
            diffRecord={diffRecord}
            fallbackValue={isAccented}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes[WordAttributeEnum.IS_SLANG].label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributeEnum.IS_SLANG}`}
            diffRecord={diffRecord}
            fallbackValue={isSlang}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes[WordAttributeEnum.IS_CONSTRUCTED_TERM].label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributeEnum.IS_CONSTRUCTED_TERM}`}
            diffRecord={diffRecord}
            fallbackValue={isConstructedTerm}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes[WordAttributeEnum.IS_BORROWED_TERM].label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributeEnum.IS_BORROWED_TERM}`}
            diffRecord={diffRecord}
            fallbackValue={isBorrowedTerm}
            renderNestedObject={(value) => <span>{String(value || false)}</span>}
          />
        </Box>
        <Box>
          <Heading fontSize="lg" className="text-xl text-gray-600">
            {WordAttributes[WordAttributeEnum.IS_STEM].label}
          </Heading>
          <DiffField
            path={`attributes.${WordAttributeEnum.IS_STEM}`}
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
