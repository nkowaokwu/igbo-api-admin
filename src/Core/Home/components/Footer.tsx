import React, { ReactElement } from 'react';
import { HStack, VStack, Text } from '@chakra-ui/react';
import moment from 'moment';

const Footer = (): ReactElement => (
  <VStack py={12} width="full" backgroundColor="gray.800" justifyContent="space-between" m={0}>
    <HStack justifyContent="space-between" borderTopWidth="1px" borderTopColor="gray.600" width="full">
      <Text fontSize="sm" color="gray.400">
        © {moment().year()} Nkọwa okwu. All rights reserved.
      </Text>
      <HStack justifyContent="center" gap={8}>
        <Text fontSize="sm" color="gray.400">
          Privacy Policy
        </Text>
        <Text fontSize="sm" color="gray.400">
          Terms of use
        </Text>
      </HStack>
    </HStack>
  </VStack>
);

export default Footer;
