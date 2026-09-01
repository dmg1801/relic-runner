import Phaser from "phaser";

export function preloadMayaAssets(
  scene: Phaser.Scene
): void {
  // ==========================================
  // ESCENARIO MAYA
  // ==========================================

  scene.load.image(
    "maya-background",
    "assets/worlds/maya/background.png"
  );

  scene.load.image(
    "maya-platform-left",
    "assets/worlds/maya/platform-left.png"
  );

  scene.load.image(
    "maya-platform-middle",
    "assets/worlds/maya/platform-middle.png"
  );

  scene.load.image(
    "maya-platform-right",
    "assets/worlds/maya/platform-right.png"
  );

  scene.load.image(
    "maya-spike",
    "assets/worlds/maya/spike.png"
  );

  // ==========================================
  // GUARDIÁN MAYA
  // ==========================================

  scene.load.spritesheet(
    "maya-guardian-walk",
    "assets/enemies/maya/stone-guardian-walk.png",
    {
      frameWidth: 65,
      frameHeight: 100,
    }
  );

  // ==========================================
  // RELIQUIA
  // ==========================================

  scene.load.spritesheet(
    "maya-jade-mask",
    "assets/worlds/maya/jade-mask.png",
    {
      frameWidth: 86,
      frameHeight: 100,
    }
  );

  // ==========================================
  // AMBIENTE
  // ==========================================

  scene.load.audio(
    "maya-jungle-ambience",
    "assets/sounds/maya-jungle-ambience.wav"
  );

  scene.load.audio(
    "guardian-crumble",
    "assets/sounds/guardian-crumble.mp3"
  );
}