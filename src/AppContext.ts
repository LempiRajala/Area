import React, { createContext } from "react";
import { Application } from'@pixi/app'

export default createContext({
  app: null as Application | null,
  setApp: null as React.Dispatch<React.SetStateAction<Application | null>> | null
});