import { BaseScene } from "./BaseScene";
import { W } from "../config/constants";
import type { HeroKey } from "../types/game";

export class SelectScene extends BaseScene {

  constructor() {
    super("Select");
  }


  // ==========================================
  // ASSETS
  // ==========================================

  preload() {
    this.load.image(
      "explorer-portrait",
      "assets/characters/explorer/portrait.png"
    );

    this.load.image(
      "adventurer-portrait",
      "assets/characters/adventurer/portrait.png"
    );
  }


  // ==========================================
  // CREATE
  // ==========================================

  create() {
    this.cameras.main.setBackgroundColor(
      "#17130f"
    );

    this.txt(
      W / 2,
      80,
      "CHOOSE EXPLORER",
      27,
      "#e7c66e"
    );


    // ========================================
    // CREAR PERSONAJE SELECCIONABLE
    // ========================================

    const make = (
      x: number,
      key: HeroKey,
      label: string
    ) => {

      const portraitKey =
        key === "explorer"
          ? "explorer-portrait"
          : "adventurer-portrait";


      // Imagen real del personaje
      const portrait = this.add
        .image(
          x,
          220,
          portraitKey
        )
        .setOrigin(0.5)
        .setDisplaySize(
          105,
          150
        )
        .setInteractive({
          useHandCursor: true,
        });


      // Nombre
      this.txt(
        x,
        355,
        label,
        17
      );


      // Arma
      this.txt(
        x,
        390,
        key === "explorer"
          ? "SUNBOLT"
          : "MOON BOW",
        11,
        "#e7c66e"
      );


      // Seleccionar personaje
      portrait.on(
        "pointerdown",
        () => {
          localStorage.setItem(
            "hero",
            key
          );

          this.scene.start(
            "Worlds"
          );
        }
      );
    };


    // ========================================
    // PERSONAJES
    // ========================================

    make(
      115,
      "explorer",
      "EXPLORER"
    );

    make(
      317,
      "adventurer",
      "ADVENTURER"
    );


    // ========================================
    // VOLVER
    // ========================================

    this.button(
      W / 2,
      660,
      "← BACK",
      () =>
        this.scene.start("Menu"),
      180
    );
  }
}