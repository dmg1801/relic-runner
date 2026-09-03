import Phaser from "phaser";

import { W, H, HUD_TOP, WORLD_W } from "../config/constants";

import { WORLDS } from "../config/worlds";

import { getNum, setNum, getHero } from "../utils/storage";

import {
  preloadPlayerAssets,
  createPlayerAnimations,
} from "../systems/PlayerAssets";
import { PlayerController } from "../systems/PlayerController";
import {
  preloadCombatAssets,
  createArrow,
  updateArrows,
  createArrowImpactEffect,
} from "../systems/CombatSystem";
import { createHUD, type HUDController } from "../systems/HUD";

import { BaseScene } from "./BaseScene";
import { preloadMayaAssets } from "../world/maya/MayaAssets";
import { createMayaLevel } from "../world/maya/MayaLevel";
import {
  createMayaGuardians,
  updateMayaGuardians,
  hitMayaGuardian,
} from "../world/maya/MayaEnemies";

export class GameScene extends BaseScene {
  constructor() {
    super("Game");
  }
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  enemies!: Phaser.Physics.Arcade.Group;
  shots!: Phaser.Physics.Arcade.Group;
  firing = false;
  left = false;
  right = false;
  idx = 0;
  paused = false;
  lives = 3;
  invulnerable = false;
  facing = 1;
  lastShot = 0;
  won = false;

 

  ambient?: Phaser.Sound.BaseSound;
  playerController!: PlayerController;
  hud!: HUDController;

