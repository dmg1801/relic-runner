import Phaser from "phaser";

export class BaseScene extends Phaser.Scene {

  txt(
    x: number,
    y: number,
    text: string,
    size = 24,
    color = "#fff"
  ) {
    return this.add
      .text(x, y, text, {
        fontFamily: "monospace",
        fontSize: `${size}px`,
        color,
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
  }

  button(
    x: number,
    y: number,
    label: string,
    callback: () => void,
    width = 280
  ) {
    const rectangle = this.add
      .rectangle(
        x,
        y,
        width,
        54,
        0x241d16
      )
      .setStrokeStyle(3, 0xd2ad63)
      .setInteractive({
        useHandCursor: true
      });

    const text = this.txt(
      x,
      y,
      label,
      20
    );

    rectangle.on(
      "pointerdown",
      callback
    );

    return [rectangle, text];
  }
}