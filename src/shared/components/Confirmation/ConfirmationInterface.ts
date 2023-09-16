import React from 'react';
import { ButtonProps } from 'react-admin';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';

export interface UpdateButtonProps extends ButtonProps {
  push: (value: string) => any;
}

export interface ConfirmationButtonInterface extends UpdateButtonProps {
  collection: Collections;
  selectionValue: string;
  action: any;
  onClose?: () => any;
  isOpen: boolean;
  view: Views;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  actionHelpers?: { [key: string]: any };
}

export interface ConfirmationInputInterface {
  onChange: (value) => void;
  value: string;
  onSubmit: () => void;
  header: string;
  placeholder: string;
  type: string;
  max?: number | string;
}