  isShooting = false;
  godMode = false;
  init(d: { idx: number }) {
    this.idx = d.idx ?? 0;

    // Reiniciar el estado cada vez que comienza una expedición
    this.left = false;
    this.right = false;
    this.paused = false;
    this.firing = false;

    this.lives = 3;
    this.invulnerable = false;

    this.facing = 1;
    this.lastShot = 0;

    this.won = false;
    this.isShooting = false;
    this.godMode = false;
  }
  preload() {
    // ==========================================
    // PANTALLA DE CARGA
    // ==========================================

    this.cameras.main.setBackgroundColor("#0b1710");

    const world = WORLDS[this.idx];

    // Todo lo perteneciente al loader vive aquí.
    // Cuando termine la carga destruiremos este container.
    const loadingScreen = this.add.container(0, 0);

    // ==========================================
    // BRÚJULA ANIMADA
    // ==========================================

    const compass = this.add.container(W / 2, 210);

    // Círculo exterior
    const compassRing = this.add.circle(0, 0, 20, 0x000000, 0);

    compassRing.setStrokeStyle(2, 0xd6b85a, 1);

    // Pequeño círculo central
    const compassCenter = this.add.circle(0, 0, 3, 0xd6b85a);

    // Aguja
    const needle = this.add.triangle(
      0,
      0,

      0,
      -15,
      -5,
      8,
      5,
      8,

      0xd6b85a,
    );

    compass.add([compassRing, needle, compassCenter]);

    loadingScreen.add(compass);

    // ==========================================
    // TEXTOS
    // ==========================================

    const title = this.add
      .text(W / 2, 260, "PREPARING EXPEDITION", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#e7c66e",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const worldText = this.add
      .text(W / 2, 305, world.name, {
        fontFamily: "monospace",
        fontSize: "15px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // ==========================================
    // BARRA DE PROGRESO
    // ==========================================

    const barBackground = this.add.rectangle(W / 2, 370, 300, 16, 0x181818);

    const progressBar = this.add
      .rectangle(W / 2 - 148, 370, 0, 10, 0xd6b85a)
      .setOrigin(0, 0.5);

    const loadingText = this.add
      .text(W / 2, 405, "0%", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d9d1bc",
      })
      .setOrigin(0.5);

    // Añadimos todo al loader
    loadingScreen.add([
      title,
      worldText,
      barBackground,
      progressBar,
      loadingText,
    ]);

    // ==========================================
    // ANIMACIÓN DE LA BRÚJULA
    // ==========================================

    const compassTween = this.tweens.add({
      targets: needle,

      angle: {
        from: -35,
        to: 35,
      },

      duration: 450,

      yoyo: true,
      repeat: -1,

      ease: "Sine.easeInOut",
    });

    // ==========================================
    // PUNTOS ANIMADOS ...
    // ==========================================

    let dots = 0;

    const loadingTimer = this.time.addEvent({
      delay: 350,
      loop: true,

      callback: () => {
        dots = (dots + 1) % 4;

        title.setText("PREPARING EXPEDITION" + ".".repeat(dots));
      },
    });

    // ==========================================
    // PROGRESO REAL DE PHASER
    // ==========================================

    this.load.on("progress", (value: number) => {
      progressBar.width = 296 * value;

      loadingText.setText(`${Math.floor(value * 100)}%`);
    });

    // ==========================================
    // CUANDO TERMINA LA CARGA
    // ==========================================

    this.load.once("complete", () => {
      loadingTimer.destroy();

      compassTween.stop();

      loadingScreen.destroy(true);
    });

    preloadPlayerAssets(this);
    preloadCombatAssets(this);

    if (world.key === "maya") {
      preloadMayaAssets(this);
    }
  }

  create() {
    this.input.addPointer(3);
    const world = WORLDS[this.idx];

    // Aplicar la preferencia de sonido guardada
    this.sound.mute = localStorage.getItem("music") === "off";

    // Ambiente propio del mundo Maya
    if (world.key === "maya") {
      this.ambient = this.sound.add("maya-jungle-ambience", {
        loop: true,
        volume: 0.2,
      });

      this.ambient.play();
    }

    createPlayerAnimations(this);

    if (!this.anims.exists("maya-guardian-walk")) {
      this.anims.create({
        key: "maya-guardian-walk",
        frames: this.anims.generateFrameNumbers("maya-guardian-walk", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists("maya-jade-mask-glow")) {
      this.anims.create({
        key: "maya-jade-mask-glow",
        frames: this.anims.generateFrameNumbers("maya-jade-mask", {
          start: 0,
          end: 7,
        }),
        frameRate: 5,
        repeat: -1,
      });
    }

    this.cameras.main.setBackgroundColor(world.bg);
    this.physics.world.setBounds(0, 0, WORLD_W, HUD_TOP);
    this.makeTextures(world);
    // Placeholder background layers. Replace these rectangles with tileSprites/images in public/assets/worlds/<world>/.

    this.platforms = this.physics.add.staticGroup();

    this.player = this.physics.add.sprite(90, 530, "explorer-idle", 0);
    this.player.setScale(0.55);
    this.player.setCollideWorldBounds(true).setBounce(0.02);

    this.playerController = new PlayerController(this.player);

    this.playerController.setFacing(this.facing);

    if (world.key === "maya") {
      createMayaLevel({
        scene: this,
        platforms: this.platforms,
        player: this.player,

        onDamage: () => this.damage(),

        onWin: () => this.win(),
      });
    }

    this.physics.add.collider(this.player, this.platforms);
    this.enemies = this.physics.add.group({
      allowGravity: true,
    });

    if (world.key === "maya") {
      createMayaGuardians(this, this.enemies);
    }
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.enemies,
      () => this.damage(),
      undefined,
      this,
    );
    this.shots = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.shots, this.platforms, (s) => s.destroy());
  this.physics.add.overlap(
  this.shots,
  this.enemies,
  (shotObject, enemyObject) => {
    const arrow =
      shotObject as Phaser.Physics.Arcade.Sprite;

    const enemy =
      enemyObject as Phaser.Physics.Arcade.Sprite;

    // Punto exacto del impacto
    const impactX = arrow.x;
    const impactY = arrow.y;

    // Feedback genérico del proyectil
    createArrowImpactEffect(
      this,
      impactX,
      impactY
    );

    this.sound.play(
      "arrow-impact",
      {
        volume: 0.5,
      }
    );

    // La flecha desaparece
    arrow.destroy();

    // El mundo decide qué le ocurre
    // a su enemigo.
    if (world.key === "maya") {
      hitMayaGuardian(
        this,
        enemy
      );
    }
  },
  undefined,
  this,
);
    // spikes / traps
    // Maya spikes / traps

    this.input.keyboard!.removeAllListeners();

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.input.keyboard!.addKey("A");
    this.input.keyboard!.addKey("D");
    this.input.keyboard!.on("keydown-SPACE", () => {
      this.jump();
    });

    this.input.keyboard!.on("keydown-UP", () => {
      this.jump();
    });

    this.input.keyboard!.on("keydown-F", () => this.fire());
    this.input.keyboard!.on("keydown-ESC", () => this.pauseMenu());
    this.input.keyboard!.on("keydown-G", () => {
      this.toggleGodMode();
    });

    this.game.events.on(Phaser.Core.Events.BLUR, this.resetControls, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.resetControls, this);

      this.resetControls();

      // Detener el ambiente al abandonar
      // la expedición
      if (this.ambient) {
        this.ambient.stop();
        this.ambient.destroy();
        this.ambient = undefined;
      }
    });
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 45);
    this.cameras.main.setDeadzone(90, 120);
    this.hud = createHUD({
      scene: this,

      worldName: world.name,
      accent: world.accent,
      lives: this.lives,

      godMode: this.godMode,

      onLeftDown: () => {
        this.left = true;
      },

      onLeftUp: () => {
        this.left = false;
      },

      onRightDown: () => {
        this.right = true;
      },

      onRightUp: () => {
        this.right = false;
      },

      onJump: () => {
        this.jump();
      },

      onFireDown: () => {
        this.firing = true;
        this.fire();
      },

      onFireUp: () => {
        this.firing = false;
      },

      onPause: () => {
       this.pauseMenu();
      },

      onToggleSound: () => {
        this.toggleSound();
      },

      onGodModeToggle: () => {
        this.toggleGodMode();
      },
    });
  }
  makeTextures(world: (typeof WORLDS)[number]) {
    ["hero", "relic", "shot"].forEach((k) => {
      if (this.textures.exists(k)) this.textures.remove(k);
    });
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(getHero() === "explorer" ? 0x4f93d1 : 0xd85e74);
    g.fillRect(0, 0, 30, 46);
    g.generateTexture("hero", 30, 46);
    g.clear();
    g.fillStyle(world.accent);
    g.fillRect(0, 0, 38, 38);
    g.generateTexture("relic", 38, 38);
    g.clear();
    g.fillStyle(0xffe06b);
    g.fillCircle(6, 6, 6);
    g.generateTexture("shot", 12, 12);
    g.clear();
    g.destroy();
  }

 
 resetControls() {
    this.left = false;
    this.right = false;
    this.firing = false;

    if (this.playerController) {
      this.playerController.stop();
    }
  }

