export const createSeededRng = (seed) => {
  let value = typeof seed === "number" ? seed : parseInt(String(seed), 10);
  value %= 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};