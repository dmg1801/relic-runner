import Phaser from "phaser";
import { W } from "../config/constants";

export type HUDOptions = {
  scene: Phaser.Scene;
  worldName: string;
  accent: number;
  lives: number;
  godMode: boolean;
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onJump: () => void;
  onFireDown: () => void;
  onFireUp: () => void;
  onPause: () => void;
  onToggleSound: () => void;
  onGodModeToggle: () => void;
};

export type HUDController = {
  livesText: Phaser.GameObjects.Text;
  godLabel: Phaser.GameObjects.Text;
  updateLives: (lives: number) => void;
  setGodMode: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
};

export function createHUD(options: HUDOptions): HUDController {
  const {
    scene, worldName, accent, lives, godMode,
    onLeftDown, onLeftUp, onRightDown, onRightUp,
    onJump, onFireDown, onFireUp,
    onPause, onToggleSound, onGodModeToggle,
  } = options;

  // VIDAS: arriba del escenario, rojas y con sombra.
  const livesShadow = scene.add.text(19, 21, getLivesText(lives), {
    fontFamily: "Arial",
    fontSize: "26px",
    fontStyle: "bold",
    color: "#000000",
  }).setScrollFactor(0).setDepth(99).setAlpha(0.65);

  const livesText = scene.add.text(17, 19, getLivesText(lives), {
    fontFamily: "Arial",
    fontSize: "26px",
    fontStyle: "bold",
    color: "#e53935",
    stroke: "#5c1010",
    strokeThickness: 2,
  }).setScrollFactor(0).setDepth(100);

  // Nombre del mundo.
  const worldText = scene.add.text(W / 2, 640, worldName, {
    fontFamily: "Arial",
    fontSize: "18px",
    color: colorToHex(accent),
  }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive();

  // God mode.
  const godLabel = scene.add.text(W / 2, 660, "DEV MODE", {
    fontFamily: "Arial",
    fontSize: "12px",
    color: "#ffd76a",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(godMode);

  let godTaps = 0;
  let lastGodTap = 0;

  worldText.on("pointerdown", () => {
    const now = scene.time.now;
    if (now - lastGodTap > 2000) godTaps = 0;
    lastGodTap = now;
    godTaps++;

    if (godTaps >= 5) {
      godTaps = 0;
      onGodModeToggle();
    }
  });

  // Controles principales: grandes y redondos.
  createTouchButton(scene, 50, 720, "◀", onLeftDown, onLeftUp);
  createTouchButton(scene, 120, 720, "▶", onRightDown, onRightUp);
  createTouchButton(scene, 312, 720, "✦", onFireDown, onFireUp);
  createTouchButton(scene, 382, 720, "▲", onJump);

  // Pausa y sonido: centro del HUD.
  createTouchButton(scene, 188, 690, "Ⅱ", onPause, undefined, 25, 22);

  const soundEnabled = localStorage.getItem("music") !== "off";
  const soundControl = createSoundButton(
    scene,
    244,
    690,
    soundEnabled,
    onToggleSound
  );

  return {
    livesText,
    godLabel,

    updateLives: (newLives: number) => {
      const text = getLivesText(newLives);
      livesText.setText(text);
      livesShadow.setText(text);
    },

    setGodMode: (enabled: boolean) => {
      godLabel.setVisible(enabled);
    },

    setSoundEnabled: (enabled: boolean) => {
      soundControl.text.setText(enabled ? "♪" : "×♪");
    },
  };
}

function createTouchButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onDown: () => void,
  onUp?: () => void,
  radius = 31,
  fontSize = 28
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y)
    .setScrollFactor(0)
    .setDepth(100);

  const circle = scene.add.circle(0, 0, radius, 0x17130f, 0.78);
  circle.setStrokeStyle(2, 0xd6b85a, 0.85);

  const text = scene.add.text(0, 0, label, {
    fontFamily: "Arial",
    fontSize: `${fontSize}px`,
    fontStyle: "bold",
    color: "#ffffff",
  }).setOrigin(0.5);

  container.add([circle, text]);
  container.setSize(radius * 2, radius * 2);

 container.setInteractive(
  new Phaser.Geom.Circle(
    radius,
    radius,
    radius
  ),
  Phaser.Geom.Circle.Contains
);

  container.on("pointerdown", () => {
    container.setScale(0.92);
    onDown();
  });

  const release = () => {
    container.setScale(1);
    if (onUp) onUp();
  };

  container.on("pointerup", release);
  container.on("pointerupoutside", release);

  if (onUp) {
    container.on("pointerout", release);
  }

  return container;
}

function createSoundButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  enabled: boolean,
  onToggle: () => void
) {
  const radius = 25;

  const container = scene.add.container(x, y)
    .setScrollFactor(0)
    .setDepth(100);

  const circle = scene.add.circle(0, 0, radius, 0x17130f, 0.78);
  circle.setStrokeStyle(2, 0xd6b85a, 0.85);

  const text = scene.add.text(0, 0, enabled ? "♪" : "×♪", {
    fontFamily: "Arial",
    fontSize: "22px",
    fontStyle: "bold",
    color: "#ffffff",
  }).setOrigin(0.5);

  container.add([circle, text]);
  container.setSize(radius * 2, radius * 2);

container.setInteractive(
  new Phaser.Geom.Circle(
    radius,
    radius,
    radius
  ),
  Phaser.Geom.Circle.Contains
);

  container.on("pointerdown", () => {
    container.setScale(0.92);
    onToggle();
  });

  const release = () => container.setScale(1);
  container.on("pointerup", release);
  container.on("pointerupoutside", release);

  return { container, text };
}

function getLivesText(lives: number): string {
  return "♥ ".repeat(Math.max(0, lives)).trim();
}

function colorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}