  jump() {
    if (this.paused) {
      return;
    }

    const jumped = this.playerController.jump();

    if (!jumped) {
      return;
    }

    this.sound.play("jump", {
      volume: 0.6,
    });
  }

  fire() {
    if (
      this.paused ||
      this.won ||
      this.isShooting ||
      this.time.now - this.lastShot < 300
    )
      return;

    this.lastShot = this.time.now;
    this.isShooting = true;

    // Empieza la animación del arco
    this.player.play("explorer-shoot", true);

    // Esperamos hasta el momento en que suelta la cuerda
    this.time.delayedCall(320, () => {
      if (this.paused || this.won || !this.player?.active) return;

      // Sonido de liberación del arco
      this.sound.play("arrow-shot", {
        volume: 0.45,
      });

      createArrow(this.shots, this.player, this.facing, this.time.now);
    });

    this.player.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "explorer-shoot",
      () => {
        this.isShooting = false;
      },
    );
  }

  damage() {
    if (this.godMode) return;

    if (this.invulnerable || this.won) return;

    // Sonido al recibir daño
    this.sound.play("player-hurt", {
      volume: 0.55,
    });

    this.lives--;
    this.updateLives();

    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    this.invulnerable = true;

    this.player.setTint(0xff7777);
    this.player.setVelocity(-this.facing * 180, -260);

    this.time.delayedCall(1200, () => {
      if (this.player?.active) {
        this.invulnerable = false;
        this.player.clearTint();
      }
    });
  }

  updateLives() {
    this.hud.updateLives(
  this.lives
);
  }
  update() {
    const keyA = this.input.keyboard!.addKey("A");

    const keyD = this.input.keyboard!.addKey("D");

    const moveLeft = this.left || this.cursors.left.isDown || keyA.isDown;

    const moveRight = this.right || this.cursors.right.isDown || keyD.isDown;

    const vx = this.playerController.move(moveLeft, moveRight);

    this.facing = this.playerController.getFacing();

    this.playerController.updateAnimation(vx, this.isShooting);

    const world = WORLDS[this.idx];

    if (world.key === "maya") {
      updateMayaGuardians(this.enemies);
    }

    updateArrows(this.shots, this.time.now);

    if (this.player.y > HUD_TOP - 15) {
      if (this.godMode) {
        // Rescate automático en modo desarrollador
        this.player.setPosition(Math.max(90, this.player.x - 100), 500);

        this.player.setVelocity(0, 0);
      } else {
        this.damage();
      }
    }
    if (this.firing) {
      this.fire();
    }
  }

  toggleGodMode() {
    this.godMode =
  !this.godMode;

this.hud?.setGodMode(
  this.godMode
);
    console.log(this.godMode ? "GOD MODE ACTIVATED" : "GOD MODE DEACTIVATED");
  }

  toggleSound() {
  const currentlyOff =
    localStorage.getItem("music") === "off";

  const soundEnabled =
    currentlyOff;

  localStorage.setItem(
    "music",
    soundEnabled ? "on" : "off"
  );

  this.sound.mute =
    !soundEnabled;

  this.hud.setSoundEnabled(
    soundEnabled
  );
}
  pauseMenu() {
    if (this.paused || this.won) return;
    this.resetControls();
    this.paused = true;
    this.physics.pause();
    const shade = this.add
      .rectangle(W / 2, H / 2, W, H, 0x000000, 0.82)
      .setScrollFactor(0)
      .setDepth(200);
    this.txt(W / 2, 270, "EXPEDITION PAUSED", 24, "#e7c66e")
      .setScrollFactor(0)
      .setDepth(201);
    const resume = this.add
      .rectangle(W / 2, 350, 250, 55, 0x2d261c)
      .setStrokeStyle(2, 0xe7c66e)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(201);
    const rt = this.txt(W / 2, 350, "RESUME", 20)
      .setScrollFactor(0)
      .setDepth(202);
    resume.on("pointerdown", () => {
      shade.destroy();
      resume.destroy();
      rt.destroy();
      this.scene.restart({ idx: this.idx });
    });
    const menu = this.add
      .rectangle(W / 2, 420, 250, 55, 0x2d261c)
      .setStrokeStyle(2, 0xe7c66e)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(201);
    this.txt(W / 2, 420, "EXPEDITION MAP", 17)
      .setScrollFactor(0)
      .setDepth(202);
    menu.on("pointerdown", () => this.scene.start("Worlds"));
  }
  gameOver() {
    this.resetControls();
    this.won = true;
    this.physics.pause();
    this.add
      .rectangle(W / 2, H / 2, W, H, 0x000000, 0.86)
      .setScrollFactor(0)
      .setDepth(220);
    this.txt(W / 2, 285, "GAME OVER", 36, "#e36b5d")
      .setScrollFactor(0)
      .setDepth(221);
    this.txt(W / 2, 330, "The expedition has failed.", 14)
      .setScrollFactor(0)
      .setDepth(221);
    const b = this.add
      .rectangle(W / 2, 420, 270, 58, 0x2c261d)
      .setStrokeStyle(3, 0xe7c66e)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(221);
    this.txt(W / 2, 420, "RETRY EXPEDITION", 17)
      .setScrollFactor(0)
      .setDepth(222);
    b.on("pointerdown", () => this.scene.restart({ idx: this.idx }));
  }
  win() {
    if (this.won) return;
    this.resetControls();
    this.won = true;
    this.physics.pause();
    const w = WORLDS[this.idx];
    localStorage.setItem(`relic_${w.key}`, "1");
    setNum(
      "unlocked",
      Math.max(getNum("unlocked", 1), Math.min(4, this.idx + 2)),
    );
    this.add
      .rectangle(W / 2, H / 2, W, H, 0x000000, 0.84)
      .setScrollFactor(0)
      .setDepth(220);
    this.txt(W / 2, 285, "RELIC RECOVERED!", 27, "#e7c66e")
      .setScrollFactor(0)
      .setDepth(221);
    this.txt(W / 2, 330, w.relic, 19)
      .setScrollFactor(0)
      .setDepth(221);
    const b = this.add
      .rectangle(W / 2, 430, 270, 58, 0x2c261d)
      .setStrokeStyle(3, w.accent)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(221);
    this.txt(W / 2, 430, this.idx < 3 ? "EXPEDITION MAP" : "VIEW MUSEUM", 17)
      .setScrollFactor(0)
      .setDepth(222);
    b.on("pointerdown", () =>
      this.scene.start(this.idx < 3 ? "Worlds" : "Museum"),
    );
  }
}
