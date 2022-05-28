export type Poll = {
  constructedTerm: string,
  englishTerm: string,
  definition: string,
  text: string,
  poll: {
    options: string[],
    duration_minutes: number,
  },
};
