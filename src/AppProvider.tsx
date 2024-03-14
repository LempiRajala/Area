import React, { useState } from "react";
import AppContext from "./AppContext";
import { Application } from'@pixi/app'

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [app, setApp] = useState<Application | null>(null);

  return (
    <AppContext.Provider value={{ app, setApp }}>
      { children }
    </AppContext.Provider>
  )
}