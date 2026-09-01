import type { HeroKey } from "../types/game";

export const getNum = (
  key: string,
  defaultValue = 0,
): number => {
  return Number(
    localStorage.getItem(key) ?? defaultValue
  );
};

export const setNum = (
  key: string,
  value: number,
): void => {
  localStorage.setItem(
    key,
    String(value)
  );
};

export const getHero = (): HeroKey => {
  return (
    localStorage.getItem("hero") as HeroKey
  ) || "explorer";
};