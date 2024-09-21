import React, { ReactElement } from 'react';
import { Heading, HStack, Text, VStack } from '@chakra-ui/react';
import PricingCard from 'src/Core/Pricing/components/PricingCard';
import Footer from 'src/Core/Home/components/Footer';
import NavBar from 'src/Core/Home/components/NavBar';
import { REQUEST_ACCESS_URL } from 'src/Core/constants';
import JoinCommunity from 'src/Core/Home/components/JoinCommunity';

const features = [
  {
    text: 'All features included',
  },
  {
    text: 'Invite unlimited users',
  },
  {
    text: 'Premium support with direct access to our tech team',
  },
];

const Pricing = (): ReactElement => (
  <VStack width="full" gap={32}>
    <NavBar />
    <VStack gap={8} pt={32} mb={8} justifyContent="center">
      <Heading>Pricing</Heading>
      <Text>Find a flexible plan that scales with your team&apos;s needs.</Text>
    </VStack>
    <HStack>
      <PricingCard
        title="Open-source"
        pricing="$0 / month"
        subtitle="Contribute to the largest Igbo dataset"
        features={features}
        buttonLabel="Get started"
        isPrimary={false}
        onClick={() => {
          window.location.href = '#/login';
        }}
      />
      <PricingCard
        title="Team"
        pricing="Let's talk"
        subtitle="Unlimited access to the platform"
        features={features}
        buttonLabel="Request access"
        isPrimary
        onClick={() => {
          window.location.href = REQUEST_ACCESS_URL;
        }}
      />
    </HStack>
    <JoinCommunity />
    <Footer />
  </VStack>
);

export default Pricing;
