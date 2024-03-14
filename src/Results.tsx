import React from "react";
import { AreaInfo, GameResults, Painted } from './types'

export default function Results({
  results, show, areaInfo, painted, onnewgame
}: {
  results: GameResults | null, show: boolean,
  areaInfo: AreaInfo, painted: Array<Painted>,
  onnewgame: () => void
}) {
  const size = areaInfo.firstPlayer + areaInfo.secondPlayer + areaInfo.empty;
  const percent = (f: number, s: number) => Math.floor((f / s) * 1e2).toFixed(2) + '%';
  return (
    show && results ?
    <div className="modal-msg">
      <div className="game-results">
          <h3>
            { results.winner === 0 ? 'First' : 'Second' } player is win!
          </h3>
          <hr/>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>first</th>
                <th>second</th>
                <th>common</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th rowSpan={2}>Area</th>
                <td>{ areaInfo.firstPlayer }</td>
                <td>{ areaInfo.secondPlayer }</td>
                <td>{ areaInfo.firstPlayer + areaInfo.secondPlayer }</td>
              </tr>
              <tr>
                <td>{ percent(areaInfo.firstPlayer, size)  }</td>
                <td>{ percent(areaInfo.secondPlayer, size) }</td>
                <td>{ percent(areaInfo.firstPlayer + areaInfo.secondPlayer, size) }</td>
              </tr>
              <tr>
                <th>Rects</th>
                <td>{ painted.filter(p => p.user === 0).length }</td>
                <td>{ painted.filter(p => p.user === 1).length }</td>
                <td>{ painted.length }</td>
              </tr>
            </tbody>
          </table>
          <p>
            Result: <span className="game-over-reason">{ results.reason }</span>            
          </p>
          <hr/>
          <button className="primary" onClick={onnewgame}>Play new game</button>
      </div>
    </div> : null
  )
}