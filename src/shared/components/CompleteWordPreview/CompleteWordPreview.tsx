import React, { ReactElement } from 'react';
import { uniq } from 'lodash';
import { Record } from 'react-admin';
import {
  Badge,
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
    showFull: boolean
  },
): ReactElement => {
  const { isComplete } = record;
  const {
    sufficientWordRequirements,
    completeWordRequirements,
    recommendRevisiting,
  } = determineDocumentCompleteness(record);
  const requirements = uniq([...sufficientWordRequirements, ...completeWordRequirements]);

  const documentStatus = sufficientWordRequirements.length && !isComplete
    ? DocumentStatus.INSUFFICIENT
    : !completeWordRequirements.length || isComplete
      ? DocumentStatus.COMPLETE
      : DocumentStatus.SUFFICIENT;

  const TooltipLabel = () => (
    <>
      <Text>
        {documentStatus.label}
        {recommendRevisiting
          ? ' Despite the document\'s status, the platform detects that there are more fields to be filled'
          : ''}
      </Text>
      {requirements.length ? (
        <Text fontWeight="bold" my="2">The following metadata are required:</Text>
      ) : ''}
      <UnorderedList>
        {requirements.map((requirement) => (
          <ListItem key={`requirement-${requirement}`}>{requirement}</ListItem>
        ))}
      </UnorderedList>
    </>
  );

  return (
    <Box data-test="pronunciation-cell" className={className}>
      <Tooltip
        label={!showFull ? <TooltipLabel /> : null}
        aria-label="A tooltip"
        backgroundColor={documentStatus.tooltipColor}
        color="gray.600"
        cursor="default"
      >
        <Box pointerEvents="all" cursor="default">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Badge
              variant={documentStatus.variant}
              colorScheme={documentStatus.colorScheme}
              data-test={documentStatus['data-test']}
              userSelect="none"
            >
              {documentStatus.badge}
            </Badge>
            {recommendRevisiting ? <InfoOutlineIcon color="orange.600" width="4" className="ml-2" /> : null}
          </Box>
          {showFull ? (
            <UnorderedList mt={2}>
              {requirements.map((requirement) => (
                <ListItem color="red.600" key={`requirement-${requirement}`}>{requirement}</ListItem>
              ))}
            </UnorderedList>
          ) : null}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default CompleteWordPreview;
