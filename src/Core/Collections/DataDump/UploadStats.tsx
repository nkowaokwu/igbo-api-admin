import React, { ReactElement } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Tooltip,
  chakra,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import type StatusType from './StatusType';

const UploadStatus = ({ statuses, index }: { statuses: StatusType[]; index: number }): ReactElement => {
  const { successCount, failureCount } = statuses.reduce(
    (finalStatus, { success }) => {
      if (success) {
        finalStatus.successCount += 1;
      } else {
        finalStatus.failureCount += 1;
      }
      return finalStatus;
    },
    { successCount: 0, failureCount: 0 },
  );
  return (
    <Box>
      <Accordion allowMultiple className="w-full my-6">
        <AccordionItem>
          <Tooltip label="Result statues statuses from the bulk upload.">
            <AccordionButton>
              <Box className="w-full flex flex-row items-center">
                <Text fontWeight="bold">{`Batch chunk #${index + 1} Details`}</Text>
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Tooltip>
          <AccordionPanel>
            <Text color="green" fontWeight="bold">
              <chakra.span mr={3}>
                <CheckIcon color="green" boxSize={4} />
              </chakra.span>
              {`${successCount} Succeeded`}
            </Text>
            <Text color="red" fontWeight="bold">
              <chakra.span mr={3}>
                <CloseIcon color="red" boxSize={4} />
              </chakra.span>
              {`${failureCount} Failed`}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default UploadStatus;
