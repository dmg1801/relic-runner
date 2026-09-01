import { BaseScene } from "./BaseScene";
import { W } from "../config/constants";

export class MenuScene extends BaseScene {

  constructor() {
    super("Menu");
  }

  create() {
    this.cameras.main.setBackgroundColor(
      "#10100c"
    );

    this.txt(
      W / 2,
      105,
      "RELIC RUNNER",
      38,
      "#e7c66e"
    );

    this.txt(
      W / 2,
      150,
      "ARCHAEOLOGICAL ADVENTURE",
      13,
      "#d9d1bc"
    );

    this.button(
      W / 2,
      255,
      "START EXPEDITION",
      () => this.scene.start("Select")
    );

    this.button(
      W / 2,
      325,
      "MUSEUM",
      () => this.scene.start("Museum")
    );

    this.button(
      W / 2,
      395,
      "SETTINGS",
      () => this.scene.start("Settings")
    );

    this.txt(
      W / 2,
      690,
      "V0.2 • HORIZONTAL PROTOTYPE",
      12,
      "#8d887d"
    );
  }
}