import { BaseScene } from "./BaseScene";
import { W } from "../config/constants";
import { WORLDS } from "../config/worlds";
import { getNum } from "../utils/storage";

export class WorldsScene extends BaseScene {

  constructor() {
    super("Worlds");
  }

  create() {
    this.cameras.main.setBackgroundColor(
      "#11100d"
    );

    this.txt(
      W / 2,
      65,
      "EXPEDITION MAP",
      28,
      "#e7c66e"
    );

    const unlocked = Math.max(
      1,
      getNum("unlocked", 1)
    );

    WORLDS.forEach((world, index) => {

      const y = 155 + index * 115;
      const available = index < unlocked;

      const rectangle = this.add
        .rectangle(
          W / 2,
          y,
          330,
          82,
          available
            ? world.bg
            : 0x222222
        )
        .setStrokeStyle(
          3,
          available
            ? world.accent
            : 0x555555
        );

      this.txt(
        W / 2,
        y - 10,
        `${index + 1}. ${world.name}`,
        21,
        available
          ? "#fff"
          : "#777"
      );

      this.txt(
        W / 2,
        y + 20,
        available
          ? "EXPLORE"
          : "LOCKED",
        11,
        available
          ? "#e7c66e"
          : "#666"
      );

      if (available) {
        rectangle
          .setInteractive()
          .on("pointerdown", () => {
            this.scene.start(
              "Game",
              { idx: index }
            );
          });
      }
    });

    this.button(
      W / 2,
      690,
      "← MENU",
      () => this.scene.start("Menu"),
      180
    );
  }
}