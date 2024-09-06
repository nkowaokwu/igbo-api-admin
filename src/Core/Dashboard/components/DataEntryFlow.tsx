import React, { ReactElement } from 'react';
import { Box, Button, Show, Image, Text } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';

const handleNavigation = ({ hash, state }: { hash: string; state?: IgboSoundboxViews }) => {
  const handledState = state ? `?igboSoundboxView=${state}` : '';
  window.location.href = `${window.location.origin}/${handledState}${hash}`;
};

const DataEntryFlow = ({
  title,
  subtitle,
  icon,
  hash,
  state,
  buttonLabel,
  backgroundImage,
}: {
  title: string;
  subtitle: string;
  icon: string;
  hash: string;
  state?: IgboSoundboxViews;
  buttonLabel?: string;
  backgroundImage?: string;
}): ReactElement => (
  <Box
    className="bg-gray-100 lg:bg-white space-y-4 flex flex-col justify-start items-start relative"
    borderWidth="1px"
    borderColor={{ base: 'gray.200', md: 'white' }}
    borderRadius="md"
    p={2}
    width={{ base: 'full', lg: '326px' }}
  >
    {backgroundImage ? (
      <Show below="md">
        <Image src={backgroundImage} userSelect="none" className="absolute bottom-0 right-0" />
      </Show>
    ) : null}
    <Box
      className={`flex flex-row lg:flex-col justify-start items-center 
                lg:items-start space-y-0 lg:space-y-4 space-x-2 lg:space-x-0`}
    >
      <Box
        className="bg-gray-200 rounded-md flex flex-row justify-center items-center"
        width={{ base: '64px', md: '94px' }}
        height={{ base: '64px', md: '94px' }}
      >
        {typeof icon === 'string' ? <Text fontSize={{ base: '3xl', lg: '5xl' }}>{icon}</Text> : icon}
      </Box>
      <Text fontWeight="bold" fontFamily="Silka" fontSize={{ base: 'md', md: 'lg' }}>
        {title}
      </Text>
    </Box>
    <Text fontFamily="Silka" fontSize={{ base: 'md', md: 'lg' }} className=" w-8/12 md:w-full">
      {subtitle}
    </Text>
    <Button
      cursor="pointer"
      borderRadius="md"
      height={{ base: 12, md: 14 }}
      px={3}
      backgroundColor="primary"
      color="white"
      textAlign="center"
      onClick={() => handleNavigation({ hash, state })}
      rightIcon={<ArrowForwardIcon color="white" />}
      _hover={{
        backgroundColor: 'primary',
      }}
      _active={{
        backgroundColor: 'primary',
      }}
      _focus={{
        backgroundColor: 'primary',
      }}
    >
      {buttonLabel || 'Start here'}
    </Button>
  </Box>
);

export default DataEntryFlow;
