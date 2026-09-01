import type { WorldKey } from "../types/game";

export interface WorldConfig {
  key: WorldKey;
  name: string;
  relic: string;
  bg: number;
  accent: number;
  ground: number;
}

export const WORLDS: WorldConfig[] = [
  {
    key: "maya",
    name: "MAYA",
    relic: "Jade Mask",
    bg: 0x183d2b,
    accent: 0xd6b85a,
    ground: 0x30291d,
  },
  {
    key: "rome",
    name: "ROME",
    relic: "Imperial Coin",
    bg: 0x51362d,
    accent: 0xd8c5a0,
    ground: 0x45382f,
  },
  {
    key: "egypt",
    name: "EGYPT",
    relic: "Scarab Amulet",
    bg: 0x8c612d,
    accent: 0x45b8b0,
    ground: 0x5c4025,
  },
  {
    key: "china",
    name: "CHINA",
    relic: "Ritual Jade Bi",
    bg: 0x542126,
    accent: 0xe0b84b,
    ground: 0x3a2522,
  },
];