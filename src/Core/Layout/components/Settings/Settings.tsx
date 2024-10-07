import React, { ReactElement } from 'react';
import { VStack, Heading } from '@chakra-ui/react';
import SettingTabs from 'src/Core/Layout/components/Settings/components/SettingsTabs';

const Settings = ({
  title,
  tabLabels,
  tabPanels,
}: {
  title: string;
  tabLabels: string[];
  tabPanels: (ReactElement | null)[];
}): ReactElement => (
  <VStack alignItems="start">
    <VStack height="full" width="full" gap={2} alignItems="start" backgroundColor="gray.50">
      <Heading fontSize="3xl" p={4}>
        {title}
      </Heading>
      <SettingTabs tabLabels={tabLabels} tabPanels={tabPanels} />
    </VStack>
  </VStack>
);

export default Settings;
