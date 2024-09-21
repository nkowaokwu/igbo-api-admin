import React, { ReactElement } from 'react';
import { Heading, VStack, Text, Button, Grid } from '@chakra-ui/react';
import { LuDiamond, LuDownloadCloud, LuFilter, LuLayers, LuUser, LuZap } from 'react-icons/lu';
import { REQUEST_ACCESS_URL } from 'src/Core/constants';

const largeSections = [
  {
    title: 'Resources inventory',
    description: 'High-level overview of total data and contributions.',
    icon: LuDiamond,
  },
  {
    title: 'Advanced filters',
    description: "Filter your collected data and see only what's relevant to you.",
    icon: LuFilter,
  },
  {
    title: 'Role-base access control (RBAC)',
    description: 'Invite members and assign resource-restricting access roles',
    icon: LuUser,
  },
  {
    title: 'Bulk actions',
    description: 'Select large portions of your data to perform actions with one single click.',
    icon: LuLayers,
  },
  {
    title: 'Low-resource friendly',
    description: 'Supports low-powered mobile users to allow for data collection from anywhere.',
    icon: LuZap,
  },
  {
    title: 'Export and share',
    description: 'Easily export portions of your dataset to share with others or use for future tasks.',
    icon: LuDownloadCloud,
  },
];

const DetailedFeatures = (): ReactElement => (
  <VStack alignItems="center" width="full" gap={4} backgroundColor="black" py={32}>
    <VStack alignItems="center" className="w-10/12" gap={32}>
      <VStack alignItems="center" className="w-10/12 lg:w-1/2" gap={4}>
        <Text color="white">All-in-one data platform</Text>
        <Heading lineHeight="1.2" color="white">
          Invite, Collect, Build.
        </Heading>
        <Text lineHeight="1.6" color="gray.400">
          Track data growth, manage your team, scale your work.
        </Text>
        <Button
          color="black"
          onClick={() => {
            window.location.href = REQUEST_ACCESS_URL;
          }}
        >
          Request access
        </Button>
      </VStack>
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {largeSections.map(({ title, description, icon: Icon }) => (
          <VStack alignItems="start" gap={2}>
            <Icon size="32px" color="white" />
            <Text fontWeight="medium" color="white">
              {title}
            </Text>
            <Text color="gray.400">{description}</Text>
          </VStack>
        ))}
      </Grid>
    </VStack>
  </VStack>
);

export default DetailedFeatures;
