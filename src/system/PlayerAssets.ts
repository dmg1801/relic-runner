import Phaser from "phaser";

export function preloadPlayerAssets(scene: Phaser.Scene): void {
  scene.load.spritesheet("explorer-run", "assets/characters/explorer/run.png", { frameWidth: 96, frameHeight: 78 });
  scene.load.spritesheet("explorer-idle", "assets/characters/explorer/idle.png", { frameWidth: 43, frameHeight: 78 });
  scene.load.spritesheet("explorer-jump", "assets/characters/explorer/jump.png", { frameWidth: 61, frameHeight: 78 });
  scene.load.spritesheet("explorer-fall", "assets/characters/explorer/fall.png", { frameWidth: 62, frameHeight: 78 });
  scene.load.spritesheet("explorer-shoot", "assets/characters/explorer/shoot.png", { frameWidth: 83, frameHeight: 78 });

  scene.load.spritesheet("adventurer-idle", "assets/characters/adventurer/idle.png", { frameWidth: 43, frameHeight: 78 });
  scene.load.spritesheet("adventurer-run", "assets/characters/adventurer/run.png", { frameWidth: 52, frameHeight: 78 });
  scene.load.spritesheet("adventurer-jump", "assets/characters/adventurer/jump.png", { frameWidth: 53, frameHeight: 78 });
  scene.load.spritesheet("adventurer-fall", "assets/characters/adventurer/fall.png", { frameWidth: 64, frameHeight: 85 });
  scene.load.spritesheet("adventurer-shoot", "assets/characters/adventurer/shoot.png", { frameWidth: 60, frameHeight: 86 });

  scene.load.audio("jump", "assets/sounds/jump.wav");
  scene.load.audio("player-hurt", "assets/sounds/player-hurt.mp3");
  scene.load.audio("adventurer-jump", "assets/sounds/adventurer-jump.wav");
  scene.load.audio("adventurer-hurt", "assets/sounds/adventurer-hurt.mp3");
}

export function createPlayerAnimations(scene: Phaser.Scene): void {
  const animations = [
    { key: "explorer-run", texture: "explorer-run", start: 0, end: 7, frameRate: 10, repeat: -1 },
    { key: "explorer-idle", texture: "explorer-idle", start: 0, end: 3, frameRate: 4, repeat: -1 },
    { key: "explorer-jump", texture: "explorer-jump", start: 0, end: 7, frameRate: 10, repeat: 0 },
    { key: "explorer-fall", texture: "explorer-fall", start: 0, end: 4, frameRate: 8, repeat: 0 },
    { key: "explorer-shoot", texture: "explorer-shoot", start: 0, end: 13, frameRate: 16, repeat: 0 },
    { key: "adventurer-idle", texture: "adventurer-idle", start: 0, end: 4, frameRate: 5, repeat: -1 },
    { key: "adventurer-run", texture: "adventurer-run", start: 0, end: 7, frameRate: 10, repeat: -1 },
    { key: "adventurer-jump", texture: "adventurer-jump", start: 0, end: 7, frameRate: 10, repeat: 0 },
    { key: "adventurer-fall", texture: "adventurer-fall", start: 0, end: 4, frameRate: 8, repeat: 0 },
    { key: "adventurer-shoot", texture: "adventurer-shoot", start: 0, end: 10, frameRate: 16, repeat: 0 },
  ];

  for (const animation of animations) {
    if (!scene.anims.exists(animation.key)) {
      scene.anims.create({
        key: animation.key,
        frames: scene.anims.generateFrameNumbers(animation.texture, {
          start: animation.start,
          end: animation.end,
        }),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }
  }
}
