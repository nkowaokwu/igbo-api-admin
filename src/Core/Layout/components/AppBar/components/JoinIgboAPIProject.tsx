import React, { ReactElement } from 'react';
import { Button, VStack, Heading, Text } from '@chakra-ui/react';
import { acceptIgboAPIRequest } from 'src/shared/InviteAPI';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const JoinIgboAPIProject = (): ReactElement => {
  const handleJoinIgboAPI = async () => {
    await acceptIgboAPIRequest();
    window.location.reload();
  };
  return (
    <VStack alignItems="start" width="full">
      <Heading>Want to contribute to open-source?</Heading>
      <Text>Contribute directly to the open-source Igbo API project, the largest Igbo-English dataset.</Text>
      <Button onClick={handleJoinIgboAPI} rightIcon={<ArrowForwardIcon />} variant="primary">
        Join Igbo API
      </Button>
    </VStack>
  );
};

export default JoinIgboAPIProject;
