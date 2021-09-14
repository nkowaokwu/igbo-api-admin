const numberOfDaysToLookBack = 7;
// @ts-ignore
export const LOOK_BACK_DATE = new Date(new Date() - (numberOfDaysToLookBack * 24 * 60 * 60 * 1000));
