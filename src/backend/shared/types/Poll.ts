export type Poll = {
  text: string,
  poll: {
    options: string[],
    duration_minutes: number,
  },
};
