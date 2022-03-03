import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import {
  Box,
  Text,
  Tooltip,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Word } from 'src/backend/controllers/utils/interfaces';
import determineDocumentCompleteness from 'src/backend/controllers/utils/determineDocumentCompleteness';
import DocumentStatus from './DocumentStatus';

const CompleteWordPreview = (
  { record, className, showFull }:
  {
    record: Word | Record,
    className: string,
    showFull: boolean,
  },
): ReactElement => {
  const { isComplete } = record;
  const {
    sufficientWordRequirements,
    completeWordRequirements,
    recommendRevisiting,
  } = determineDocumentCompleteness(record);

  const documentStatus = sufficientWordRequirements.length && !isComplete
    ? DocumentStatus.INSUFFICIENT
    : !completeWordRequirements.length || isComplete
      ? DocumentStatus.COMPLETE
      : DocumentStatus.SUFFICIENT;

  const requirementsColor = isComplete ? 'orange.700' : 'red.400';
  const tooltipLabel = `${documentStatus.label}${recommendRevisiting
    ? ' Despite the document\'s status, the platform detects that there are more fields to be filled'
    : ''}`;
  return (
    <Box data-test="pronunciation-cell" className={className}>
      <Tooltip
        label={tooltipLabel}
        aria-label="A tooltip"
        backgroundColor={documentStatus.color}
        cursor="default"
      >
        <Box pointerEvents="all">
          <Box display="flex" flexDirection="row" alignItems="center" className="space-x-2">
            {isComplete ? <Text color="green.600">This word is manually set to complete</Text> : null}
            {recommendRevisiting ? <InfoOutlineIcon color="orange.600" width="4" className="ml-2" /> : null}
          </Box>
          {sufficientWordRequirements.length > 1 ? (
            <Box pointerEvents="none" data-test="incomplete-word-label">
              {showFull || !isComplete ? (
                <UnorderedList>
                  {sufficientWordRequirements.length > 2 ? (
                    <>
                      <ListItem color={requirementsColor}>{sufficientWordRequirements[0]}</ListItem>
                      <ListItem color={requirementsColor}>{sufficientWordRequirements[1]}</ListItem>
                      <ListItem color={requirementsColor} fontWeight="bold">
                        {`${sufficientWordRequirements.length - 2} more 
                        field${sufficientWordRequirements.length - 2 === 1 ? '' : 's'} necessary`}
                      </ListItem>
                    </>
                  ) : (
                    sufficientWordRequirements.map((requirement) => (
                      <ListItem key={`requirement-${requirement}`} color={requirementsColor}>{requirement}</ListItem>
                    ))
                  )}
                </UnorderedList>
              ) : null}
            </Box>
          ) : completeWordRequirements.length ? (
            <Box pointerEvents="none" data-test="incomplete-word-label">
              {!isComplete ? <Text color="green.500">This word is sufficient</Text> : null}
              {showFull || !isComplete ? (
                <UnorderedList>
                  {completeWordRequirements.length > 2 ? (
                    <>
                      <ListItem color={requirementsColor}>{completeWordRequirements[0]}</ListItem>
                      <ListItem color={requirementsColor}>{completeWordRequirements[1]}</ListItem>
                      <ListItem color={requirementsColor} fontWeight="bold">
                        {`${completeWordRequirements.length - 2} more 
                        field${completeWordRequirements.length - 2 === 1 ? '' : 's'} necessary`}
                      </ListItem>
                    </>
                  ) : (
                    completeWordRequirements.map((requirement) => (
                      <ListItem key={`requirement-${requirement}`} color={requirementsColor}>{requirement}</ListItem>
                    ))
                  )}
                </UnorderedList>
              ) : null}
            </Box>
          ) : <Text pointerEvents="none" data-test="complete-word-label" color="green.400">This word is complete</Text>}
        </Box>
      </Tooltip>
    </Box>
  );
};
export default CompleteWordPreview;
