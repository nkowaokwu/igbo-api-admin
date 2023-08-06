import React, { ReactElement } from 'react';
import { Box, SlideFade, Text, Link } from '@chakra-ui/react';

const TermsAndPrivacyMessage = ({ errorMessage }: { errorMessage?: string }): ReactElement => (
  <Box className="mt-2 space-y-2">
    <SlideFade in={!!errorMessage} offsetY="-20px">
      <Text textAlign="center" className="text-red-500">
        {errorMessage}
      </Text>
    </SlideFade>
    <Text fontSize="xs">
      By creating an account, you agree to our{' '}
      <Link href="https://nkowaokwu.com/terms" target="_blank" color="primary">
        Terms and Conditions
      </Link>{' '}
      and read our{' '}
      <Link href="https://nkowaokwu.com/privacy" target="_blank" color="primary">
        Privacy Policy
      </Link>
      .
    </Text>
  </Box>
);

export default TermsAndPrivacyMessage;
