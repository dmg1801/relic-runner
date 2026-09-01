import Phaser from "phaser";
import { HUD_TOP } from "../../config/constants";

type MayaLevelOptions = {
  scene: Phaser.Scene;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  player: Phaser.Physics.Arcade.Sprite;
  onDamage: () => void;
  onWin: () => void;
};

export function createMayaLevel({
  scene,
  platforms,
  player,
  onDamage,
  onWin,
}: MayaLevelOptions): void {

  // ==========================================
  // FONDO MAYA
  // ==========================================

  const bg = scene.add.image(
    0,
    0,
    "maya-background"
  );

  bg.setOrigin(0, 0);

  const scale = HUD_TOP / bg.height;
  bg.setScale(scale);

  bg.setScrollFactor(0.12, 0);
  bg.setDepth(-10);


  // ==========================================
  // PLATAFORMAS
  // ==========================================

  const plat = (
    x: number,
    y: number,
    width: number
  ) => {

    // Collider invisible
    const collider = scene.add.rectangle(
      x,
      y,
      width,
      24,
      0x000000,
      0
    );

    scene.physics.add.existing(
      collider,
      true
    );

    platforms.add(collider);


    // Arte de la plataforma
    const platformHeight = 55;
    const capWidth = 40;

    const visualY = y - 12;

    const middle = scene.add.tileSprite(
      x,
      visualY,
      Math.max(
        1,
        width - capWidth * 2
      ),
      platformHeight,
      "maya-platform-middle"
    );

    middle
      .setOrigin(0.5, 0)
      .setDepth(2);

    const left = scene.add.image(
      x - width / 2,
      visualY,
      "maya-platform-left"
    );

    left
      .setOrigin(0, 0)
      .setDisplaySize(
        capWidth,
        platformHeight
      )
      .setDepth(3);

    const right = scene.add.image(
      x + width / 2,
      visualY,
      "maya-platform-right"
    );

    right
      .setOrigin(1, 0)
      .setDisplaySize(
        capWidth,
        platformHeight
      )
      .setDepth(3);
  };


  // ==========================================
  // DISEÑO DEL NIVEL
  // ==========================================

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


  // ==========================================
  // TRAMPAS
  // ==========================================

  [
    820,
    1320,
    1900,
    2480,
    3030,
  ].forEach((x) => {

    const spike =
      scene.physics.add.staticSprite(
        x,
        560,
        "maya-spike"
      );

    spike.setScale(0.45);

    spike.setSize(
      spike.width * 0.45,
      spike.height * 0.65
    );

    spike.setOffset(
      spike.width * 0.175,
      spike.height * 0.10
    );

    scene.physics.add.overlap(
      player,
      spike,
      onDamage
    );
  });


  // ==========================================
  // RELIQUIA: MÁSCARA DE JADE
  // ==========================================

  const relic =
    scene.physics.add.staticSprite(
      3480,
      365,
      "maya-jade-mask",
      0
    );

  relic.setScale(0.40);

  relic.setSize(
    35,
    50
  );

  relic.setOffset(
    20,
    20
  );

  relic.play(
    "maya-jade-mask-glow"
  );

  scene.physics.add.overlap(
    player,
    relic,
    onWin
  );
}