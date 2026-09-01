import Phaser from "phaser";

export function preloadPlayerAssets(
  scene: Phaser.Scene
): void {
  // ==========================================
  // EXPLORER
  // ==========================================

  scene.load.spritesheet(
    "explorer-run",
    "assets/characters/explorer/run.png",
    {
      frameWidth: 96,
      frameHeight: 78,
    }
  );

  scene.load.spritesheet(
    "explorer-idle",
    "assets/characters/explorer/idle.png",
    {
      frameWidth: 43,
      frameHeight: 78,
    }
  );

  scene.load.spritesheet(
    "explorer-jump",
    "assets/characters/explorer/jump.png",
    {
      frameWidth: 61,
      frameHeight: 78,
    }
  );

  scene.load.spritesheet(
    "explorer-fall",
    "assets/characters/explorer/fall.png",
    {
      frameWidth: 62,
      frameHeight: 78,
    }
  );

  scene.load.spritesheet(
    "explorer-shoot",
    "assets/characters/explorer/shoot.png",
    {
      frameWidth: 83,
      frameHeight: 78,
    }
  );

  // ==========================================
  // SONIDOS DEL JUGADOR
  // ==========================================

  scene.load.audio(
    "jump",
    "assets/sounds/jump.wav"
  );

  scene.load.audio(
    "player-hurt",
    "assets/sounds/player-hurt.mp3"
  );
}


export function createPlayerAnimations(
  scene: Phaser.Scene
): void {
  // ==========================================
  // RUN
  // ==========================================

  if (!scene.anims.exists("explorer-run")) {
    scene.anims.create({
      key: "explorer-run",

      frames:
        scene.anims.generateFrameNumbers(
          "explorer-run",
          {
            start: 0,
            end: 7,
          }
        ),

      frameRate: 10,
      repeat: -1,
    });
  }


  // ==========================================
  // IDLE
  // ==========================================

  if (!scene.anims.exists("explorer-idle")) {
    scene.anims.create({
      key: "explorer-idle",

      frames:
        scene.anims.generateFrameNumbers(
          "explorer-idle",
          {
            start: 0,
            end: 3,
          }
        ),

      frameRate: 4,
      repeat: -1,
    });
  }


  // ==========================================
  // JUMP
  // ==========================================

  if (!scene.anims.exists("explorer-jump")) {
    scene.anims.create({
      key: "explorer-jump",

      frames:
        scene.anims.generateFrameNumbers(
          "explorer-jump",
          {
            start: 0,
            end: 7,
          }
        ),

      frameRate: 10,
      repeat: 0,
    });
  }


  // ==========================================
  // FALL
  // ==========================================

  if (!scene.anims.exists("explorer-fall")) {
    scene.anims.create({
      key: "explorer-fall",

      frames:
        scene.anims.generateFrameNumbers(
          "explorer-fall",
          {
            start: 0,
            end: 4,
          }
        ),

      frameRate: 8,
      repeat: 0,
    });
  }


  // ==========================================
  // SHOOT
  // ==========================================

  if (!scene.anims.exists("explorer-shoot")) {
    scene.anims.create({
      key: "explorer-shoot",

      frames:
        scene.anims.generateFrameNumbers(
          "explorer-shoot",
          {
            start: 0,
            end: 13,
          }
        ),

      frameRate: 16,
      repeat: 0,
    });
  }
}