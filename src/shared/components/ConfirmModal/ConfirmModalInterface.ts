interface ConfirmModal {
  isOpen: boolean,
  title: string,
  confirm: string,
  isConfirming?: boolean,
  confirmColorScheme?: string,
  cancel: string,
  onConfirm: () => void,
  onClose: () => void,
  isDisabled?: boolean,
  children: any,
};

export default ConfirmModal;
