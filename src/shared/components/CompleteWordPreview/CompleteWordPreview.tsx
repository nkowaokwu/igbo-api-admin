import React, { ReactElement, useEffect, useState } from 'react';
import { get, has, uniq } from 'lodash';
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
import determineIsAudioAvailable from './determineIsAudioAvailable';
import DocumentStatus from '../../constants/DocumentStatus';

const CompleteWordPreview = (
  { record, className, showFull }:
  {
    record: Word | Record,
    className: string,
    showFull: boolean,
  },
): ReactElement => {
  const [availableAudioStatuses, setAvailableAudioStatuses] = useState(null);
  const [documentCompleteness, setDocumentCompleteness] = useState(null);
  const isComplete = get(record, 'isComplete');

  useEffect(() => {
    (async () => {
      setDocumentCompleteness(await determineDocumentCompleteness(record));
    })();
  }, [record]);

  useEffect(() => {
    determineIsAudioAvailable(record, (res) => {
      setAvailableAudioStatuses(res);
    });
  }, []);

  if (!documentCompleteness) {
    return null;
  }

  const {
    sufficientWordRequirements,
    completeWordRequirements,
    recommendRevisiting,
  } = documentCompleteness;

  const requirements = uniq([...sufficientWordRequirements, ...completeWordRequirements]);

  const documentStatus = sufficientWordRequirements.length && !isComplete
    ? DocumentStatus.INSUFFICIENT
    : !completeWordRequirements.length || isComplete
      ? DocumentStatus.COMPLETE
      : DocumentStatus.SUFFICIENT;

  const TooltipLabel = () => {
    const dialectStatusIndex = (
      availableAudioStatuses?.length
      && availableAudioStatuses.findIndex((audioStatus) => has(audioStatus, 'dialect'))
    );
    return (
      <>
        <Text>
          {documentStatus.label}
          {recommendRevisiting
            ? ' Despite the document\'s status, the platform detects that there are more fields to be filled'
            : ''}
        </Text>
        {!showFull ? (
          <>
            {requirements.length ? (
              <Text fontWeight="bold" my="2">The following metadata are required for completion:</Text>
            ) : ''}
            <UnorderedList>
              {
                availableAudioStatuses?.length
                && availableAudioStatuses.some((audioStatus) => audioStatus.pronunciation === false) ? (
                  <ListItem key="requirement-rerecord">
                    The headword audio pronunciation needs to be rerecorded
                  </ListItem>
                  ) : null
              }
              {requirements.map((requirement) => (
                <ListItem key={`requirement-${requirement}`}>{requirement}</ListItem>
              ))}
              {
                dialectStatusIndex !== -1
                && availableAudioStatuses?.length
                && Object.entries(availableAudioStatuses[dialectStatusIndex] || {})
                  .map(([dialect, dialectAudioStatus]) => {
                    if (!dialectAudioStatus) {
                      return null;
                    }
                    return (
                      <ListItem key={`requirement-${dialect}`}>
                        {`The dialect variation "${dialect}" audio pronunciation needs to be rerecorded`}
                      </ListItem>
                    );
                  })
                }
            </UnorderedList>
          </>
        ) : null}
      </>
    );
  };

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

export default CompleteWordPreview;
