import React, { useState } from 'react';
import { Progress, VStack, HStack } from '@chakra-ui/react';
import UserPersona from 'src/backend/shared/constants/UserPersona';
import StepOne from 'src/Core/Collections/GettingStarted/components/StepOne';

const GettingStarted = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(2);
  const [currentUserPersona, setCurrentUserPersona] = useState<UserPersona | null>(null);

  return (
    <HStack>
      <VStack flex={1} height="full">
        <Progress />
        <StepOne />
      </VStack>
      <VStack flex={1} height="full" backgroundColor="#417453" />
    </HStack>
  );
};

export default GettingStarted;
