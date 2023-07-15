import React, { ReactElement } from 'react';
import { Box, Link, Text, chakra } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { usePermissions } from 'react-admin';
import { hasEditorPermissions } from 'src/shared/utils/permissions';

const Card = ({ text, href, children }: { text?: string; href?: string; children: any }): ReactElement => {
  const permissions = usePermissions();
  const hasPermissions = hasEditorPermissions(permissions?.permissions, true);

  return (
    <Box
      backgroundColor="gray.100"
      borderRadius="md"
      borderColor="gray.300"
      borderWidth="1px"
      minHeight={72}
      height="full"
      width={['full', 'lg']}
      my="8"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p="6"
      className="space-y-6"
    >
      {text ? (
        <Text fontSize="xl" textAlign="center" fontFamily="Silka" color="gray.700">
          {text}
        </Text>
      ) : null}
      {href && hasPermissions ? (
        <Box className="w-full flex flex-row justify-end items-center">
          <Link href={href} color="gray.500" data-test="card-link">
            <chakra.span mr={2} fontFamily="Silka">
              View resource
            </chakra.span>
            <ExternalLinkIcon color="gray.500" />
          </Link>
        </Box>
      ) : null}
      {React.Children.map(children, (child) => React.cloneElement(child))}
    </Box>
  );
};

export default Card;
