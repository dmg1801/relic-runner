import Phaser from "phaser";

type WorldKey = "maya" | "rome" | "egypt" | "china";
type HeroKey = "explorer" | "adventurer";
const W = 432,
  H = 768,
  HUD_TOP = 620,
  WORLD_W = 3600;
const WORLDS: {
  key: WorldKey;
  name: string;
  relic: string;
  bg: number;
  accent: number;
  ground: number;
}[] = [
  {
    key: "maya",
    name: "MAYA",
    relic: "Jade Mask",
    bg: 0x183d2b,
    accent: 0xd6b85a,
    ground: 0x30291d,
  },
  {
    key: "rome",
    name: "ROME",
    relic: "Imperial Coin",
    bg: 0x51362d,
    accent: 0xd8c5a0,
    ground: 0x45382f,
  },
  {
    key: "egypt",
    name: "EGYPT",
    relic: "Scarab Amulet",
    bg: 0x8c612d,
    accent: 0x45b8b0,
    ground: 0x5c4025,
  },
  {
    key: "china",
    name: "CHINA",
    relic: "Ritual Jade Bi",
    bg: 0x542126,
    accent: 0xe0b84b,
    ground: 0x3a2522,
  },
];
const getNum = (k: string, d = 0) => Number(localStorage.getItem(k) ?? d);
const setNum = (k: string, v: number) => localStorage.setItem(k, String(v));
const getHero = () => (localStorage.getItem("hero") as HeroKey) || "explorer";

