import React, { ReactElement } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from '@chakra-ui/react';
import CreateProjectSteps from 'src/Core/Layout/components/AppBar/components/CreateProjectSteps';
import JoinIgboAPIProject from 'src/Core/Layout/components/AppBar/components/JoinIgboAPIProject';

const CreateProjectDrawer = ({
  isOpen,
  onClose,
  showCloseButton,
}: {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton: boolean;
}): ReactElement => (
  <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full" onEsc={onClose}>
    <DrawerOverlay />
    <DrawerContent>
      {showCloseButton ? <DrawerCloseButton /> : null}
      <DrawerHeader>Create a project</DrawerHeader>
      <DrawerBody>
        <VStack alignItems="start" maxWidth="700px" gap={6}>
          <CreateProjectSteps />
          <JoinIgboAPIProject />
        </VStack>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

export default CreateProjectDrawer;
