import React, { useContext, useEffect, useState } from "react";
import AppContext from "./AppContext";

export default function FPS() {
  const { app } = useContext(AppContext);
  const [fps, setFps] = useState('-');
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  useEffect(() => {
    if(intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    if(app !== null) {
      const id = setInterval(() => setFps(
        app?.ticker?.FPS.toFixed(2) || '-'), 250)
      setIntervalId(id);
    }
  }, [app]);

  return (
    <div className="fps">FPS: { fps }</div>
  )
}