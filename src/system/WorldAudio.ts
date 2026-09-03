import Phaser from "phaser";
import type { WorldKey } from "../types/game";

type WorldAudioConfig = {
  key: string;
  volume: number;
};

const WORLD_AUDIO: Partial<
  Record<WorldKey, WorldAudioConfig>
> = {
  maya: {
    key: "maya-jungle-ambience",
    volume: 0.2,
  },

  // Los añadiremos cuando existan:
  //
  // rome: {
  //   key: "rome-ambience",
  //   volume: 0.2,
  // },
  //
  // egypt: {
  //   key: "egypt-ambience",
  //   volume: 0.2,
  // },
  //
  // china: {
  //   key: "china-ambience",
  //   volume: 0.2,
  // },
};


// ==========================================
// INICIAR AMBIENTE
// ==========================================

export function startWorldAmbient(
  scene: Phaser.Scene,
  worldKey: WorldKey
): Phaser.Sound.BaseSound | undefined {
  const config =
    WORLD_AUDIO[worldKey];

  if (!config) {
    return undefined;
  }

  const ambient = scene.sound.add(
    config.key,
    {
      loop: true,
      volume: config.volume,
    }
  );

  ambient.play();

  return ambient;
}


// ==========================================
// DETENER AMBIENTE
// ==========================================

export function stopWorldAmbient(
  ambient?: Phaser.Sound.BaseSound
): void {
  if (!ambient) {
    return;
  }

  ambient.stop();
  ambient.destroy();
}