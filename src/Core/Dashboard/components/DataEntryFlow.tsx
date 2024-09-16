import React, { ReactElement } from 'react';
import { Box, Button, Show, Image, Text, HStack } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';

const handleNavigation = ({ hash, state }: { hash: string; state?: IgboSoundboxViews }) => {
  const handledState = state ? `?igboSoundboxView=${state}` : '';
  window.location.href = `${window.location.origin}/${handledState}${hash}`;
};

const DataEntryFlow = ({
  title,
  subtitle,
  icon: Icon,
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
    className="space-y-4 flex flex-col justify-between items-start relative"
    backgroundColor={{ base: 'gray.50', md: 'white' }}
    borderWidth="1px"
    borderColor="gray.300"
    borderRadius="md"
    p={4}
    width="full"
  >
    {backgroundImage ? (
      <Show below="md">
        <Image src={backgroundImage} userSelect="none" className="absolute bottom-0 right-0" />
      </Show>
    ) : null}
    <HStack justifyContent="space-between" width="full">
      <Text flex={9} fontWeight="bold" fontFamily="Silka" fontSize={{ base: 'md', md: 'lg' }}>
        {title}
      </Text>
      <Box flex={1} display="flex" width="full" justifyContent="flex-end">
        {typeof Icon === 'string' ? (
          <Text pointerEvents="none" fontSize="3xl">
            {Icon}
          </Text>
        ) : (
          <Icon size="24px" />
        )}
      </Box>
    </HStack>
    <Text fontFamily="Silka" fontSize={{ base: 'sm', md: 'md' }} className=" w-8/12 md:w-full" color="gray.500">
      {subtitle}
    </Text>
    <Button
      cursor="pointer"
      borderRadius="md"
      textAlign="center"
      onClick={() => handleNavigation({ hash, state })}
      rightIcon={<ArrowForwardIcon />}
    >
      {buttonLabel || 'Start here'}
    </Button>
  </Box>
);

export default DataEntryFlow;
