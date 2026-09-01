import Phaser from "phaser";

// ==========================================
// ASSETS DE COMBATE
// ==========================================

export function preloadCombatAssets(
  scene: Phaser.Scene
): void {
  scene.load.image(
    "arrow",
    "assets/projectiles/arrow.png"
  );

  scene.load.audio(
    "arrow-shot",
    "assets/sounds/arrow-shot.mp3"
  );

  scene.load.audio(
    "arrow-impact",
    "assets/sounds/arrow-impact.mp3"
  );
}


// ==========================================
// CREAR FLECHA
// ==========================================

export function createArrow(
  shots: Phaser.Physics.Arcade.Group,
  player: Phaser.Physics.Arcade.Sprite,
  facing: number,
  timeNow: number
): Phaser.Physics.Arcade.Sprite {
  const arrow = shots.create(
    player.x + facing * 32,
    player.y - 6,
    "arrow"
  ) as Phaser.Physics.Arcade.Sprite;

  arrow.setVelocityX(
    facing * 430
  );

  // El PNG original mira hacia la derecha.
  arrow.setFlipX(
    facing < 0
  );

  // Datos necesarios para calcular
  // la trayectoria durante update().
  arrow.setData(
    "born",
    timeNow
  );

  arrow.setData(
    "startX",
    arrow.x
  );

  arrow.setData(
    "falling",
    false
  );

  arrow.setData(
    "direction",
    facing
  );

  return arrow;
}


// ==========================================
// ACTUALIZAR TRAYECTORIA
// ==========================================

export function updateArrows(
  shots: Phaser.Physics.Arcade.Group,
  timeNow: number
): void {
  shots.children.iterate(
    (object: Phaser.GameObjects.GameObject) => {
      const arrow =
        object as Phaser.Physics.Arcade.Sprite;

      if (!arrow?.active) {
        return true;
      }

      const startX =
        arrow.getData("startX");

      const distance =
        Math.abs(
          arrow.x - startX
        );

      const direction =
        arrow.getData("direction");

      // ======================================
      // PRIMER TRAMO: VUELO RECTO
      // ======================================

      if (distance < 120) {
        arrow.setVelocityY(0);
      }

      // ======================================
      // DESPUÉS DE 120 PX EMPIEZA A CAER
      // ======================================

      else {
        const fallDistance =
          distance - 120;

        // Cuanto más lejos llega,
        // más rápido cae.
        const fallSpeed =
          Math.min(
            80 +
              fallDistance * 2.5,
            600
          );

        arrow.setVelocityY(
          fallSpeed
        );

        // Va perdiendo velocidad horizontal.
        const horizontalSpeed =
          Math.max(
            100,
            430 -
              fallDistance * 1.2
          );

        arrow.setVelocityX(
          direction *
            horizontalSpeed
        );

        // La punta sigue visualmente
        // la trayectoria de la flecha.
        const angle =
          Phaser.Math.RadToDeg(
            Math.atan2(
              fallSpeed,
              horizontalSpeed
            )
          );

        arrow.setAngle(
          direction < 0
            ? -angle
            : angle
        );
      }

      // ======================================
      // DESTRUIR FLECHA VIEJA
      // ======================================

      if (
        timeNow -
          arrow.getData("born") >
        2500
      ) {
        arrow.destroy();
      }

      return true;
    }
  );
}


// ==========================================
// EFECTO DE IMPACTO
// ==========================================

export function createArrowImpactEffect(
  scene: Phaser.Scene,
  x: number,
  y: number
): void {
  // Destello central
  const flash = scene.add
    .circle(
      x,
      y,
      8,
      0xffe08a,
      1
    )
    .setDepth(50);

  scene.tweens.add({
    targets: flash,
    scale: 2,
    alpha: 0,
    duration: 120,

    onComplete: () => {
      flash.destroy();
    },
  });

  // Fragmentos pequeños
  for (let i = 0; i < 6; i++) {
    const fragment =
      scene.add
        .rectangle(
          x,
          y,
          Phaser.Math.Between(
            2,
            4
          ),
          Phaser.Math.Between(
            2,
            4
          ),
          0xb9a37a
        )
        .setDepth(49);

    const angle =
      Phaser.Math.FloatBetween(
        0,
        Math.PI * 2
      );

    const distance =
      Phaser.Math.Between(
        12,
        25
      );

    scene.tweens.add({
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

      duration:
        Phaser.Math.Between(
          150,
          250
        ),

      onComplete: () => {
        fragment.destroy();
      },
    });
  }
}