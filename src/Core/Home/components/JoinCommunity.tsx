import React, { ReactElement } from 'react';
import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { LuSlack } from 'react-icons/lu';
import { JOIN_SLACK_URL } from 'src/Core/constants';

const JoinCommunity = (): ReactElement => (
  <VStack width="full" backgroundColor="white" py={32}>
    <VStack className="w-10/12" gap={8}>
      <VStack gap={4}>
        <Heading fontSize="6xl">Join our Community</Heading>
        <Text>Speak directly with the Nkọwa okwu team to learn more about the Igbo API Editor Platform.</Text>
      </VStack>
      <Button
        leftIcon={<LuSlack />}
        variant="primary"
        size="lg"
        onClick={() => {
          window.location.href = JOIN_SLACK_URL;
        }}
      >
        Nkọwa okwu Slack
      </Button>
    </VStack>
  </VStack>
);

export default JoinCommunity;
