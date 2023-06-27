import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';

const Card = ({ children }: { children: any }): ReactElement => (
  <Box
    backgroundColor="gray.100"
    borderRadius="md"
    borderColor="gray.300"
    borderWidth="1px"
    minHeight={72}
    height="full"
    width={['full', 'lg']}
    my="12"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    p="6"
    className="space-y-6"
  >
    {React.Children.map(children, (child) => React.cloneElement(child))}
  </Box>
);

export default Card;
