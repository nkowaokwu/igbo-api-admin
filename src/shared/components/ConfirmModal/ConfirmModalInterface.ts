interface ConfirmModal {
  isOpen: boolean,
  title: string,
  confirm: string,
  isConfirming?: boolean,
  confirmColorScheme?: string,
  cancel: string,
  onConfirm: () => void,
  onClose: () => void,
  children: any,
};

export default ConfirmModal;
