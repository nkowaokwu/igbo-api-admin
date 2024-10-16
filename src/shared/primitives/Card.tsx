import React, { ReactElement } from 'react';
import { Box, Link, Text, chakra, useToast, VStack } from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { usePermissions } from 'react-admin';
import { hasAtLeastCrowdsourcerPermissions, hasEditorPermissions } from 'src/shared/utils/permissions';
import copyToClipboard from 'src/shared/utils/copyToClipboard';

const Card = ({ text, href, children }: { text?: string; href?: string; children?: any }): ReactElement => {
  const permissions = usePermissions();
  const toast = useToast();
  const isCrowdsourcer = hasAtLeastCrowdsourcerPermissions(permissions?.permissions, true);
  const isEditor = hasEditorPermissions(permissions?.permissions, true);

  const handleCopyToClipboard = () => {
    copyToClipboard({ copyText: href, successMessage: 'Copied resource link to clipboard' }, toast);
  };

  return (
    <VStack
      minHeight="72"
      width={['full', 'lg']}
      my="8"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      p="6"
      className="space-y-6"
    >
      {text ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" flex={8}>
          <Text fontSize="xl" textAlign="center" fontFamily="Silka" color="gray.700" overflowWrap="anywhere">
            {text}
          </Text>
          {React.Children.map(children, (child) => React.cloneElement(child))}
        </Box>
      ) : null}
      {href && isEditor ? (
        <Box width="full" display="flex" justifyContent="flex-end" alignItems="center" flex={2}>
          <Link href={href} color="gray.500" data-test="card-link">
            <chakra.span mr={2} fontFamily="Silka">
              View resource
            </chakra.span>
            <ExternalLinkIcon color="gray.500" />
          </Link>
        </Box>
      ) : href && isCrowdsourcer ? (
        <Box className="w-full flex flex-row justify-end items-center">
          <Text color="gray.500" data-test="card-link" textDecoration="underline" onClick={handleCopyToClipboard}>
            <chakra.span mr={2} fontFamily="Silka">
              Copy resource link
            </chakra.span>
            <CopyIcon color="gray.500" />
          </Text>
        </Box>
      ) : null}
    </VStack>
  );
};

export default Card;
