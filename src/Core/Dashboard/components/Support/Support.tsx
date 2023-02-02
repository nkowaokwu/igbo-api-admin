import React, { ReactElement } from 'react';
import {
  Box,
  Divider,
  Link,
  Text,
  chakra,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  EDITORS_ONBOARDING_URL,
  DICTIONARY_EDITING_STANDARDS_URL,
  BUG_REPORT_URL,
  EDITORS_TRANSLATORS_SLACK_CHANNEL,
} from 'src/Core/constants';

const supportOptions = [
  {
    title: 'New members!',
    linkText: 'Onboarding doc',
    link: EDITORS_ONBOARDING_URL,
  },
  {
    title: 'Dictionary Editing Standards',
    linkText: 'Review doc',
    link: DICTIONARY_EDITING_STANDARDS_URL,
  },
  {
    title: 'Report a bug',
    linkText: 'Bug report doc',
    link: BUG_REPORT_URL,
  },
  {
    title: 'Editors/Translators Slack',
    linkText: 'Visit Slack',
    link: EDITORS_TRANSLATORS_SLACK_CHANNEL,
  },
];

const Support = (): ReactElement => (
  <Box className="rounded-lg w-full lg:w-2/12" overflow="hidden" height="fit-content">
    <Box backgroundColor="orange.200" p={3}>
      <Text fontFamily="Silka" fontWeight="bold">Support</Text>
    </Box>
    <Box className="space-y-2" backgroundColor="white" p={3}>
      {supportOptions.map(({ title, linkText, link }, index) => (
        <>
          <Box key={title}>
            <Text fontFamily="Silka" fontWeight="bold">{title}</Text>
            <Link href={link} target="_blank">
              {linkText}
              <chakra.span ml={1}><ExternalLinkIcon boxSize={4} /></chakra.span>
            </Link>
          </Box>
          {!index ? (
            <Box width="full">
              <Divider backgroundColor="gray.100" />
            </Box>
          ) : null}
        </>
      ))}
    </Box>
  </Box>
);

export default Support;
