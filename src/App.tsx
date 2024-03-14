import React, { useEffect, useMemo, useState } from 'react';
import NewGame from './NewGameMessage';
import FPS from './FPS';
import GameCanvas, { Mouse } from './GameCanvas';
import { GameOptions, GameResults, Painted, Point } from './types';
import Grid from "./Grid";
import Selector from "./Selector";
import Dices, { STATES as DIC_STATES} from './Dices';
import { cellSize, defaultGameOptions, defaultUserOptions, endReasons, firstPlayerColor, leftButton, rightButton, rollTime, secondPlayerColor } from './const';
import STATES from './gameStates';
import { calculateAreas, chooseClosestPoint, findEmptySurroundedClusters, findPossibleFirstCorners, findSecondCornerPositions, hexToRGBA, range, rectFromPoints, rollDice } from './utils';
import DynamicArea from './DynamicArea';
import Area from './Area';
import Possible from './PossiblePoints';
import Results from './Results';
import Surrounded from './Surrounded';

export default function App() {
  const [gameState, setGameState] = useState<STATES>(STATES.NEW_GAME);
  const [diceState, setDiceState] = useState<DIC_STATES>(DIC_STATES.IDLE);
  const [opts, setOptions] = useState(defaultGameOptions);
  const [userOpts, setUserOpts] = useState(defaultUserOptions);
  // не меняй порядок painted, иначе surrounded будет не то красить
  const [painted, setPainted] = useState<Array<Painted>>([]);
  // const [surrounded, setSurrounded] = useState<Array<SurroundedCluster>>([]);
  const [surrounded, setSurrounded] = useState<Array<number>>([]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [possibleFirstCorners, setPossibleFirstCorners] = useState<Array<Point> | null>(null);
  const [possibleSecondCorners, setPossibleSecondCorners] = useState<Array<Point> | null>(null);
  const [mouse, setMouse] = useState<Mouse | undefined>();
  const [firstCorner, setFirstCorner] = useState<Point | null>(null);
  const [dices, setDices] = useState<[number, number] | null>(null);
  const [results, setResults] = useState<GameResults | null>(null);
  
  const areaInfo = useMemo(() => calculateAreas(opts, painted), [opts, painted]);
  const currentPlayerColor = activePlayer === 0 ? firstPlayerColor : secondPlayerColor

  const firstPlayerRGBA  = useMemo(() => hexToRGBA(firstPlayerColor , 0.6), [firstPlayerColor ]);
  const secondPlayerRGBA = useMemo(() => hexToRGBA(secondPlayerColor, 0.6), [secondPlayerColor]);

  const oncanvasmouseupdate = (m: Mouse) => {
    if(!mouse) {
      setMouse(m);
      return;
    }

    if(
      m.pressed !== mouse.pressed ||
      m.cell?.x !== mouse.cell?.x ||
      m.cell?.y !== mouse.cell?.y
    ) {
      setMouse(m);
    }
  }

  const checkDefeat = (): GameResults | null => {
    let {
      firstPlayer: userArea,
      secondPlayer: enemyArea,
      empty
    } = areaInfo;
    const enemy = activePlayer === 0 ? 1 : 0;
    if(activePlayer === 1) {
      [userArea, enemyArea] = [enemyArea, userArea];
    }

    // пустого места не осталось
    if(empty === 0) {
      // площади равны
      if(userArea === enemyArea) {
        return { winner: null, reason: endReasons.equalArea() };
      }

      // чья-то площадь больше
      if(userArea > enemyArea) {
        return { winner: activePlayer, reason: endReasons.areaLarger(activePlayer) }
      } else {
        return { winner: enemy, reason: endReasons.areaLarger(enemy) }
      }
    }

    const possible = findPossibleFirstCorners(
      activePlayer, opts, painted);
    // игрок окружен
    if(possible.length === 0) {
      // площадь врага будет больше после захвата
      if(enemyArea + empty > userArea) {
        return { winner: enemy, reason: endReasons.isSurrounded(activePlayer) } 
      }
      // площадь врага будет меньше после захвата
      if(enemyArea + empty < userArea) {
        return { winner: activePlayer, reason: endReasons.isSurrounded(enemy) } 
      }
      // площади будут равны
      // if(enemyArea + empty === userArea) {
        return { winner: null, reason: endReasons.equalArea() };
      // }
    }

    return null;
  }

  useEffect(() => {
    if(gameState === STATES.INIT) {
      setPainted([]);
      setActivePlayer(Math.round(Math.random()));
      setGameState(STATES.WAIT_FOR_ROLL);
    }

    if([
      STATES.CHECK_DEFEAT_BEFORE_MOVE,
      STATES.CHECK_DEFEAT_AFTER_MOVE
    ].includes(gameState)) {
      const checkResult = checkDefeat();
      if(checkResult) {
        setResults(checkResult);
        setGameState(STATES.END_GAME);
        return;
      }
    }

    if(gameState === STATES.CHECK_DEFEAT_BEFORE_MOVE) {
      setGameState(STATES.WAIT_FOR_ROLL);
    }

    if(gameState === STATES.CHECK_DEFEAT_AFTER_MOVE) {
      if(opts.autoFill) {
        setGameState(STATES.FILL_SURROUNDED_IF_ANY);
      } else {
        setGameState(STATES.CHANGE_PLAYER);
      }
    }

    if(gameState === STATES.CHANGE_PLAYER) {
      setActivePlayer(u => u ^ 1);
      setGameState(STATES.CHECK_DEFEAT_BEFORE_MOVE);
    }

    if(gameState === STATES.FILL_SURROUNDED_IF_ANY) {
      const start = performance.now();
      const clusters = findEmptySurroundedClusters(opts, painted);
      console.debug((performance.now() - start).toFixed(2), 'milliseconds');
      if(clusters.length) {
        let added = 0;
        setPainted(painted.concat(...clusters.map(({ cluster, surroundedBy }) => {
          added += cluster.points.length;
          return cluster.points.map(({ x, y }) => ({
            x1: x, y1: y, x2: x, y2: y,
            user: surroundedBy
          }));
        }).flat(1)));
        setSurrounded(surrounded.concat(range(painted.length, painted.length + added)));
      }
      
      setGameState(STATES.CHANGE_PLAYER);
    }


    if(gameState === STATES.WAIT_FOR_ROLL) {
      setDiceState(DIC_STATES.WAIT_FOR_ROLL);
    }

    if(gameState === STATES.ROLL) {
      setDiceState(DIC_STATES.ROLL);
      setTimeout(() => {
        setDiceState(DIC_STATES.READY);
        setFirstCorner(null);

        let dices: [number, number];
        let possible: Array<Point>;
        let attempts = 0;
        do {
          dices = [rollDice(), rollDice()];
          possible = (
            findPossibleFirstCorners(activePlayer, opts, painted)
            .filter(corner => findSecondCornerPositions(
              opts, corner, dices, painted).length !== 0));
          if(attempts++ > 500) {
            throw new Error('too many attempts!');
          }
        } while (possible.length === 0);

        setDices(dices);
        if(possible.length === 0) {
          setActivePlayer(u => u ^ 1);
          setGameState(STATES.WAIT_FOR_ROLL);
        } else {
          setPossibleFirstCorners(possible);
          setGameState(STATES.WAIT_FOR_FIRST_CORNER);
        }
      }, rollTime);
    }
  }, [gameState]);

  const ongamestart = (options: GameOptions) => {
    setGameState(STATES.INIT);
    setOptions(options);
  }
  
  const onroll = () => setGameState(STATES.ROLL);

  const onnewgame = () => setGameState(STATES.NEW_GAME);

  const onclick = (mouse: Mouse, button: number) => {
    if(button === leftButton) {
      if(
        gameState === STATES.WAIT_FOR_FIRST_CORNER &&
        mouse?.cell && dices
      ) {
        const { cell } = mouse;
        if(
          possibleFirstCorners &&
          possibleFirstCorners.every(c => c.x !== cell.x || c.y !== cell.y)
        ) {
          return;
        }

        const possible = findSecondCornerPositions(
          opts, mouse.cell, dices, painted);

        if(possible.length === 0) {
          // console.log('no possible rects!');
        } else {
          setPossibleSecondCorners(possible);
          setFirstCorner(mouse.cell);
          setGameState(STATES.WAIT_FOR_SECOND_CORNER);
        }
      }

      if(
        gameState === STATES.WAIT_FOR_SECOND_CORNER &&
        mouse.cell && possibleSecondCorners && firstCorner
      ) {
        const rect = rectFromPoints(
          chooseClosestPoint(mouse.cell, possibleSecondCorners),
          firstCorner);
        setPainted(painted.concat([Object.assign({ user: activePlayer }, rect)]));
        setGameState(STATES.CHECK_DEFEAT_AFTER_MOVE);
      }
    }
    
    if(button === rightButton) {
      if(gameState === STATES.WAIT_FOR_SECOND_CORNER) {
        setGameState(STATES.WAIT_FOR_FIRST_CORNER);
      }
    }
  }

  return (
    <>
      <header style={{
        background: 'black',
        backgroundImage: (
          `linear-gradient( 25deg, transparent 65%, ${secondPlayerRGBA} 90%), ` +
          `linear-gradient(-25deg, transparent 65%, ${firstPlayerRGBA } 90%)` )
      }}>
        <div className='first-player'>
          <div>
            first player
          </div>
          <div>Area: { areaInfo.firstPlayer }</div>
        </div>
        <Dices
          color={currentPlayerColor}
          values={dices} state={diceState}
          onroll={onroll}/>
        <div className='second-player'>
          <div>
            second player
          </div>
          <div>Area: { areaInfo.secondPlayer }</div>
        </div>
        {
          userOpts.fps && <FPS/>
        }
      </header>
      <GameCanvas
        width={window.innerWidth}
        height={window.innerHeight}
        onmouseupdate={oncanvasmouseupdate}
        onclick={onclick}
        opts={opts}>
        {
          (
            gameState === STATES.WAIT_FOR_SECOND_CORNER &&
            firstCorner && mouse?.cell
          ) ? (
            <DynamicArea
              color={currentPlayerColor}
              topLeft={firstCorner}
              bottomRight={
                possibleSecondCorners
                ? chooseClosestPoint(
                  mouse.cell, possibleSecondCorners)
                : mouse.cell }
              />
          ) : null
        }
        {
          (
            gameState === STATES.WAIT_FOR_FIRST_CORNER ||
            gameState === STATES.WAIT_FOR_SECOND_CORNER
          ) ? (
            <Selector
              width={dices && dices[0]}
              height={dices && dices[1]}
              mouseCell={mouse?.cell}/>
          ) : null
        }
        {
          gameState === STATES.WAIT_FOR_FIRST_CORNER && possibleFirstCorners 
          ? <Possible
            points={possibleFirstCorners}
            color={currentPlayerColor}/>
          : null
        }
        <Grid
          width={opts.width} 
          height={opts.height}
          color={0}
          cellWidth={cellSize}/>
        {
          painted.map((p, i) => 
          surrounded.includes(i) ? (
            <Surrounded
              key={i} x={p.x1} y={p.y1}
              color={p.user === 0 ? firstPlayerColor : secondPlayerColor}/>
          ) : (
            <Area key={i} painted={p}/>
          ))
        }
      </GameCanvas>
      <NewGame
        show={gameState === STATES.NEW_GAME}
        onready={ongamestart}/>
      <Results
        show={gameState === STATES.END_GAME}
        results={results} areaInfo={areaInfo}
        painted={painted} onnewgame={onnewgame}/>
    </>
  )
}