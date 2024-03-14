import React, { useState } from "react";
import { GameOptions } from "./types";
import { defaultGameOptions } from "./const";
import { validateGameFieldSize } from "./validation";
import { AlertFillIcon } from "@primer/octicons-react";

export default function NewGame({
  onready, show
}: {
  onready: (o: GameOptions) => void, show: boolean,
}) {
  const [width , setWidth ] = useState(defaultGameOptions.width);
  const [height, setHeight] = useState(defaultGameOptions.height);
  const [autoFill, setAutoFill] = useState(defaultGameOptions.autoFill);
  const [errors, setErrors] = useState<Array<Error>>([]);

  const onchangewidth  = (value: string) => isFinite(+value) && setWidth(+value);
  const onchangeheight = (value: string) => isFinite(+value) && setHeight(+value);
  const onapply = () => {
    var { errors } = validateGameFieldSize(width);
    if(errors.length !== 0) {
      setErrors(errors);
      return;
    }
    
    var { errors } = validateGameFieldSize(height);
    if(errors.length !== 0) {
      setErrors(errors);
      return;
    }

    setErrors([]);
    onready({ width, height, autoFill });
  }

  return (
    show ? <div className="modal-msg">
      <div className="new-game-msg">
        <h3>New game options</h3>
        <hr/>
        <fieldset className="game-field-sizes">
          <legend>Field size</legend>
          <table>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="fieldWidth">width:</label>
                </td>
                <td>
                  <input
                    id="fieldWidth" type="text"
                    onChange={e => onchangewidth(e.currentTarget.value)}
                    value={width}
                    ></input>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="fieldHeight">height:</label>
                </td>
                <td>
                  <input
                    id="fieldHeight" type="text"
                    onChange={e => onchangeheight(e.currentTarget.value)}
                    value={height}
                    ></input>
                </td>
              </tr>
            </tbody>
          </table>
        </fieldset>
        <fieldset>
          <legend>Other</legend>
          <label>
            <input 
              type="checkbox" checked={autoFill}
              onChange={e => setAutoFill(e.currentTarget.checked)}
              ></input>
            Fill surrounded
          </label>
        </fieldset>
        <div className="errors">
          {
            errors.map((err, i) => (
              <div key={i}>
                <AlertFillIcon/>
                { err.message }
              </div>
            ))
          }
        </div>
        <hr/>
        <button
          className="primary"
          onClick={() => onapply()}>Play</button>
      </div>
    </div> : null
  )
}