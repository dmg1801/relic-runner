import { BaseScene } from "./BaseScene";
import { W } from "../config/constants";
import { WORLDS } from "../config/worlds";

export class MuseumScene extends BaseScene {

  constructor() {
    super("Museum");
  }

  create() {
    this.cameras.main.setBackgroundColor(
      "#16120e"
    );

    this.txt(
      W / 2,
      65,
      "THE MUSEUM",
      31,
      "#e7c66e"
    );

    this.txt(
      W / 2,
      100,
      "Recovered antiquities",
      13,
      "#aaa"
    );

    WORLDS.forEach((world, index) => {

      const y = 175 + index * 105;

      const recovered =
        localStorage.getItem(
          `relic_${world.key}`
        ) === "1";

      this.add
        .rectangle(
          W / 2,
          y,
          340,
          78,
          recovered
            ? 0x2b241c
            : 0x1c1b19
        )
        .setStrokeStyle(
          2,
          recovered
            ? world.accent
            : 0x444
        );

      this.txt(
        85,
        y,
        recovered ? "◆" : "?",
        28,
        recovered
          ? "#e7c66e"
          : "#555"
      );

      this.add.text(
        125,
        y - 22,
        recovered
          ? world.relic
          : "Unknown relic",
        {
          fontFamily: "monospace",
          fontSize: "17px",
          color: recovered
            ? "#fff"
            : "#666",
        }
      );

      this.add.text(
        125,
        y + 7,
        recovered
          ? `Recovered in ${world.name}`
          : "Complete expedition to discover",
        {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#999",
        }
      );
    });

    this.button(
      W / 2,
      680,
      "← MENU",
      () => this.scene.start("Menu"),
      180
    );
  }
}