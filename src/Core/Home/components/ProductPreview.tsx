import React, { ReactElement } from 'react';
import { Box, VStack } from '@chakra-ui/react';

const ProductPreview = (): ReactElement => (
  <VStack width="full">
    <VStack className="w-10/12">
      <Box backgroundColor="green.200" height="600px" width="900px" borderRadius="lg" />
    </VStack>
  </VStack>
);

export default ProductPreview;
