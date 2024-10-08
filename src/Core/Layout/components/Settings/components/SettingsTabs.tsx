import React, { ReactElement } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator } from '@chakra-ui/react';

const SettingTabs = ({
  tabLabels,
  tabPanels,
}: {
  tabLabels: string[];
  tabPanels: (ReactElement | null)[];
}): ReactElement => (
  <Tabs position="relative" variant="unstyled" width="full">
    <TabList backgroundColor="gray.50" borderBottomWidth="1px" borderBottomColor="gray.200">
      {tabLabels.map((tabLabel) => (
        <Tab key={tabLabel}>{tabLabel}</Tab>
      ))}
    </TabList>
    <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
    <TabPanels backgroundColor="white">
      {tabPanels.map((tabPanel) => (
        <TabPanel>{tabPanel}</TabPanel>
      ))}
    </TabPanels>
  </Tabs>
);

export default SettingTabs;
