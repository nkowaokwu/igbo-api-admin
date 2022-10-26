const copyToClipboard = ({
  copyText,
  successMessage,
} : {
  copyText: string,
  successMessage: string,
}, toast: (value: any) => void): void => {
  if (navigator) {
    navigator.clipboard.writeText(copyText);
    if (toast) {
      toast({
        title: 'Copied to clipboard 📋',
        description: successMessage,
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
    }
  }
};

export default copyToClipboard;
