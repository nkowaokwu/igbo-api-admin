import React, { ReactElement } from 'react';
import { Button, Heading, Text, VStack, chakra } from '@chakra-ui/react';
import { LuCheckCircle2 } from 'react-icons/lu';

const PricingCard = ({
  title,
  pricing,
  subtitle,
  features,
  buttonLabel,
  isPrimary = true,
  onClick,
}: {
  title: string;
  pricing: string;
  subtitle: string;
  features: { text: string }[];
  buttonLabel: string;
  isPrimary: boolean;
  onClick: () => void;
}): ReactElement => (
  <VStack borderRadius="lg" py={12} px={6} borderWidth="1px" borderColor="gray.300" gap={4} alignItems="start">
    <VStack alignItems="start" gap={2}>
      <Heading fontSize="2xl" fontWeight="normal">
        {title}
      </Heading>
      <Text fontSize="4xl" fontWeight="medium">
        {pricing}
      </Text>
      <Text fontSize="xl" textAlign="center">
        {subtitle}
      </Text>
    </VStack>
    <VStack alignItems="start" gap={2}>
      {features.map(({ text }) => (
        <Text textAlign="left">
          <chakra.span mr={2}>
            <LuCheckCircle2 style={{ display: 'inline' }} />
          </chakra.span>
          {text}
        </Text>
      ))}
    </VStack>
    <Button width="full" variant={isPrimary ? 'primary' : ''} onClick={onClick}>
      {buttonLabel}
    </Button>
  </VStack>
);

export default PricingCard;
