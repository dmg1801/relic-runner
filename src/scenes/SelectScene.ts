import { BaseScene } from "./BaseScene";
import { W } from "../config/constants";
import type { HeroKey } from "../types/game";

export class SelectScene extends BaseScene {

  constructor() {
    super("Select");
  }

  create() {
    this.cameras.main.setBackgroundColor(
      "#17130f"
    );

    this.txt(
      W / 2,
      80,
      "CHOOSE EXPLORER",
      27,
      "#e7c66e"
    );

    const make = (
      x: number,
      key: HeroKey,
      label: string,
      color: number
    ) => {

      const box = this.add
        .rectangle(
          x,
          270,
          160,
          250,
          0x24211c
        )
        .setStrokeStyle(3, color)
        .setInteractive();

      this.add.rectangle(
        x,
        245,
        60,
        105,
        color
      );

      this.add.circle(
        x,
        180,
        30,
        color
      );

      this.txt(
        x,
        355,
        label,
        17
      );

      this.txt(
        x,
        390,
        key === "explorer"
          ? "SUNBOLT"
          : "MOON BOW",
        11,
        "#e7c66e"
      );

      box.on("pointerdown", () => {
        localStorage.setItem(
          "hero",
          key
        );

        this.scene.start("Worlds");
      });
    };

    make(
      115,
      "explorer",
      "EXPLORER",
      0x3d87c7
    );

    make(
      317,
      "adventurer",
      "ADVENTURER",
      0xb94e62
    );

    this.button(
      W / 2,
      660,
      "← BACK",
      () => this.scene.start("Menu"),
      180
    );
  }
}