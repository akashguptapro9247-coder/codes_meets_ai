"use client";

import React, { forwardRef } from "react";
import { SpiderManScene } from "./SpiderManScene";

export const SpiderManAnimation = forwardRef(
  ({ state, onHandPosChange, targetPoint }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
          zIndex: 20,
          pointerEvents: 'none'
        }}
      >
        <SpiderManScene state={state} onHandPosChange={onHandPosChange} targetPoint={targetPoint} />
      </div>
    );
  }
);

SpiderManAnimation.displayName = "SpiderManAnimation";
