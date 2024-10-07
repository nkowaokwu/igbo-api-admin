import React, { ReactElement } from 'react';
import { HStack, VStack, Text, Image, Link } from '@chakra-ui/react';
import moment from 'moment';
import getAWSAsset from 'src/utils/getAWSAsset';
import { JOIN_SLACK_URL } from 'src/Core/constants';

const NkowaokwuImage = getAWSAsset('/images/logo.svg');

const columns = [
  {
    title: 'Resources',
    options: [
      {
        label: 'Hugging Face',
        href: 'https://huggingface.co/nkowaokwu',
      },
      {
        label: 'Kaggle',
        href: 'https://www.kaggle.com/organizations/nkowaokwu',
      },
      {
        label: 'GitHub',
        href: 'https://github.com/nkowaokwu/igbo_api',
      },
      {
        label: 'Join Slack',
        href: JOIN_SLACK_URL,
      },
    ],
  },
];

const Footer = (): ReactElement => (
  <VStack py={24} width="full" backgroundColor="blackAlpha.900" justifyContent="space-between" m={0} height="lg">
    <HStack justifyContent="start" className="w-10/12">
      <Image src={NkowaokwuImage} alt="logo" filter="invert(1)" />
    </HStack>
    <HStack justifyContent="start" gap={8} className="w-10/12">
      {columns.map(({ title, options }) => (
        <VStack alignItems="start">
          <Text fontWeight="medium" color="white">
            {title}
          </Text>
          <VStack alignItems="start">
            {options.map(({ label, href }) => (
              <Link color="gray.400" href={href}>
                {label}
              </Link>
            ))}
          </VStack>
        </VStack>
      ))}
    </HStack>
    <HStack justifyContent="space-between" borderTopWidth="1px" borderTopColor="gray.600" className="w-10/12" py={4}>
      <Text fontSize="sm" color="gray.400">
        © {moment().year()} Nkọwa okwu. All rights reserved.
      </Text>
      <HStack justifyContent="center" gap={4}>
        <Link fontSize="sm" color="gray.400" href="https://igboapi.com/terms">
          Privacy Policy
        </Link>
        <Link fontSize="sm" color="gray.400" href="https://igboapi.com/privacy">
          Terms of use
        </Link>
      </HStack>
    </HStack>
  </VStack>
);

export default Footer;
