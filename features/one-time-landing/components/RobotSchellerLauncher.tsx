import React from 'react';
import { oneTimeLandingAssets } from '../oneTimeLandingAssets';

export function RobotSchellerLauncher() {
  return (
    <button
      type="button"
      className="robot-scheller-launcher"
      aria-label="Open Rabbi Scheller’s WhatsApp assistant."
      data-asset-status={oneTimeLandingAssets.robot.status}
    >
      <span aria-hidden="true">RS</span>
    </button>
  );
}
