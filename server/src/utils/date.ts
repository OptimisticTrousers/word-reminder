export const addMinutesToDate = (minutes: number) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