class Base extends Phaser.Scene {
  txt(x: number, y: number, s: string, size = 24, color = "#fff") {
    return this.add
      .text(x, y, s, {
        fontFamily: "monospace",
        fontSize: `${size}px`,
        color,
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
  }
  button(x: number, y: number, label: string, cb: () => void, w = 280) {
    const r = this.add
      .rectangle(x, y, w, 54, 0x241d16)
      .setStrokeStyle(3, 0xd2ad63)
      .setInteractive({ useHandCursor: true });
    const t = this.txt(x, y, label, 20);
    r.on("pointerdown", cb);
    return [r, t];
  }
}
class Menu extends Base {
  constructor() {
    super("Menu");
  }
  create() {
    this.cameras.main.setBackgroundColor("#10100c");
    this.txt(W / 2, 105, "RELIC RUNNER", 38, "#e7c66e");
    this.txt(W / 2, 150, "ARCHAEOLOGICAL ADVENTURE", 13, "#d9d1bc");
    this.button(W / 2, 255, "START EXPEDITION", () =>
      this.scene.start("Select"),
    );
    this.button(W / 2, 325, "MUSEUM", () => this.scene.start("Museum"));
    this.button(W / 2, 395, "SETTINGS", () => this.scene.start("Settings"));
    this.txt(W / 2, 690, "V0.2 • HORIZONTAL PROTOTYPE", 12, "#8d887d");
  }
}
class Select extends Base {
  constructor() {
    super("Select");
  }
  create() {
    this.cameras.main.setBackgroundColor("#17130f");
    this.txt(W / 2, 80, "CHOOSE EXPLORER", 27, "#e7c66e");
    const make = (x: number, key: HeroKey, label: string, col: number) => {
      const box = this.add
        .rectangle(x, 270, 160, 250, 0x24211c)
        .setStrokeStyle(3, col)
        .setInteractive();
      this.add.rectangle(x, 245, 60, 105, col);
      this.add.circle(x, 180, 30, col);
      this.txt(x, 355, label, 17);
      this.txt(
        x,
        390,
        key === "explorer" ? "SUNBOLT" : "MOON BOW",
        11,
        "#e7c66e",
      );
      box.on("pointerdown", () => {
        localStorage.setItem("hero", key);
        this.scene.start("Worlds");
      });
    };
    make(115, "explorer", "EXPLORER", 0x3d87c7);
    make(317, "adventurer", "ADVENTURER", 0xb94e62);
    this.button(W / 2, 660, "← BACK", () => this.scene.start("Menu"), 180);
  }
}
class Worlds extends Base {
  constructor() {
    super("Worlds");
  }
  create() {
    this.cameras.main.setBackgroundColor("#11100d");
    this.txt(W / 2, 65, "EXPEDITION MAP", 28, "#e7c66e");
    const unlocked = Math.max(1, getNum("unlocked", 1));
    WORLDS.forEach((w, i) => {
      const y = 155 + i * 115,
        ok = i < unlocked;
      const r = this.add
        .rectangle(W / 2, y, 330, 82, ok ? w.bg : 0x222222)
        .setStrokeStyle(3, ok ? w.accent : 0x555555);
      this.txt(W / 2, y - 10, `${i + 1}. ${w.name}`, 21, ok ? "#fff" : "#777");
      this.txt(
        W / 2,
        y + 20,
        ok ? "EXPLORE" : "LOCKED",
        11,
        ok ? "#e7c66e" : "#666",
      );
      if (ok)
        r.setInteractive().on("pointerdown", () =>
          this.scene.start("Game", { idx: i }),
        );
    });
    this.button(W / 2, 690, "← MENU", () => this.scene.start("Menu"), 180);
  }
}
class Game extends Base {
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
  isShooting = false;
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
  }
  preload() {
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
  }
  create() {
    this.input.addPointer(3);
    const world = WORLDS[this.idx];
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

    this.cameras.main.setBackgroundColor(world.bg);
    this.physics.world.setBounds(0, 0, WORLD_W, HUD_TOP);
    this.makeTextures(world);
    // Placeholder background layers. Replace these rectangles with tileSprites/images in public/assets/worlds/<world>/.
    this.add.rectangle(WORLD_W / 2, 180, WORLD_W, 360, world.bg).setDepth(-10);
    for (let x = 200; x < WORLD_W; x += 500)
      this.add
        .triangle(x, 400, 0, 160, 130, 0, 260, 160, world.accent, 0.1)
        .setDepth(-9);
    this.platforms = this.physics.add.staticGroup();
    const plat = (x: number, y: number, w: number) => {
      const r = this.add
        .rectangle(x, y, w, 24, world.ground)
        .setStrokeStyle(2, world.accent);
      this.physics.add.existing(r, true);
      this.platforms.add(r);
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
      (s, e) => {
        s.destroy();
        e.destroy();
      },
      undefined,
      this,
    );
    // spikes / traps
    [820, 1320, 1900, 2480, 3030].forEach((x) => {
      const spike = this.physics.add.staticSprite(x, 557, "spike");
      this.physics.add.overlap(
        this.player,
        spike,
        () => this.damage(),
        undefined,
        this,
      );
    });
    const relic = this.physics.add.staticSprite(3480, 365, "relic");
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
    this.input.keyboard!.on("keydown-SPACE", () => this.jump());
    this.input.keyboard!.on("keydown-F", () => this.fire());
    this.input.keyboard!.on("keydown-ESC", () => this.pauseMenu());

    this.game.events.on(Phaser.Core.Events.BLUR, this.resetControls, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.resetControls, this);
      this.resetControls();
    });
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 45);
    this.cameras.main.setDeadzone(90, 120);
    this.createHUD(world);
  }
  makeTextures(world: (typeof WORLDS)[number]) {
    ["hero", "relic", "enemy", "shot", "spike"].forEach((k) => {
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
    g.fillStyle(0xa63832);
    g.fillRect(0, 0, 30, 34);
    g.generateTexture("enemy", 30, 34);
    g.clear();
    g.fillStyle(0xffe06b);
    g.fillCircle(6, 6, 6);
    g.generateTexture("shot", 12, 12);
    g.clear();
    g.fillStyle(0xd7d7d7);
    g.fillTriangle(0, 22, 12, 0, 24, 22);
    g.generateTexture("spike", 24, 22);
    g.destroy();
  }
  spawnEnemy(x: number, y: number, dir: number) {
    const e = this.enemies.create(
      x,
      y,
      "enemy",
    ) as Phaser.Physics.Arcade.Sprite;
    e.setVelocityX(70 * dir)
      .setBounce(1, 0)
      .setCollideWorldBounds(false);
    e.setData("dir", dir);
    e.setData("originX", x);
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
    this.add
      .text(W / 2, 638, world.name, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#e7c66e",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);
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
    if (!this.paused && this.player.body?.blocked.down)
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

    // Animación del arco
    this.player.play("explorer-shoot", true);

    // Crear la flecha/proyectil
    const s = this.shots.create(
      this.player.x + this.facing * 24,
      this.player.y - 4,
      "shot",
    ) as Phaser.Physics.Arcade.Sprite;

    s.setVelocityX(this.facing * 430);
    s.setData("born", this.time.now);

    // Cuando termina SHOOT, devolver el control
    // al sistema IDLE / RUN / JUMP / FALL
    this.player.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "explorer-shoot",
      () => {
        this.isShooting = false;
      },
    );
  }
  damage() {
    if (this.invulnerable || this.won) return;
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
      if (moveLeft) { vx = -250; this.facing = -1; }
      else { vx = 250; this.facing = 1; }
    }
    this.player.setVelocityX(vx);
    if (vx < 0) this.player.setFlipX(true);
    if (vx > 0) this.player.setFlipX(false);

    const onGround = this.player.body?.blocked.down;
    const velocityY = this.player.body?.velocity.y ?? 0;
    if (!this.isShooting) {
      if (!onGround && velocityY < 0) {
        if (this.player.anims.currentAnim?.key !== "explorer-jump") this.player.play("explorer-jump");
      } else if (!onGround && velocityY >= 0) {
        if (this.player.anims.currentAnim?.key !== "explorer-fall") this.player.play("explorer-fall");
      } else if (vx !== 0) {
        this.player.play("explorer-run", true);
      } else {
        this.player.play("explorer-idle", true);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.jump();
    this.enemies?.children.iterate((o: any) => {
      if (!o?.active) return true;
      const ox = o.getData("originX");
      if (Math.abs(o.x - ox) > 115) {
        const d = o.x > ox ? -1 : 1;
        o.setVelocityX(70 * d);
      }
      return true;
    });
    this.shots?.children.iterate((o: any) => {
      if (o?.active && this.time.now - o.getData("born") > 1600) o.destroy();
      return true;
    });
    if (this.player.y > HUD_TOP - 15) this.damage();
    if (this.firing) {
      this.fire();
    }
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
class Museum extends Base {
  constructor() {
    super("Museum");
  }
  create() {
    this.cameras.main.setBackgroundColor("#16120e");
    this.txt(W / 2, 65, "THE MUSEUM", 31, "#e7c66e");
    this.txt(W / 2, 100, "Recovered antiquities", 13, "#aaa");
    WORLDS.forEach((w, i) => {
      const y = 175 + i * 105,
        got = localStorage.getItem(`relic_${w.key}`) === "1";
      this.add
        .rectangle(W / 2, y, 340, 78, got ? 0x2b241c : 0x1c1b19)
        .setStrokeStyle(2, got ? w.accent : 0x444);
      this.txt(85, y, got ? "◆" : "?", 28, got ? "#e7c66e" : "#555");
      this.add.text(125, y - 22, got ? w.relic : "Unknown relic", {
        fontFamily: "monospace",
        fontSize: "17px",
        color: got ? "#fff" : "#666",
      });
      this.add.text(
        125,
        y + 7,
        got ? `Recovered in ${w.name}` : "Complete expedition to discover",
        { fontFamily: "monospace", fontSize: "11px", color: "#999" },
      );
    });
    this.button(W / 2, 680, "← MENU", () => this.scene.start("Menu"), 180);
  }
}
class Settings extends Base {
  constructor() {
    super("Settings");
  }
  create() {
    this.cameras.main.setBackgroundColor("#12110e");
    this.txt(W / 2, 100, "SETTINGS", 30, "#e7c66e");
    let music = localStorage.getItem("music") !== "off";
    const label = this.txt(W / 2, 260, `MUSIC: ${music ? "ON" : "OFF"}`, 21);
    this.add
      .rectangle(W / 2, 260, 290, 65, 0, 0)
      .setInteractive()
      .on("pointerdown", () => {
        music = !music;
        localStorage.setItem("music", music ? "on" : "off");
        label.setText(`MUSIC: ${music ? "ON" : "OFF"}`);
      });
    this.txt(W / 2, 340, "PC: ← → / A D • SPACE • F", 13, "#aaa");
    this.txt(W / 2, 370, "Mobile: ◀ ▶ • ✦ attack • ▲ jump", 13, "#aaa");
    this.button(
      W / 2,
      600,
      "RESET PROGRESS",
      () => {
        [
          "unlocked",
          "relic_maya",
          "relic_rome",
          "relic_egypt",
          "relic_china",
        ].forEach((k) => localStorage.removeItem(k));
        this.scene.restart();
      },
      260,
    );
    this.button(W / 2, 680, "← MENU", () => this.scene.start("Menu"), 180);
  }
}
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: W,
  height: H,
  pixelArt: true,
  backgroundColor: "#000",
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 980 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Menu, Select, Worlds, Game, Museum, Settings],
});
