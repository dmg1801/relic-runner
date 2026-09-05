import Phaser from "phaser";

export function preloadPlayerAssets(
  scene: Phaser.Scene
): void {
  // ==========================================
  // EXPLORER MOVEMENTS
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
  // ADVENTURER MOVEMENTS
  // ==========================================
scene.load.spritesheet(
  "adventurer-idle",
  "assets/characters/adventurer/idle.png",
  {
    frameWidth: 43,
    frameHeight: 78,
  }
);

scene.load.spritesheet(
  "adventurer-run",
  "assets/characters/adventurer/run.png",
  {
    frameWidth: 50,
    frameHeight: 78,
  }
);

scene.load.spritesheet(
  "adventurer-jump",
  "assets/characters/adventurer/jump.png",
  {
    frameWidth: 53,
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
  // IDLE EXPLORER
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
  // ADVENTURER EXPLORER
  // ==========================================


  if (!scene.anims.exists("adventurer-idle")) {
  scene.anims.create({
    key: "adventurer-idle",
    frames:
      scene.anims.generateFrameNumbers(
        "adventurer-idle",
        {
          start: 0,
          end: 4,
        }
      ),
    frameRate: 5,
    repeat: -1,
  });
}


  // ==========================================
  // RUN ADVENTURER
  // ==========================================

  if (!scene.anims.exists("adventurer-run")) {
    scene.anims.create({
      key: "adventurer-run",
      frames:
        scene.anims.generateFrameNumbers(
          "adventurer-run",
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
  // JUMP ADVENTURER
  // ==========================================

  if (!scene.anims.exists("adventurer-jump")) {
    scene.anims.create({
      key: "adventurer-jump",
      frames:
        scene.anims.generateFrameNumbers(
          "adventurer-jump",
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