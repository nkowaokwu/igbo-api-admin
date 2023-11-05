import React from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { getReferralCode } from '../../../../shared/CrowdsourcerAPI';

export const RefferalCode = (): React.ReactElement => {
  const [referralCode, setReferralCode] = React.useState('');
  const ref = React.useRef<HTMLParagraphElement>();

  React.useEffect(() => {
    getReferralCode().then(setReferralCode);
  }, []);

  const onCopyReferralCode = () => {
    const range = window.document.createRange();
    range.selectNode(ref.current);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    window.navigator.clipboard.writeText(ref.current.textContent);
  };

  return (
    <Box bg="gray.100" borderRadius="lg" w="100%" p={4} color="gray.700">
      <Flex justifyContent="space-between">
        <Flex direction="column" rowGap="2">
          <Text ref={ref} fontWeight="700">
            {referralCode}
          </Text>
          <Text fontWeight="400">This is your referral code</Text>
        </Flex>
        <Flex alignItems="center">
          <Button backgroundColor="green.100" onClick={onCopyReferralCode}>
            copy
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
