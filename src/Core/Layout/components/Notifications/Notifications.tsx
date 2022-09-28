import React, { ReactElement, useEffect, useState } from 'react';
import pluralize from 'pluralize';
import { getAuth } from 'firebase/auth';
import {
  doc,
  setDoc,
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useToast,
} from '@chakra-ui/react';
import { EmailIcon } from '@chakra-ui/icons';
import moment from 'moment';
import Collections from 'src/shared/constants/Collections';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

const auth = getAuth();
const db = getFirestore();
const NOTIFICATIONS_LIMIT = 6;

const Notifications = (props): ReactElement => {
  const [notifications, setNotifications] = useState<Interfaces.Notification[]>([]);
  const toast = useToast();

  const handleNotificationSelection = async ({ id, recipient, link }) => {
    try {
      const dbNotificationRef = doc(db, `${Collections.USERS}/${recipient}/${Collections.NOTIFICATIONS}`, id);
      await setDoc(dbNotificationRef, { opened: true }, { merge: true });
      window.location.hash = link;
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to read the notification.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    const { uid } = auth.currentUser;
    const q = query(collection(
      db,
      `${Collections.USERS}/${uid}/${Collections.NOTIFICATIONS}`,
    ), where('recipient', '==', uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allNotifications = [];
      querySnapshot.forEach((doc) => {
        // Limit the total number of notifications to the limit
        if (allNotifications.length < NOTIFICATIONS_LIMIT) {
          allNotifications.push(doc.data() as Interfaces.Notification);
        }
      });
      setNotifications(allNotifications.reverse());
      return unsubscribe;
    });
  }, []);

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        cursor="pointer"
        variant="ghost"
        leftIcon={<EmailIcon boxSize={5} color="gray" />}
        color="gray.800"
        {...props}
      >
        {notifications.filter(({ opened }) => !opened).length ? (
          <Box
            position="absolute"
            backgroundColor="red"
            height={5}
            width={5}
            right={4}
            top="2px"
            borderColor="white"
            borderWidth="3px"
            borderRadius="full"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Text color="white" fontSize=".6rem">
              {notifications.length === NOTIFICATIONS_LIMIT ? `${NOTIFICATIONS_LIMIT}+` : notifications.length}
            </Text>
          </Box>
        ) : null}
      </MenuButton>
      <MenuList maxWidth="460px" p={3}>
        <Text className="text-gray-800" fontWeight="bold">
          {pluralize('new notification', notifications.length, true)}
        </Text>
        {notifications.length ? (
          notifications.map(({
            initiator,
            recipient,
            title,
            message,
            link,
            opened,
            created_at,
          }) => (
            <MenuItem
              key={`notification-${created_at}`}
              display="flex"
              flexDirection="row"
              alignItems="flex-start"
              className="space-x-3"
              borderRadius="md"
              borderWidth="2px"
              borderColor={!opened ? 'orange.300' : 'gray.100'}
              backgroundColor={!opened ? 'orange.200' : 'white'}
              _hover={{
                backgroundColor: !opened ? 'orange.200' : 'white',
                borderColor: 'orange.400',
              }}
              p={3}
              my={2}
              onClick={() => handleNotificationSelection({ id: `${created_at}`, recipient, link })}
              transition="all 200ms"
              style={{ outline: 'none' }}
            >
              <Avatar src={initiator.photoURL} name={initiator.displayName} />
              <Box width="90%">
                <Text color="blue.700" fontWeight="bold">{title || 'Notification'}</Text>
                <Text
                  color="gray"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  maxHeight="60px"
                >
                  {message}
                </Text>
                <Text fontSize="sm" color="gray.400">{moment(created_at).fromNow()}</Text>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Text fontStyle="italic" color="gray.400" textAlign="center" mb="2">No new notficiations</Text>
        )}
        <MenuItem
          _hover={{ backgroundColor: 'transparent' }}
          color="gray.800"
          textAlign="center"
          as={Button}
          variant="ghost"
          onClick={() => {
            window.location.hash = '#/notifications';
          }}
        >
          View all notifications
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

Notifications.defaultProps = {
  notifications: [],
};

export default Notifications;
