import React, { ReactElement } from 'react';
import { Image, VStack } from '@chakra-ui/react';
import getAWSAsset from 'src/utils/getAWSAsset';

const Dashboard = getAWSAsset('/images/igboAPIEditorPlatform/dashboard.png');

const ProductPreview = (): ReactElement => (
  <VStack width="full" pb={32}>
    <VStack className="w-10/12">
      <Image src={Dashboard} alt="Dashboard" />
    </VStack>
  </VStack>
);

export default ProductPreview;
