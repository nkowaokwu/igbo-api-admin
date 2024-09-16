import React, { ReactElement, useState } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import Select from 'react-select';
import UserRoleLabels from 'src/backend/shared/constants/UserRoleLabels';
import UserRoles from 'src/backend/shared/constants/UserRoles';

const RolesDrawer = ({
  isOpen,
  onClose,
  onSave,
  defaultRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: { value: UserRoles; label: string }) => void;
  defaultRole: UserRoles;
}): ReactElement => {
  const [userRole, setUserRole] = useState(UserRoleLabels[defaultRole]);
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} onEsc={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Change user role</DrawerHeader>

        <DrawerBody>
          <Select options={UserRoleLabels} defaultValue={UserRoleLabels[defaultRole]} onChange={setUserRole} />
        </DrawerBody>

        <DrawerFooter>
          <Button mr={3} onClick={() => onSave(userRole)}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RolesDrawer;
