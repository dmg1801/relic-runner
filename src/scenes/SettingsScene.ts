import { BaseScene } from "./BaseScene";
import { W } from "../config/constants";

export class SettingsScene extends BaseScene {

  constructor() {
    super("Settings");
  }

  create() {
    this.cameras.main.setBackgroundColor(
      "#12110e"
    );

    this.txt(
      W / 2,
      100,
      "SETTINGS",
      30,
      "#e7c66e"
    );

    let music =
      localStorage.getItem("music") !== "off";

    const label = this.txt(
      W / 2,
      260,
      `MUSIC: ${music ? "ON" : "OFF"}`,
      21
    );

    this.add
      .rectangle(
        W / 2,
        260,
        290,
        65,
        0,
        0
      )
      .setInteractive()
      .on("pointerdown", () => {

        music = !music;

        localStorage.setItem(
          "music",
          music ? "on" : "off"
        );

        label.setText(
          `MUSIC: ${music ? "ON" : "OFF"}`
        );
      });

    this.txt(
      W / 2,
      340,
      "PC: ← → / A D • SPACE • F",
      13,
      "#aaa"
    );

    this.txt(
      W / 2,
      370,
      "Mobile: ◀ ▶ • ✦ attack • ▲ jump",
      13,
      "#aaa"
    );

    this.button(
      W / 2,
      600,
      "RESET PROGRESS",
      () => {

        [
          "unlocked",
          "relic_maya",
          "relic_rome",
          "relic_egypt",
          "relic_china",
        ].forEach((key) =>
          localStorage.removeItem(key)
        );

        this.scene.restart();
      },
      260
    );

    this.button(
      W / 2,
      680,
      "← MENU",
      () => this.scene.start("Menu"),
      180
    );
  }
}