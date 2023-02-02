import React, {
  ReactElement,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';
import { capitalize } from 'lodash';
import {
  Button,
  Text,
  useToast,
  ToastId,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  hideNotification,
  getNotification,
  undo,
  complete,
  undoableEventEmitter,
  useTranslate,
} from 'ra-core';

const Toast = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const notification = useSelector(getNotification);
  const dispatch = useDispatch();
  const translate = useTranslate();
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const handleRequestClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleExited = useCallback(() => {
    if (notification && notification.undoable) {
      dispatch(complete());
      undoableEventEmitter.emit('end', { isUndo: false });
    }
    dispatch(hideNotification());
  }, [dispatch, notification]);

  const handleUndo = useCallback(() => {
    dispatch(undo());
    undoableEventEmitter.emit('end', { isUndo: true });
  }, [dispatch]);

  useEffect(() => {
    setOpen(!!notification);
  }, [notification]);

  useEffect(() => {
    if (open) {
      toastRef.current = toast({
        title: capitalize(notification.type),
        description: (
          <>
            {notification.undoable ? (
              <Button
                color="primary"
                size="small"
                onClick={handleUndo}
              >
                {translate('ra.action.undo')}
              </Button>
            ) : null}
            <Text color="white">
              {notification.message && translate(notification.message, notification.messageArgs)}
            </Text>
          </>
        ),
        status: notification.type,
        duration: 4000,
        isClosable: true,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!toast.isActive(toastRef.current)) {
      handleExited();
      handleRequestClose();
    }
  }, [toast.isActive]);

  return null;
};

export default Toast;
