import Phaser from "phaser";

import {
  W,
  H,
  HUD_TOP,
  WORLD_W,
} from "../config/constants";

import { WORLDS } from "../config/worlds";

import {
  getNum,
  setNum,
  getHero,
} from "../utils/storage";

import { BaseScene } from "./BaseScene";

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
  hudLives!: Phaser.GameObjects.Text;
  soundLabel!: Phaser.GameObjects.Text;
  godLabel!: Phaser.GameObjects.Text;
  ambient?: Phaser.Sound.BaseSound;

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

  const compass = this.add.container(
    W / 2,
    210
  );

  // Círculo exterior
  const compassRing = this.add.circle(
    0,
    0,
    20,
    0x000000,
    0
  );

  compassRing.setStrokeStyle(
    2,
    0xd6b85a,
    1
  );

  // Pequeño círculo central
  const compassCenter = this.add.circle(
    0,
    0,
    3,
    0xd6b85a
  );

  // Aguja
  const needle = this.add.triangle(
    0,
    0,

    0, -15,
    -5, 8,
    5, 8,

    0xd6b85a
  );

  compass.add([
    compassRing,
    needle,
    compassCenter
  ]);

  loadingScreen.add(compass);


  // ==========================================
  // TEXTOS
  // ==========================================

  const title = this.add
    .text(
      W / 2,
      260,
      "PREPARING EXPEDITION",
      {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#e7c66e",
        stroke: "#000000",
        strokeThickness: 4,
      }
    )
    .setOrigin(0.5);

  const worldText = this.add
    .text(
      W / 2,
      305,
      world.name,
      {
        fontFamily: "monospace",
        fontSize: "15px",
        color: "#ffffff",
      }
    )
    .setOrigin(0.5);


  // ==========================================
  // BARRA DE PROGRESO
  // ==========================================

  const barBackground = this.add.rectangle(
    W / 2,
    370,
    300,
    16,
    0x181818
  );

  const progressBar = this.add
    .rectangle(
      W / 2 - 148,
      370,
      0,
      10,
      0xd6b85a
    )
    .setOrigin(0, 0.5);

  const loadingText = this.add
    .text(
      W / 2,
      405,
      "0%",
      {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d9d1bc",
      }
    )
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
      to: 35
    },

    duration: 450,

    yoyo: true,
    repeat: -1,

    ease: "Sine.easeInOut"
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

      title.setText(
        "PREPARING EXPEDITION" +
        ".".repeat(dots)
      );
    }
  });


  // ==========================================
  // PROGRESO REAL DE PHASER
  // ==========================================

  this.load.on(
    "progress",
    (value: number) => {

      progressBar.width =
        296 * value;

      loadingText.setText(
        `${Math.floor(value * 100)}%`
      );
    }
  );


  // ==========================================
  // CUANDO TERMINA LA CARGA
  // ==========================================

  this.load.once("complete", () => {

    loadingTimer.destroy();

    compassTween.stop();

    loadingScreen.destroy(true);
  });


  // ==========================================
  // A PARTIR DE AQUÍ:
  // TUS ASSETS DE SIEMPRE
  // ==========================================


    this.load.spritesheet(
      "explorer-run",
      "assets/characters/explorer/run.png",
      {
        frameWidth: 96,
        frameHeight: 78,
      },
    );

    this.load.spritesheet(
      "explorer-idle",
      "assets/characters/explorer/idle.png",
      {
        frameWidth: 43,
        frameHeight: 78,
      },
    );

    this.load.spritesheet(
      "explorer-jump",
      "assets/characters/explorer/jump.png",
      {
        frameWidth: 61,
        frameHeight: 78,
      },
    );

    this.load.spritesheet(
      "explorer-fall",
      "assets/characters/explorer/fall.png",
      {
        frameWidth: 62,
        frameHeight: 78,
      },
    );

    this.load.spritesheet(
      "explorer-shoot",
      "assets/characters/explorer/shoot.png",
      {
        frameWidth: 83,
        frameHeight: 78,
      },
    );

    this.load.image("maya-background", "assets/worlds/maya/background.png");

    this.load.image("arrow", "assets/projectiles/arrow.png");

    this.load.image(
      "maya-platform-left",
      "assets/worlds/maya/platform-left.png",
    );

    this.load.image(
      "maya-platform-middle",
      "assets/worlds/maya/platform-middle.png",
    );

    this.load.image(
      "maya-platform-right",
      "assets/worlds/maya/platform-right.png",
    );

    this.load.spritesheet(
      "maya-guardian-walk",
      "assets/enemies/maya/stone-guardian-walk.png",
      {
        frameWidth: 65,
        frameHeight: 100,
      },
    );

    this.load.spritesheet(
      "maya-jade-mask",
      "assets/worlds/maya/jade-mask.png",
      {
        frameWidth: 86,
        frameHeight: 100,
      },
    );

    this.load.image(
      "maya-spike",
      "assets/worlds/maya/spike.png"
    );

    this.load.audio(
      "arrow-shot",
      "assets/sounds/arrow-shot.mp3"
    );

    this.load.audio(
      "arrow-impact",
      "assets/sounds/arrow-impact.mp3"
    );

    this.load.audio(
    "guardian-crumble",
    "assets/sounds/guardian-crumble.mp3"
  );

  this.load.audio(
  "jump",
  "assets/sounds/jump.wav"
);

