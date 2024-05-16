const validateDates = (from: Date, to: Date) => {
  if (from > to) {
    throw new Error("'From' date comes before the 'to' date");
  }
};

export default validateDates;


