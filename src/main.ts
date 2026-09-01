import Phaser from "phaser";

import {
  W,
  H,
} from "./config/constants";

import { MenuScene } from "./scenes/MenuScene";
import { SelectScene } from "./scenes/SelectScene";
import { WorldsScene } from "./scenes/WorldScene";
import { GameScene } from "./scenes/GameScene";
import { MuseumScene } from "./scenes/MuseumScene";
import { SettingsScene } from "./scenes/SettingsScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: W,
  height: H,

  pixelArt: true,

  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },

  backgroundColor: "#000",

  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 980,
      },
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [
    MenuScene,
    SelectScene,
    WorldsScene,
    GameScene,
    MuseumScene,
    SettingsScene,
  ],
});