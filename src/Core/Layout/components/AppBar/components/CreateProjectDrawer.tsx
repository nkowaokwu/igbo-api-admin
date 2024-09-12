import React, { ReactElement } from 'react';
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react';
import CreateProjectSteps from 'src/Core/Layout/components/AppBar/components/CreateProjectSteps';

const CreateProjectDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): ReactElement => (
  <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full" onEsc={onClose}>
    <DrawerOverlay />
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader>Create a project</DrawerHeader>
      <DrawerBody>
        <CreateProjectSteps />
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

export default CreateProjectDrawer;
