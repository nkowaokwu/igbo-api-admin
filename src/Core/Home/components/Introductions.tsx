import React, { ReactElement } from 'react';
import { Box, Heading, VStack, Text, Button, Image, Flex } from '@chakra-ui/react';
import { LuChevronRight } from 'react-icons/lu';
import getAWSAsset from 'src/utils/getAWSAsset';
import { REQUEST_DEMO_URL } from 'src/Core/constants';

const Bulk = getAWSAsset('/images/igboAPIEditorPlatform/bulk.png');
const UserProgress = getAWSAsset('/images/igboAPIEditorPlatform/user-progress.png');
const Rbac = getAWSAsset('/images/igboAPIEditorPlatform/rbac.png');
const MobileMock = getAWSAsset('/images/igboAPIEditorPlatform/mobile-mock.png');

const largeSections = [
  {
    title: "Bulk upload your team's starter data",
    description: 'Get your project started off right by uploading data in batches.',
    image: Bulk,
    button: {
      label: 'Request demo',
      href: REQUEST_DEMO_URL,
    },
    styles: {},
  },
  {
    title: "Track your team's data collection progress",
    description: "Invite team members to your workspace to quickly onboard them into your team's workflow.",
    image: UserProgress,
    button: {
      label: 'Request demo',
      href: REQUEST_DEMO_URL,
    },
    styles: {},
  },
  {
    title: 'Assign user based role access',
    description: 'Allow certain team members specific access to your dataset.',
    image: Rbac,
    button: {
      label: 'Request demo',
      href: REQUEST_DEMO_URL,
    },
    styles: {},
  },
  {
    title: 'Collect on the go',
    description: 'Collect data on mobile devices in low-internet access regions.',
    image: MobileMock,
    button: {
      label: 'Request demo',
      href: REQUEST_DEMO_URL,
    },
    styles: {
      height: '400px',
    },
  },
];

const Introductions = (): ReactElement => (
  <VStack alignItems="center" width="full" gap={4} py={32}>
    <VStack alignItems="start" className="w-10/12" gap={32}>
      <VStack alignItems="start" className="w-full lg:w-1/2" gap={4}>
        <Text fontWeight="bold">The Igbo API Editor Platform Highlights</Text>
        <Heading lineHeight="1.2">Start saving money and time for data collecting</Heading>
        <Text lineHeight="1.6">
          The Igbo API Editor Platform is an all-in-one data platform built for AI teams looking to scale their data
          collection to build solutions for downstream tasks. Enabling teams to spend less on onboarding data collectors
          and spend more time on building AI.
        </Text>
      </VStack>
      {largeSections.map(({ title, description, image, styles, button }, index) => (
        <Flex
          flexDirection={{ base: 'column', lg: index % 2 ? 'row' : 'row-reverse' }}
          justifyContent="space-between"
          gap={24}
          width="full"
        >
          <Box
            height="600px"
            backgroundColor="gray.50"
            borderRadius="lg"
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image src={image} {...styles} />
          </Box>
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
        </Flex>
      ))}
    </VStack>
  </VStack>
);

export default Introductions;
