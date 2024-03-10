import copyToClipboard from 'src/shared/utils/copyToClipboard';

const writeText = jest.fn();

Object.assign(navigator, {
  clipboard: {
    writeText,
  },
});

it('copies text to the keyboard', () => {
  const mockToast = jest.fn();
  const copyText = 'text';
  const successMessage = 'message';
  copyToClipboard({ copyText, successMessage }, mockToast);

  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(copyText);
  expect(mockToast).toHaveBeenCalledWith({
    title: 'Copied to clipboard 📋',
    description: successMessage,
    status: 'info',
    duration: 4000,
    isClosable: true,
  });
});
