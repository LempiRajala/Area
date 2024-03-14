import React, { useEffect, useState } from "react";
import { hexToRGB, hexToRGBA, rollDice } from "./utils";

export enum STATES {
  IDLE,
  WAIT_FOR_ROLL,
  ROLL,
  READY
}

export default function Dices({
  values, state, onroll, color
}: {
  values?: [number, number] | null,
  state: STATES, onroll: () => void,
  color: number
}) {
  const [content, setContent] = useState(['','']);
  const [rollInterval, setRollInterval] = useState<NodeJS.Timer | null>(null);

  useEffect(() => {
    if(state === STATES.IDLE) {
      setContent(['-', '-']);
    }
    
    if(state === STATES.ROLL) {
      if(rollInterval === null) {
        const setRandomValues = () => (
          setContent([
            rollDice().toString(),
            rollDice().toString() ]));
    
        setRandomValues();
        setRollInterval(setInterval(setRandomValues, 50));
      }
    } else if(rollInterval !== null) {
      clearInterval(rollInterval);
      setRollInterval(null);
    }
    
    if(state === STATES.READY && values) {
      setContent([values[0].toString(), values[1].toString()]);
    }
  }, [state]);

  return (
    <div className='dices'>
      {
        state === STATES.WAIT_FOR_ROLL
        ? (
          <button className="primary" onClick={onroll} style={{ color: hexToRGB(color) }}>
            Roll dices
          </button>
        ) : content.map((value, i) => (
          <div key={i} className='dice' style={{ borderColor: hexToRGBA(color, 0.75) }}>
            { value }
          </div>
        ))
      }
    </div>
  )
}