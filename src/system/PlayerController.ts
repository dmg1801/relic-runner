import Phaser from "phaser";
import type { HeroKey } from "../types/game";

export class PlayerController {
  private facing = 1;

  constructor(
    private player: Phaser.Physics.Arcade.Sprite,
    private hero: HeroKey
  ) {}

  // ==========================================
  // MOVIMIENTO
  // ==========================================

  move(
    moveLeft: boolean,
    moveRight: boolean
  ): number {
    let velocityX = 0;

    if (moveLeft !== moveRight) {
      if (moveLeft) {
        velocityX = -250;
        this.facing = -1;
      } else {
        velocityX = 250;
        this.facing = 1;
      }
    }

    this.player.setVelocityX(velocityX);

    if (velocityX < 0) {
      this.player.setFlipX(true);
    }

    if (velocityX > 0) {
      this.player.setFlipX(false);
    }

    return velocityX;
  }

  // ==========================================
  // SALTO
  // ==========================================

  jump(): boolean {
    if (!this.player.body?.blocked.down) {
      return false;
    }

    this.player.setVelocityY(-600);
    return true;
  }

  // ==========================================
  // ANIMACIONES DE MOVIMIENTO
  // ==========================================

  updateAnimation(
    velocityX: number,
    isShooting: boolean
  ): void {
    // Exploradora: IDLE, RUN y JUMP.
    if (this.hero === "adventurer") {
      if (isShooting) {
        return;
      }

      const onGround =
        this.player.body?.blocked.down;

      const velocityY =
        this.player.body?.velocity.y ?? 0;

      if (!onGround && velocityY < 0) {
        if (
          this.player.anims.currentAnim?.key !==
          "adventurer-jump"
        ) {
          this.player.play(
            "adventurer-jump"
          );
        }

        return;
      }

      // Aún no tenemos FALL:
      // durante la caída conservamos el último frame de JUMP.
      if (!onGround && velocityY >= 0) {
        return;
      }

      if (velocityX !== 0) {
        this.player.play(
          "adventurer-run",
          true
        );
      } else {
        this.player.play(
          "adventurer-idle",
          true
        );
      }

      return;
    }

    if (isShooting) {
      return;
    }

    const onGround =
      this.player.body?.blocked.down;

    const velocityY =
      this.player.body?.velocity.y ?? 0;

    if (!onGround && velocityY < 0) {
      if (
        this.player.anims.currentAnim?.key !==
        "explorer-jump"
      ) {
        this.player.play("explorer-jump");
      }
      return;
    }

    if (!onGround && velocityY >= 0) {
      if (
        this.player.anims.currentAnim?.key !==
        "explorer-fall"
      ) {
        this.player.play("explorer-fall");
      }
      return;
    }

    if (velocityX !== 0) {
      this.player.play(
        "explorer-run",
        true
      );
      return;
    }

    this.player.play(
      "explorer-idle",
      true
    );
  }

  // ==========================================
  // DIRECCIÓN
  // ==========================================

  getFacing(): number {
    return this.facing;
  }

  setFacing(
    direction: number
  ): void {
    this.facing =
      direction < 0 ? -1 : 1;
  }

  // ==========================================
  // DETENER MOVIMIENTO
  // ==========================================

  stop(): void {
    if (this.player.active) {
      this.player.setVelocityX(0);
    }
  }
}
