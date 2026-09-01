import Phaser from "phaser";

const GUARDIAN_POSITIONS = [
  520,
  1040,
  1510,
  2170,
  2730,
  3190,
];

const GUARDIAN_HP = 4;
const GUARDIAN_SPEED = 70;
const GUARDIAN_PATROL_DISTANCE = 115;

export function createMayaGuardians(
  scene: Phaser.Scene,
  enemies: Phaser.Physics.Arcade.Group
): void {
  GUARDIAN_POSITIONS.forEach((x, index) => {
    spawnMayaGuardian(
      scene,
      enemies,
      x,
      530,
      index % 2 ? 1 : -1
    );
  });
}

function spawnMayaGuardian(
  scene: Phaser.Scene,
  enemies: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  direction: number
): void {
  const guardian = enemies.create(
    x,
    y,
    "maya-guardian-walk",
    0
  ) as Phaser.Physics.Arcade.Sprite;

  guardian.setScale(0.55);

  guardian.setSize(
    38,
    82
  );

  guardian.setOffset(
    13,
    16
  );

  guardian.setVelocityX(
    GUARDIAN_SPEED * direction
  );

  guardian.setBounce(0);
  guardian.setCollideWorldBounds(false);

  guardian.setData(
    "dir",
    direction
  );

  guardian.setData(
    "originX",
    x
  );

  guardian.setData(
    "hp",
    GUARDIAN_HP
  );

  guardian.setData(
    "maxHp",
    GUARDIAN_HP
  );

  const healthBar =
    scene.add.graphics();

  guardian.setData(
    "healthBar",
    healthBar
  );

  drawMayaGuardianHealth(
    guardian
  );

  guardian.play(
    "maya-guardian-walk"
  );

  guardian.setFlipX(
    direction < 0
  );
}

export function updateMayaGuardians(
  enemies: Phaser.Physics.Arcade.Group
): void {
  enemies.children.iterate(
    (object: Phaser.GameObjects.GameObject) => {
      const guardian =
        object as Phaser.Physics.Arcade.Sprite;

      if (!guardian?.active) {
        return true;
      }

      const originX =
        guardian.getData("originX");

      if (
        Math.abs(
          guardian.x - originX
        ) > GUARDIAN_PATROL_DISTANCE
      ) {
        const direction =
          guardian.x > originX
            ? -1
            : 1;

        guardian.setVelocityX(
          GUARDIAN_SPEED * direction
        );

        guardian.setData(
          "dir",
          direction
        );

        guardian.setFlipX(
          direction < 0
        );
      }

      drawMayaGuardianHealth(
        guardian
      );

      return true;
    }
  );
}

export function drawMayaGuardianHealth(
  guardian: Phaser.Physics.Arcade.Sprite
): void {
  const bar =
    guardian.getData(
      "healthBar"
    ) as Phaser.GameObjects.Graphics;

  if (!bar) return;

  const hp =
    guardian.getData("hp") ??
    GUARDIAN_HP;

  const maxHp =
    guardian.getData("maxHp") ??
    GUARDIAN_HP;

  const width = 34;
  const height = 5;

  const percentage =
    hp / maxHp;

  bar.clear();

  // Fondo de la barra
  bar.fillStyle(
    0x111111,
    0.9
  );

  bar.fillRect(
    guardian.x - width / 2,
    guardian.y - 40,
    width,
    height
  );

  let color = 0x44cc44;

  if (percentage <= 0.25) {
    color = 0xff3333;
  } else if (
    percentage <= 0.5
  ) {
    color = 0xffcc33;
  }

  bar.fillStyle(
    color,
    1
  );

  bar.fillRect(
    guardian.x - width / 2,
    guardian.y - 40,
    width * percentage,
    height
  );
}

export function destroyMayaGuardian(
  scene: Phaser.Scene,
  guardian: Phaser.Physics.Arcade.Sprite
): void {
  const x = guardian.x;
  const y = guardian.y;

  scene.sound.play(
    "guardian-crumble",
    {
      volume: 0.65,
    }
  );

  const bar =
    guardian.getData(
      "healthBar"
    ) as Phaser.GameObjects.Graphics;

  if (bar) {
    bar.destroy();
  }

  guardian.disableBody(
    true,
    true
  );

  // Fragmentos de piedra
  for (let i = 0; i < 10; i++) {
    const size =
      Phaser.Math.Between(
        4,
        9
      );

    const fragment =
      scene.add
        .rectangle(
          x +
            Phaser.Math.Between(
              -15,
              15
            ),
          y +
            Phaser.Math.Between(
              -25,
              20
            ),
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

    const targetX =
      fragment.x +
      Phaser.Math.Between(
        -45,
        45
      );

    const targetY =
      fragment.y +
      Phaser.Math.Between(
        25,
        65
      );

    scene.tweens.add({
      targets: fragment,

      x: targetX,
      y: targetY,

      angle:
        Phaser.Math.Between(
          -180,
          180
        ),

      alpha: 0,

      duration:
        Phaser.Math.Between(
          350,
          600
        ),

      ease: "Quad.easeIn",

      onComplete: () => {
        fragment.destroy();
      },
    });
  }
}