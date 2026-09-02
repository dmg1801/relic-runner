import Phaser from "phaser";
import { W } from "../config/constants";

export type HUDOptions = {
  scene: Phaser.Scene;

  worldName: string;
  accent: number;
  lives: number;

  godMode: boolean;

  onLeftDown: () => void;
  onLeftUp: () => void;

  onRightDown: () => void;
  onRightUp: () => void;

  onJump: () => void;

  onFireDown: () => void;
  onFireUp: () => void;

  onPause: () => void;
  onToggleSound: () => void;

  onGodModeToggle: () => void;
};

export type HUDController = {
  livesText: Phaser.GameObjects.Text;
  godLabel: Phaser.GameObjects.Text;

  updateLives: (lives: number) => void;
  setGodMode: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
};


// ==========================================
// CREAR HUD
// ==========================================

export function createHUD(
  options: HUDOptions
): HUDController {
  const {
    scene,
    worldName,
    accent,
    lives,
    godMode,

    onLeftDown,
    onLeftUp,

    onRightDown,
    onRightUp,

    onJump,

    onFireDown,
    onFireUp,

    onPause,
    onToggleSound,

    onGodModeToggle,
  } = options;


  // ========================================
  // VIDAS
  // ========================================

  const livesText = scene.add
    .text(
      18,
      640,
      getLivesText(lives),
      {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
      }
    )
    .setScrollFactor(0)
    .setDepth(100);


  // ========================================
  // NOMBRE DEL MUNDO
  // ========================================

  const worldText = scene.add
    .text(
      W / 2,
      640,
      worldName,
      {
        fontFamily: "Arial",
        fontSize: "18px",
        color: colorToHex(accent),
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setInteractive();


  // ========================================
  // GOD MODE
  // ========================================

  const godLabel = scene.add
    .text(
      W / 2,
      660,
      "DEV MODE",
      {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#ffd76a",
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setVisible(godMode);


  // ========================================
  // GOD MODE SECRETO:
  // 5 TOQUES EN EL NOMBRE DEL MUNDO
  // ========================================

  let godTaps = 0;
  let lastGodTap = 0;

  worldText.on(
    "pointerdown",
    () => {
      const now = scene.time.now;

      if (
        now - lastGodTap >
        2000
      ) {
        godTaps = 0;
      }

      lastGodTap = now;
      godTaps++;

      if (godTaps >= 5) {
        godTaps = 0;
        onGodModeToggle();
      }
    }
  );


  // ========================================
  // CONTROLES
  // ========================================

  createTouchButton(
    scene,
    55,
    720,
    "◀",
    onLeftDown,
    onLeftUp
  );

  createTouchButton(
    scene,
    125,
    720,
    "▶",
    onRightDown,
    onRightUp
  );

  createTouchButton(
    scene,
    295,
    720,
    "✦",
    onFireDown,
    onFireUp
  );

  createTouchButton(
    scene,
    365,
    720,
    "▲",
    onJump
  );


  // ========================================
  // PAUSA
  // ========================================

  const pauseButton = scene.add
    .text(
      W - 70,
      650,
      "Ⅱ",
      {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setInteractive({
      useHandCursor: true,
    });

  pauseButton.on(
    "pointerdown",
    onPause
  );


  // ========================================
  // SONIDO
  // ========================================

  const soundEnabled =
  localStorage.getItem("music") !== "off";

const soundButton = scene.add
  .text(
    W - 30,
    650,
    soundEnabled ? "♪" : "×♪",
    {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffffff",
    }
  )
  .setOrigin(0.5)
  .setScrollFactor(0)
  .setDepth(100)
  .setInteractive({
    useHandCursor: true,
  });

soundButton.on(
  "pointerdown",
  onToggleSound
);

  // ========================================
  // API DEL HUD
  // ========================================

  return {
    livesText,
    godLabel,

    updateLives: (
      newLives: number
    ) => {
      livesText.setText(
        getLivesText(newLives)
      );
    },

    setGodMode: (
      enabled: boolean
    ) => {
      godLabel.setVisible(
        enabled
      );
    },

    setSoundEnabled: (
  enabled: boolean
) => {
  soundButton.setText(
    enabled ? "♪" : "×♪"
  );
},
  };
}


// ==========================================
// BOTÓN TÁCTIL
// ==========================================

function createTouchButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onDown: () => void,
  onUp?: () => void
): Phaser.GameObjects.Text {
  const button = scene.add
    .text(
      x,
      y,
      label,
      {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#ffffff",
        backgroundColor:
          "rgba(0,0,0,0.35)",
        padding: {
          x: 14,
          y: 8,
        },
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setInteractive({
      useHandCursor: true,
    });

  button.on(
    "pointerdown",
    onDown
  );

  if (onUp) {
    button.on(
      "pointerup",
      onUp
    );

    button.on(
      "pointerupoutside",
      onUp
    );

    button.on(
      "pointerout",
      onUp
    );
  }

  return button;
}


// ==========================================
// HELPERS
// ==========================================

function getLivesText(
  lives: number
): string {
  return "♥ ".repeat(
    Math.max(0, lives)
  ).trim();
}


function colorToHex(
  color: number
): string {
  return `#${color
    .toString(16)
    .padStart(6, "0")}`;
}