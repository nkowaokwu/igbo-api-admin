import React, { ReactElement } from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { FilterConfig } from 'src/shared/components/FiltersModal/configs/filterConfigInterfaces';
import { ChevronRightIcon } from '@chakra-ui/icons';

const RenderConfigOption = ({
  config,
  onClick,
  isCurrentOption,
}: {
  config: FilterConfig;
  onClick: (view: string) => void;
  isCurrentOption: boolean;
}): ReactElement => (
  <HStack
    justifyContent="space-between"
    width="full"
    p={2}
    borderRadius="md"
    borderWidth="2px"
    borderColor={isCurrentOption ? 'gray.800' : 'gray.300'}
    cursor="pointer"
    onClick={() => onClick(config.title)}
  >
    <HStack width="full" gap={2}>
      {config.icon}
      <Text fontWeight="medium">{config.title}</Text>
    </HStack>
    <ChevronRightIcon />
  </HStack>
);

export default RenderConfigOption;
