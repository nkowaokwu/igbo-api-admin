import React, { ReactElement } from 'react';
import { Box, Heading, VStack, Text, HStack, Button } from '@chakra-ui/react';
import { LuChevronRight } from 'react-icons/lu';

const largeSections = [
  {
    title: "Track your team's data collection progress",
    description: "Invite team members to your workspace to quickly onboard them into your team's workflow.",
    button: {
      label: 'Request access',
      href: '#/',
    },
  },
  {
    title: 'Assign user based role access',
    description: 'Allow certain team members specific access to your dataset.',
    button: {
      label: 'Request access',
      href: '#/',
    },
  },
  {
    title: 'Export your data for future work',
    description: 'Easily export your data onto popular platforms to train or fine-tune AI models.',
    button: {
      label: 'Request access',
      href: '#/',
    },
  },
];

const Introductions = (): ReactElement => (
  <VStack alignItems="center" width="full" gap={4} py={32}>
    <VStack alignItems="start" className="w-10/12" gap={32}>
      <VStack alignItems="start" className="w-1/2" gap={4}>
        <Text fontWeight="bold">The Igbo API Editor Platform Highlights</Text>
        <Heading lineHeight="1.2">Start saving money and time for data collecting</Heading>
        <Text lineHeight="1.6">
          The Igbo API Editor Platform is an all-in-one data platform built for AI teams looking to scale their data
          collection to build solutions for downstream tasks. Enabling teams to spend less on onboarding data collectors
          and spend more time on building AI.
        </Text>
      </VStack>
      {largeSections.map(({ title, description, button }, index) => (
        <HStack flexDirection={index % 2 ? 'row' : 'row-reverse'} justifyContent="space-between" gap={24} width="full">
          <Box height="600px" backgroundColor="blue.200" borderRadius="lg" flex={1} />
          <VStack alignItems="start" gap={4} flex={1}>
            <Heading lineHeight="1.2">{title}</Heading>
            <Text lineHeight="1.6">{description}</Text>
            <Button
              variant="ghost"
              rightIcon={<LuChevronRight />}
              px={0}
              _hover={{ backgroundColor: 'transparent' }}
              _active={{ backgroundColor: 'transparent' }}
              _focus={{ backgroundColor: 'transparent' }}
            >
              {button.label}
            </Button>
          </VStack>
        </HStack>
      ))}
    </VStack>
  </VStack>
);

export default Introductions;
