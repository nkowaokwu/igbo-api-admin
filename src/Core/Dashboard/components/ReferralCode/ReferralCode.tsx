import React from 'react';
import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import copyToClipboard from 'src/shared/utils/copyToClipboard';

const ReferralCode = ({ referralCode }: { referralCode: string }): React.ReactElement => {
  const toast = useToast();
  const onCopyReferralCode = () => {
    copyToClipboard(
      {
        copyText: referralCode,
        successMessage: 'Your referral code is copied',
      },
      toast,
    );
  };

  return (
    <Box bg="gray.50" borderRadius="lg" w="100%" p={4} color="gray.700" mb={3}>
      <Flex justifyContent="space-between">
        <Flex direction="column" rowGap="2">
          <Text fontWeight="700" fontFamily="heading">
            {referralCode}
          </Text>
          <Text fontWeight="400" fontFamily="heading">
            This is your referral code
          </Text>
        </Flex>
        <Flex alignItems="center">
          <Button leftIcon={<CopyIcon />} backgroundColor="green.100" onClick={onCopyReferralCode}>
            <Text fontFamily="heading">Copy</Text>
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ReferralCode;
