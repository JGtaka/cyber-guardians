// min〜max(両端含む)の整数乱数
export const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1))
