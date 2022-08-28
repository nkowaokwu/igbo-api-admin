import React, { ReactElement, useEffect, useState } from 'react';
import { compact, uniq } from 'lodash';
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
import determineExampleCompleteness from 'src/backend/controllers/utils/determineExampleCompleteness';
import { getWord } from 'src/shared/API';
import DocumentStatus from '../../constants/DocumentStatus';

const CompleteExamplePreview = (
  { record, className, showFull }:
  {
    record: Word | Record,
    className: string,
    showFull: boolean,
  },
): ReactElement => {
  const [exampleCompleteness, setExampleCompleteness] = useState(null);
  const [hasDisconnectedAssociatedWords, setHasDisconnectedAssociatedWords] = useState(false);
  const { isComplete } = record;

  useEffect(() => {
    (async () => {
      setExampleCompleteness(await determineExampleCompleteness(record));
      await Promise.all(record.associatedWords.map(async (associatedWordId) => {
        await getWord(associatedWordId).catch(() => {
          setHasDisconnectedAssociatedWords(true);
        });
      }));
    })();
  }, [record]);

  if (!exampleCompleteness) {
    return null;
  }

  const {
    completeExampleRequirements,
    recommendRevisiting,
  } = exampleCompleteness;
  const sufficientExampleRequirements = compact([
    ...exampleCompleteness.sufficientExampleRequirements,
    hasDisconnectedAssociatedWords && 'Unlinked associated words must be linked',
  ]);

  const requirements = uniq([
    ...sufficientExampleRequirements,
    ...completeExampleRequirements,
  ]);

  const documentStatus = sufficientExampleRequirements.length && !isComplete
    ? DocumentStatus.INSUFFICIENT
    : !completeExampleRequirements.length || isComplete
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
      {!showFull ? (
        <>
          {sufficientExampleRequirements.length ? (
            <Text fontWeight="bold" my="2">The following metadata are required for sufficient status:</Text>
          ) : ''}
          <UnorderedList>
            {sufficientExampleRequirements.map((requirement) => (
              <ListItem key={`requirement-${requirement}`}>{requirement}</ListItem>
            ))}
          </UnorderedList>
          {completeExampleRequirements.length ? (
            <Text fontWeight="bold" my="2">The following metadata are required for completion:</Text>
          ) : ''}
          <UnorderedList>
            {completeExampleRequirements.map((requirement) => (
              <ListItem key={`requirement-${requirement}`}>{requirement}</ListItem>
            ))}
          </UnorderedList>
        </>
      ) : null}
    </>
  );

  return (
    <Box data-test="pronunciation-cell" className={className}>
      <Tooltip
        label={<TooltipLabel />}
        aria-label="A tooltip"
        backgroundColor={recommendRevisiting ? 'yellow.200' : documentStatus.tooltipColor}
        color="gray.600"
        cursor="default"
      >
        <Box pointerEvents="all" cursor="default">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Badge
              variant={documentStatus.variant}
              colorScheme={recommendRevisiting ? 'yellow' : documentStatus.colorScheme}
              data-test={documentStatus['data-test']}
              userSelect="none"
            >
              {documentStatus.badge}
            </Badge>
            {recommendRevisiting ? <InfoOutlineIcon color="yellow.600" width="4" className="ml-2" /> : null}
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

export default CompleteExamplePreview;
