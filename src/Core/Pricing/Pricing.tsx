import React, { ReactElement } from 'react';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';
import PricingCard from 'src/Core/Pricing/components/PricingCard';
import Footer from 'src/Core/Home/components/Footer';
import NavBar from 'src/Core/Home/components/NavBar';
import { REQUEST_DEMO_URL } from 'src/Core/constants';
import JoinCommunity from 'src/Core/Home/components/JoinCommunity';

const pricingOptions = [
  {
    title: 'Open-source',
    pricing: '$0 / month',
    subtitle: 'Contribute to the largest Igbo dataset',
    features: [
      {
        text: 'Streamlined recording and verifying',
      },
      {
        text: 'Get cited as a contributor for public dataset releases',
      },
      {
        text: 'Work closely with ML engineers',
      },
    ],
    button: {
      label: 'Get started',
      onClick: () => {
        window.location.href = '#/login';
      },
    },
    isPrimary: false,
  },
  {
    title: 'Team',
    pricing: "Let's talk",
    subtitle: 'Unlimited access to the platform',
    features: [
      {
        text: 'All features included',
      },
      {
        text: 'Invite unlimited users',
      },
      {
        text: 'Premium support with direct access to our tech team',
      },
    ],
    button: {
      label: 'Request demo',
      onClick: () => {
        window.location.href = REQUEST_DEMO_URL;
      },
    },
    isPrimary: true,
  },
];

const Pricing = (): ReactElement => (
  <VStack width="full" gap={32}>
    <NavBar />
    <VStack className="w-10/12" gap={12}>
      <VStack gap={8} pt={32} mb={8} justifyContent="center">
        <Heading>Pricing</Heading>
        <Text>Find a flexible plan that scales with your team&apos;s needs.</Text>
      </VStack>
      <Flex flexDirection={{ base: 'column', md: 'row' }} gap={4}>
        {pricingOptions.map(({ title, pricing, subtitle, features, button, isPrimary }) => (
          <PricingCard
            title={title}
            pricing={pricing}
            subtitle={subtitle}
            features={features}
            buttonLabel={button.label}
            isPrimary={isPrimary}
            onClick={button.onClick}
          />
        ))}
      </Flex>
    </VStack>
    <JoinCommunity />
    <Footer />
  </VStack>
);

export default Pricing;
