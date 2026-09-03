import Phaser from "phaser";

// ==========================================
// ASSETS
// ==========================================

export function preloadMayaAssets(
  scene: Phaser.Scene
): void {
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

  scene.load.spritesheet(
    "maya-guardian-walk",
    "assets/enemies/maya/stone-guardian-walk.png",
    {
      frameWidth: 65,
      frameHeight: 100,
    }
  );

  scene.load.spritesheet(
    "maya-jade-mask",
    "assets/worlds/maya/jade-mask.png",
    {
      frameWidth: 86,
      frameHeight: 100,
    }
  );

  scene.load.audio(
    "maya-jungle-ambience",
    "assets/sounds/maya-jungle-ambience.wav"
  );

  scene.load.audio(
    "guardian-crumble",
    "assets/sounds/guardian-crumble.mp3"
  );
}


// ==========================================
// ANIMACIONES
// ==========================================

export function createMayaAnimations(
  scene: Phaser.Scene
): void {
  if (
    !scene.anims.exists(
      "maya-guardian-walk"
    )
  ) {
    scene.anims.create({
      key: "maya-guardian-walk",

      frames:
        scene.anims.generateFrameNumbers(
          "maya-guardian-walk",
          {
            start: 0,
            end: 7,
          }
        ),

      frameRate: 8,
      repeat: -1,
    });
  }


  if (
    !scene.anims.exists(
      "maya-jade-mask-glow"
    )
  ) {
    scene.anims.create({
      key: "maya-jade-mask-glow",

      frames:
        scene.anims.generateFrameNumbers(
          "maya-jade-mask",
          {
            start: 0,
            end: 7,
          }
        ),

      frameRate: 5,
      repeat: -1,
    });
  }
}