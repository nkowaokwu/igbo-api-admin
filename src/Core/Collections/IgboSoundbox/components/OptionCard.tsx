import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  Heading,
  Progress,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons';

const OptionCard = ({
  title,
  icon,
  description,
  link,
  onButtonClick,
  currentStat,
  goalStat,
  tooltipLabel,
} : {
  title: string,
  icon: string,
  link: string,
  description: string,
  onButtonClick: (e: any) => void,
  currentStat: number,
  goalStat: number
  tooltipLabel: string,
}): ReactElement => {
  const handleOnClick = () => {
    window.scrollTo(0, 0);
    onButtonClick(link);
  };
  return (
    <Box className="h-1/2 xl:h-screen w-9/12 xl:w-5/12 flex flex-col justify-center items-center">
      <Box className="w-9/12 flex flex-col justify-between items-center space-y-6">
        <Box h={16} w={16} backgroundColor="gray.200" borderRadius="md" className="flex justify-center items-center">
          <Text fontSize="4xl">{icon}</Text>
        </Box>
        <Heading textAlign="center" fontFamily="Silka">{title}</Heading>
        <Text textAlign="center" fontFamily="Silka">{description}</Text>
        <Button
          rightIcon={<ArrowForwardIcon color="white" boxSize={4} />}
          onClick={handleOnClick}
          backgroundColor="green.300"
          color="white"
          fontFamily="Silka"
          py={7}
          px={5}
          _hover={{
            backgroundColor: 'green.400',
          }}
          _active={{
            backgroundColor: 'green.400',
          }}
          _focus={{
            backgroundColor: 'green.400',
          }}
        >
          Start here
        </Button>
        <Progress
          size="md"
          width="full"
          height="8px"
          colorScheme="blue"
          value={Math.floor((currentStat / goalStat) * 100)}
          borderRadius="full"
        />
        <Skeleton isLoaded={typeof currentStat === 'number'}>
          <Tooltip label={tooltipLabel}>
            <Box className="flex flex-row items-center space-x-2">
              <InfoIcon color="gray" boxSize={4} />
              <Text fontFamily="Silka" fontWeight="bold">{`${currentStat} recordings`}</Text>
            </Box>
          </Tooltip>
        </Skeleton>
        <Text fontFamily="Silka">
          {`Your total goal is ${goalStat.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
        </Text>
      </Box>
    </Box>
  );
};

export default OptionCard;
