export default jest.fn(() => ({
  from: { email: 'nkowaokwu@example.com', name: 'Nkọwa okwu' },
  reply_to: { email: 'reply-to@example.com', name: 'Igbo API' },
  personalizations: ['to@example.com'],
  to: ['admin@example.com'],
}));