this.load.audio(
  "player-hurt",
  "assets/sounds/player-hurt.mp3"
);

this.load.audio(
  "maya-jungle-ambience",
  "assets/sounds/maya-jungle-ambience.wav"
);
  }

  create() {
    this.input.addPointer(3);
    const world = WORLDS[this.idx];

    // Aplicar la preferencia de sonido guardada
this.sound.mute =
  localStorage.getItem("music") === "off";

  // Ambiente propio del mundo Maya
  if (world.key === "maya") {
    this.ambient = this.sound.add(
      "maya-jungle-ambience",
      {
        loop: true,
        volume: 0.20
      }
    );

    this.ambient.play();
  }

    if (!this.anims.exists("explorer-run")) {
      this.anims.create({
        key: "explorer-run",
        frames: this.anims.generateFrameNumbers("explorer-run", {
          start: 0,
          end: 7,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("explorer-idle")) {
      this.anims.create({
        key: "explorer-idle",
        frames: this.anims.generateFrameNumbers("explorer-idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    if (!this.anims.exists("explorer-jump")) {
      this.anims.create({
        key: "explorer-jump",
        frames: this.anims.generateFrameNumbers("explorer-jump", {
          start: 0,
          end: 7,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists("explorer-fall")) {
      this.anims.create({
        key: "explorer-fall",
        frames: this.anims.generateFrameNumbers("explorer-fall", {
          start: 0,
          end: 4,
        }),
        frameRate: 8,
        repeat: 0,
      });
    }

    if (!this.anims.exists("explorer-shoot")) {
      this.anims.create({
        key: "explorer-shoot",
        frames: this.anims.generateFrameNumbers("explorer-shoot", {
          start: 0,
          end: 13,
        }),
        frameRate: 16,
        repeat: 0,
      });
    }

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

    if (world.key === "maya") {
      const bg = this.add.image(0, 0, "maya-background");

      // La imagen empieza exactamente desde su esquina superior izquierda
      bg.setOrigin(0, 0);

      // Mantener proporciones y cubrir toda la altura jugable
      const scale = HUD_TOP / bg.height;
      bg.setScale(scale);

      // Parallax horizontal suave.
      // Verticalmente permanece fija.
      bg.setScrollFactor(0.12, 0);

      bg.setDepth(-10);
    }

    this.platforms = this.physics.add.staticGroup();
    const plat = (x: number, y: number, w: number) => {
      // =========================
      // COLLIDER INVISIBLE
      // =========================

      const collider = this.add.rectangle(x, y, w, 24, 0x000000, 0);

      this.physics.add.existing(collider, true);
      this.platforms.add(collider);

      // =========================
      // ARTE MAYA
      // =========================

      if (world.key === "maya") {
        const platformHeight = 55;
        const capWidth = 40;

        // IMPORTANTE:
        // superficie superior real del collider
        const visualY = y - 12;

        const middle = this.add.tileSprite(
          x,
          visualY,
          Math.max(1, w - capWidth * 2),
          platformHeight,
          "maya-platform-middle",
        );

        middle.setOrigin(0.5, 0).setDepth(2);

        const left = this.add.image(x - w / 2, visualY, "maya-platform-left");

        left
          .setOrigin(0, 0)
          .setDisplaySize(capWidth, platformHeight)
          .setDepth(3);

        const right = this.add.image(x + w / 2, visualY, "maya-platform-right");

        right
          .setOrigin(1, 0)
          .setDisplaySize(capWidth, platformHeight)
          .setDepth(3);
      }
    };
    // Long horizontal level + gaps + elevated routes.
    plat(350, 590, 700);
    plat(930, 590, 360);
    plat(1450, 590, 520);
    plat(2050, 590, 440);
    plat(2600, 590, 500);
    plat(3250, 590, 700);
    plat(650, 490, 180);
    plat(1120, 455, 170);
    plat(1650, 480, 190);
    plat(2300, 450, 180);
    plat(2860, 475, 200);
    plat(3340, 420, 180);
    this.player = this.physics.add.sprite(90, 530, "explorer-idle", 0);

    this.player.setScale(0.55);
    this.player.setCollideWorldBounds(true).setBounce(0.02);
    this.physics.add.collider(this.player, this.platforms);
    this.enemies = this.physics.add.group({ allowGravity: true });
    [520, 1040, 1510, 2170, 2730, 3190].forEach((x, i) =>
      this.spawnEnemy(x, 530, i % 2 ? 1 : -1),
    );
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
      (s, enemyObject) => {

         const arrow =
      s as Phaser.Physics.Arcade.Sprite;

    const enemy =
      enemyObject as Phaser.Physics.Arcade.Sprite;

    // Guardamos el punto exacto del impacto
    const impactX = arrow.x;
    const impactY = arrow.y;

    // Efecto piedra/chispazo
    this.arrowImpactEffect(
      impactX,
      impactY
    );

    // Impacto sonoro contra piedra
    this.sound.play("arrow-impact", {
      volume: 0.5
    });


    // La flecha desaparece
    arrow.destroy();
        // Quitar 1 HP
        const hp = enemy.getData("hp") ?? 4;
        const newHp = hp - 1;

        enemy.setData("hp", newHp);

        // Feedback provisional
        enemy.setTint(0xffffff);

        this.time.delayedCall(100, () => {
          if (enemy.active) {
            enemy.clearTint();
          }
        });

        this.drawEnemyHealth(enemy);

        if (newHp <= 0) {
          this.destroyGuardian(enemy);
        }
      },
      undefined,
      this,
    );
    // spikes / traps
    // Maya spikes / traps
[820, 1320, 1900, 2480, 3030].forEach((x) => {

  const spike = this.physics.add.staticSprite(
    x,
    560,
    "maya-spike"
  );

  // Ajusta esto según el tamaño final de tu PNG
  spike.setScale(0.45);

  // Hitbox más pequeña que la imagen
  // para que solo hagan daño las puntas
  spike.setSize(
    spike.width * 0.45,
    spike.height * 0.65
  );

  spike.setOffset(
    spike.width * 0.175,
    spike.height * 0.10
  );

  this.physics.add.overlap(
    this.player,
    spike,
    () => this.damage(),
    undefined,
    this,
  );
});
    const relic = this.physics.add.staticSprite(3480, 365, "maya-jade-mask", 0);

    relic.setScale(0.40);
    relic.setSize(35, 50);
    relic.setOffset(20, 20);

    relic.play("maya-jade-mask-glow");
    this.physics.add.overlap(
      this.player,
      relic,
      () => this.win(),
      undefined,
      this,
    );

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
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.game.events.off(
          Phaser.Core.Events.BLUR,
          this.resetControls,
          this
        );

        this.resetControls();

        // Detener el ambiente al abandonar
        // la expedición
        if (this.ambient) {
          this.ambient.stop();
          this.ambient.destroy();
          this.ambient = undefined;
        }
      }
    );
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 45);
    this.cameras.main.setDeadzone(90, 120);
    this.createHUD(world);
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
  spawnEnemy(x: number, y: number, dir: number) {
    const e = this.enemies.create(
      x,
      y,
      "maya-guardian-walk",
      0,
    ) as Phaser.Physics.Arcade.Sprite;

    // Ajustaremos esto visualmente después si hace falta
    e.setScale(0.55);
    e.setSize(38, 82);
    e.setOffset(13, 16);

    e.setVelocityX(70 * dir);
    e.setBounce(0);
    e.setCollideWorldBounds(false);

    e.setData("dir", dir);
    e.setData("originX", x);
    e.setData("hp", 4);
    e.setData("maxHp", 4);

    const healthBar = this.add.graphics();
    e.setData("healthBar", healthBar);

    this.drawEnemyHealth(e);
    
    // Empieza caminando
    e.play("maya-guardian-walk");

    // Nuestro PNG mira hacia la derecha.
    e.setFlipX(dir < 0);

  }

drawEnemyHealth(enemy: Phaser.Physics.Arcade.Sprite) {
  const bar = enemy.getData("healthBar") as Phaser.GameObjects.Graphics;

  if (!bar) return;

  const hp = enemy.getData("hp") ?? 4;
  const maxHp = enemy.getData("maxHp") ?? 4;

  const width = 34;
  const height = 5;

  const percentage = hp / maxHp;

  bar.clear();

  // Fondo
  bar.fillStyle(0x111111, 0.9);
  bar.fillRect(
    enemy.x - width / 2,
    enemy.y - 40,
    width,
    height
  );

  let color = 0x44cc44;

  if (percentage <= 0.25) {
    color = 0xff3333; // rojo
  } else if (percentage <= 0.5) {
    color = 0xffcc33; // amarillo
  }

  bar.fillStyle(color, 1);

  bar.fillRect(
    enemy.x - width / 2,
    enemy.y - 40,
    width * percentage,
    height
  );
}

arrowImpactEffect(x: number, y: number) {
  // Destello central
  const flash = this.add
    .circle(x, y, 8, 0xffe08a, 1)
    .setDepth(50);

  this.tweens.add({
    targets: flash,
    scale: 2,
    alpha: 0,
    duration: 120,
    onComplete: () => flash.destroy(),
  });

  // Pequeños fragmentos de piedra
  for (let i = 0; i < 6; i++) {
    const fragment = this.add
      .rectangle(
        x,
        y,
        Phaser.Math.Between(2, 4),
        Phaser.Math.Between(2, 4),
        0xb9a37a
      )
      .setDepth(49);

    const angle = Phaser.Math.FloatBetween(
      0,
      Math.PI * 2
    );

    const distance = Phaser.Math.Between(12, 25);

    this.tweens.add({
      targets: fragment,

      x:
        x +
        Math.cos(angle) *
          distance,

      y:
        y +
        Math.sin(angle) *
          distance,

      alpha: 0,

      duration: Phaser.Math.Between(
        150,
        250
      ),

      onComplete: () =>
        fragment.destroy(),
    });
  }
}

destroyGuardian(enemy: Phaser.Physics.Arcade.Sprite) {
  const x = enemy.x;
  const y = enemy.y;

   // Sonido de piedra desmoronándose
  this.sound.play("guardian-crumble", {
    volume: 0.65
  });

  // Eliminar la barra de vida
  const bar =
    enemy.getData("healthBar") as Phaser.GameObjects.Graphics;

  if (bar) {
    bar.destroy();
  }

  // Evitar más colisiones inmediatamente
  enemy.disableBody(true, true);

  // Crear fragmentos de piedra
  for (let i = 0; i < 10; i++) {
    const size = Phaser.Math.Between(4, 9);

    const fragment = this.add
      .rectangle(
        x + Phaser.Math.Between(-15, 15),
        y + Phaser.Math.Between(-25, 20),
        size,
        size,
        Phaser.Math.RND.pick([
          0x82745e,
          0xa08f70,
          0x665d4e,
          0x4f6654,
        ])
      )
      .setDepth(20);

    // Cada piedra sale en una dirección diferente
    const targetX =
      fragment.x + Phaser.Math.Between(-45, 45);

    const targetY =
      fragment.y + Phaser.Math.Between(25, 65);

    this.tweens.add({
      targets: fragment,

      x: targetX,
      y: targetY,

      angle: Phaser.Math.Between(-180, 180),

      alpha: 0,

      duration: Phaser.Math.Between(350, 600),

      ease: "Quad.easeIn",

      onComplete: () => {
        fragment.destroy();
      },
    });
  }
}

  createHUD(world: (typeof WORLDS)[number]) {
    const hud = this.add
      .rectangle(W / 2, (HUD_TOP + H) / 2, W, H - HUD_TOP, 0x11100d, 0.98)
      .setScrollFactor(0)
      .setDepth(100)
      .setStrokeStyle(2, world.accent);
    this.add
      .rectangle(W / 2, HUD_TOP, W, 3, world.accent)
      .setScrollFactor(0)
      .setDepth(101);
    this.hudLives = this.add
      .text(14, 635, "♥ ♥ ♥", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ff7777",
      })
      .setScrollFactor(0)
      .setDepth(102);

    const worldLabel = this.add
      .text(W / 2, 638, world.name, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#e7c66e",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive();

    let secretTaps = 0;
    let lastSecretTap = 0;

    worldLabel.on("pointerdown", () => {
      // Si tardaste más de 2 segundos,
      // comenzamos la secuencia de nuevo.
      if (this.time.now - lastSecretTap > 2000) {
        secretTaps = 0;
      }

      lastSecretTap = this.time.now;
      secretTaps++;

      if (secretTaps >= 5) {
        secretTaps = 0;
        this.toggleGodMode();
      }
    });

    this.godLabel = this.add
      .text(W / 2, 660, "DEV MODE", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#ffd700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);

    this.touchButton(
      55,
      710,
      "◀",
      () => (this.left = true),
      () => (this.left = false),
    );
    this.touchButton(
      125,
      710,
      "▶",
      () => (this.right = true),
      () => (this.right = false),
    );

    this.touchButton(
      305,
      710,
      "✦",
      () => {
        this.firing = true;
        this.fire();
      },
      () => {
        this.firing = false;
      },
    );

    this.touchButton(
      375,
      710,
      "▲",
      () => this.jump(),
      () => {},
    );
    const pause = this.add
      .text(405, 635, "Ⅱ", { fontSize: "23px", color: "#fff" })
      .setOrigin(1, 0)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(103);
    pause.on("pointerdown", () => this.pauseMenu());
    this.soundLabel = this.add
      .text(360, 637, localStorage.getItem("music") === "off" ? "×♪" : "♪", {
        fontSize: "20px",
        color: "#fff",
      })
      .setOrigin(1, 0)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(103);
    this.soundLabel.on("pointerdown", () => this.toggleSound());
    hud.setInteractive();
  }
  touchButton(
    x: number,
    y: number,
    label: string,
    down: () => void,
    up: () => void,
  ) {
    const button = this.add
      .circle(x, y, 32, 0x000000, 0.45)
      .setStrokeStyle(2, 0xffffff, 0.75)
      .setScrollFactor(0)
      .setDepth(110)
      .setInteractive();

    const text = this.txt(x, y, label, 24).setScrollFactor(0).setDepth(111);

    // El texto es puramente visual.
    // Toda la interacción pertenece al círculo.
    text.disableInteractive();

    button.on("pointerdown", (_pointer: Phaser.Input.Pointer) => {
      button.setAlpha(0.65);
      down();
    });

    button.on("pointerup", (_pointer: Phaser.Input.Pointer) => {
      button.setAlpha(1);
      up();
    });

    button.on("pointerupoutside", (_pointer: Phaser.Input.Pointer) => {
      button.setAlpha(1);
      up();
    });

    button.on("pointerout", (_pointer: Phaser.Input.Pointer) => {
      button.setAlpha(1);
      up();
    });
  }
  resetControls() {
    this.left = false;
    this.right = false;
    this.firing = false;
    if (this.player?.active) this.player.setVelocityX(0);
  }

jump() {
  if (
    this.paused ||
    !this.player.body?.blocked.down
  ) {
    return;
  }

  // El sonido se solicita inmediatamente
  this.sound.play("jump", {
    volume: 0.6
  });

  // El salto ocurre en el mismo evento
  this.player.setVelocityY(-600);
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
        volume: 0.45
      });

      const arrow = this.shots.create(
        this.player.x + this.facing * 32,
        this.player.y - 6,
        "arrow",
      ) as Phaser.Physics.Arcade.Sprite;

      arrow.setVelocityX(this.facing * 430);

      // La imagen original mira →
      // Si disparamos hacia ←, la invertimos.
      arrow.setFlipX(this.facing < 0);

      arrow.setData("born", this.time.now);
      arrow.setData("startX", arrow.x);
      arrow.setData("falling", false);
      arrow.setData("direction", this.facing);
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
    volume: 0.55
  });

  this.lives--;
  this.updateLives();

  if (this.lives <= 0) {
    this.gameOver();
    return;
  }

  this.invulnerable = true;

  this.player.setTint(0xff7777);
  this.player.setVelocity(
    -this.facing * 180,
    -260
  );

  this.time.delayedCall(1200, () => {
    if (this.player?.active) {
      this.invulnerable = false;
      this.player.clearTint();
    }
  });
}

  updateLives() {
    this.hudLives.setText(
      Array.from({ length: 3 }, (_, i) => (i < this.lives ? "♥" : "♡")).join(
        " ",
      ),
    );
  }
  update() {
    if (this.paused || this.won || !this.player?.active) return;
    let vx = 0;
    const keyA = this.input.keyboard!.addKey("A");
    const keyD = this.input.keyboard!.addKey("D");
    const moveLeft = this.left || this.cursors.left.isDown || keyA.isDown;
    const moveRight = this.right || this.cursors.right.isDown || keyD.isDown;

    if (moveLeft !== moveRight) {
      if (moveLeft) {
        vx = -250;
        this.facing = -1;
      } else {
        vx = 250;
        this.facing = 1;
      }
    }
    this.player.setVelocityX(vx);
    if (vx < 0) this.player.setFlipX(true);
    if (vx > 0) this.player.setFlipX(false);

    const onGround = this.player.body?.blocked.down;
    const velocityY = this.player.body?.velocity.y ?? 0;
    if (!this.isShooting) {
      if (!onGround && velocityY < 0) {
        if (this.player.anims.currentAnim?.key !== "explorer-jump")
          this.player.play("explorer-jump");
      } else if (!onGround && velocityY >= 0) {
        if (this.player.anims.currentAnim?.key !== "explorer-fall")
          this.player.play("explorer-fall");
      } else if (vx !== 0) {
        this.player.play("explorer-run", true);
      } else {
        this.player.play("explorer-idle", true);
      }
    }

    this.enemies?.children.iterate((o: any) => {
      if (!o?.active) return true;
      const ox = o.getData("originX");
      if (Math.abs(o.x - ox) > 115) {
        const d = o.x > ox ? -1 : 1;

        o.setVelocityX(70 * d);
        o.setData("dir", d);

        // Girar visualmente al guardián
        o.setFlipX(d < 0);
      }

      this.drawEnemyHealth(o);

      return true;
    });

    this.shots?.children.iterate((o: any) => {
  if (!o?.active) return true;

  const startX = o.getData("startX");
  const distance = Math.abs(o.x - startX);
  const direction = o.getData("direction");

  // Primer tramo: vuelo recto
  if (distance < 120) {
    o.setVelocityY(0);
  }

  // A partir de 120 px empieza a caer
  else {
    const fallDistance = distance - 120;

    // Cuanto más lejos llega, más rápido cae
    const fallSpeed = Math.min(
      80 + fallDistance * 2.5,
      600
    );

    o.setVelocityY(fallSpeed);

    // Pierde progresivamente velocidad horizontal
    const horizontalSpeed = Math.max(
      100,
      430 - fallDistance * 1.2
    );

    o.setVelocityX(
      direction * horizontalSpeed
    );

    // La punta de la flecha sigue la trayectoria
    const angle = Phaser.Math.RadToDeg(
      Math.atan2(
        fallSpeed,
        horizontalSpeed
      )
    );

    o.setAngle(
      direction < 0
        ? -angle
        : angle
    );
  }

  // Destruirla si lleva demasiado tiempo volando
  if (this.time.now - o.getData("born") > 2500) {
    o.destroy();
  }

  return true;
});

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
    this.godMode = !this.godMode;

    if (this.godLabel) {
      this.godLabel.setVisible(this.godMode);
    }

    console.log(this.godMode ? "GOD MODE ACTIVATED" : "GOD MODE DEACTIVATED");
  }

  toggleSound() {
    const off = localStorage.getItem("music") === "off";
    localStorage.setItem("music", off ? "on" : "off");
    this.soundLabel.setText(off ? "♪" : "×♪");
    this.sound.mute = !off;
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