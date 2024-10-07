import React, { ReactElement } from 'react';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import getAWSAsset from 'src/utils/getAWSAsset';

// const LacunaFund = getAWSAsset('/images/igboAPIEditorPlatform/lacunafund.svg');
const Spitch = getAWSAsset('/images/igboAPIEditorPlatform/spitch.svg');

const clients = [
  {
    image: Spitch,
    alt: 'Spitch',
    height: '44px',
  },
  // {
  //   image: LacunaFund,
  //   alt: 'Lacuna Fund',
  //   height: '30px',
  // },
];

const Clients = (): ReactElement => (
  <VStack width="full" py={32} backgroundColor="black">
    <VStack className="w-10/12" gap={12}>
      <Text fontWeight="bold" color="gray.400" fontSize="xl">
        Loved by teams
      </Text>
      <HStack gap={12} width="full" justifyContent="center">
        {clients.map(({ image, alt, height }) => (
          <Image src={image} alt={alt} height={height} />
        ))}
      </HStack>
    </VStack>
  </VStack>
);

export default Clients;
