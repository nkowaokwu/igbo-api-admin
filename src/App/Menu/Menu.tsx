import React, { createElement, useMemo } from 'react';
import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import { MenuItemLink, MenuProps, usePermissions } from 'react-admin';
import { withRouter } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';
import { getResourceObjects, Resource, ResourceGroup, ResourceGroupLabels } from 'src/App/Resources';
import UserSection from 'src/Core/Layout/components/Sidebar/components/UserSection';
import { IGBO_API_PROJECT_ID } from 'src/Core/constants';
import { ProjectContext } from 'src/App/contexts/ProjectContext';

const Menu = ({ onMenuClick }: MenuProps) => {
  const permissions = usePermissions();
  const project = React.useContext(ProjectContext);
  const isIgboAPIProject = project?.id?.toString() === IGBO_API_PROJECT_ID;
  const isOpen = useSelector((state) => state.admin.ui.sidebarOpen);
  const resourceRoutes = useMemo(
    () =>
      getResourceObjects(permissions?.permissions ? permissions.permissions : permissions).filter(
        (resource) =>
          isIgboAPIProject ||
          (!isIgboAPIProject &&
            resource.generalProject &&
            Boolean(project.types.filter((type) => resource.projectTypes.includes(type)).length)),
      ),
    [permissions, isIgboAPIProject],
  );

  const groupedResourceRoutes = Object.entries(
    resourceRoutes.reduce((finalGroupedRoutes, route) => {
      if (!finalGroupedRoutes[route.group]) {
        finalGroupedRoutes[route.group] = [];
      }
      finalGroupedRoutes[route.group].push(route);
      return finalGroupedRoutes;
    }, {} as { [key in ResourceGroup]: Resource[] }),
  );

  return (
    <motion.div
      data-test="sidebar"
      hidden={!isOpen}
      initial={false}
      animate={{ width: isOpen ? '' : 0 }}
      style={{
        height: 'cal(100% - 67px - var(--chakra-sizes-2))',
        minWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
      }}
    >
      <Accordion
        defaultIndex={[0, 1, 2]}
        allowMultiple
        borderColor="transparent"
        height="full"
        overflowY="visible"
        pb={16}
      >
        {groupedResourceRoutes.map(([key, routes], index) => (
          <AccordionItem borderTopWidth={0} key={key}>
            <Box className="flex flex-row justify-between items-center" position={index ? '' : 'absolute'}>
              <AccordionButton width="full" pointerEvents={index ? 'auto' : 'none'} height={index ? '' : 0}>
                <Text fontWeight="bold" width="full" textAlign="left" fontFamily="Silka">
                  {ResourceGroupLabels[key]}
                </Text>
                {index ? <AccordionIcon ml={2} mr={0} /> : null}
              </AccordionButton>
            </Box>
            <AccordionPanel p={2}>
              {routes.map(({ name, options = { label: '' }, icon, exact = false }) => (
                <MenuItemLink
                  key={name}
                  to={`/${name}`}
                  primaryText={options.label || capitalize(name)}
                  leftIcon={createElement(icon)}
                  onClick={onMenuClick}
                  sidebarIsOpen={isOpen}
                  exact={exact}
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <UserSection />
    </motion.div>
  );
};

export default withRouter(Menu);
