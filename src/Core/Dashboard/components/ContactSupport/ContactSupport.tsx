import { Divider, Heading, Link, Text, VStack } from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import {
  NKOWAOKWU_EMAIL,
  BUG_REPORT_URL,
  CROWDSOURCING_SLACK_CHANNEL,
  FEATURE_REQUEST_FORM_URL,
} from 'src/Core/constants';

const supportOptions = [
  {
    title: 'Meet other contributors',
    subtitle: 'Have questions? Want to work with other contributors? Join our Slack.',
    link: {
      label: 'Contributors Slack channel',
      href: CROWDSOURCING_SLACK_CHANNEL,
    },
  },
  {
    title: 'Report a bug',
    subtitle: 'See an error message? Send a bug report for us to fix.',
    link: {
      label: 'Report a bug',
      href: BUG_REPORT_URL,
    },
  },
  {
    title: 'Request a feature',
    subtitle: 'Want to see something new? Request a feature.',
    link: {
      label: 'Request a feature',
      href: FEATURE_REQUEST_FORM_URL,
    },
  },
  {
    title: 'General support',
    subtitle: "Email us and we'll get back to you within 24 hours",
    link: {
      label: NKOWAOKWU_EMAIL,
      href: `mailto:${NKOWAOKWU_EMAIL}`,
    },
  },
];

const ContactSupport = (): ReactElement => (
  <VStack className="w-7/12" alignItems="start">
    <Heading>Support</Heading>
    <Text fontWeight="medium">Need help? Reach out</Text>
    {supportOptions.map(({ title, subtitle, link }) => (
      <VStack key={title} alignItems="start" width="full">
        <VStack alignItems="start" width="full" spacing={2}>
          <VStack alignItems="start" spacing={0}>
            <Text fontWeight="bold">{title}</Text>
            <Text fontWeight="medium" color="gray.500">
              {subtitle}
            </Text>
          </VStack>
          <Link href={link.href} fontWeight="medium" textDecoration="underline">
            {link.label}
          </Link>
        </VStack>
        <Divider />
      </VStack>
    ))}
  </VStack>
);

export default ContactSupport;
