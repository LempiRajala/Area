import { Graphics } from "@pixi/graphics";
import { cellSize, collectorMarker, emptyPointMarker, maxDiceValue } from "./const";
import { AreaInfo, Cluster, GameOptions, Painted, Point, Rect, SurroundedCluster } from "./types";

export const cellToWorld = (x: number, y: number, cellWidth: number) => (
  [x * cellWidth, y * cellWidth]);

export const drawSquare = (g: Graphics, x: number, y: number) => {
  [x, y] = cellToWorld(x, y, cellSize);
  g.moveTo(x, y);
  g.lineTo(x + cellSize, y);
  g.lineTo(x + cellSize, y + cellSize);
  g.lineTo(x, y + cellSize);
  g.lineTo(x, y);
}

export const hatchSquare = (g: Graphics, x: number, y: number) => {
  [x, y] = cellToWorld(x, y, cellSize);
  g.moveTo(x, 0);
  g.lineTo(0, y);
}

export const drawArea = (g: Graphics, x1: number, y1: number, x2: number, y2: number) => {
  if(x1 > x2) {
    [x1, x2] = [x2, x1];
  }

  if(y1 > y2) {
    [y1, y2] = [y2, y1];
  }

  for(let y = y1; y <= y2; y++) {
    for(let x = x1; x <= x2; x++) {
      drawSquare(g, x, y);
    }
  }
}

export const create2DContext = (width: number, height: number) => {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c.getContext('2d') as CanvasRenderingContext2D;
}

export const rollDice = () => 1 + Math.floor(maxDiceValue * Math.random());

export const findPossibleFirstCorners = (
  user: number, opts: GameOptions, painted: Array<Painted>
) => {
  let points: Array<Point> = [];
  if(user === 0) {
    points.push({ x: 0, y: 0 });
  } else {
    points.push({ x: opts.width - 1, y: opts.height - 1 });
  }

  painted
    .filter(p => p.user === user)
    .forEach(rect => {
      // верхняя и нижняя стороны, включая углы
      // for(let x = rect.x1 - 1; x <= rect.x2 + 1; x++) {
      // верхняя и нижняя стороны, без углов
      for(let x = rect.x1; x <= rect.x2; x++) {
        points.push(
          { x, y: rect.y1 - 1 },
          { x, y: rect.y2 + 1 });
      }

      // левая и правая стороны, без углов
      for(let y = rect.y1; y <= rect.y2; y++) {
        points.push(
          { x: rect.x1 - 1, y },
          { x: rect.x2 + 1, y });
      }
    });

  return filterUniquePoints(
    points
    .filter(p => p.x >= 0 && p.y >= 0 && p.x < opts.width && p.y < opts.height)
    .filter(p => !isPointInsideRects(p, painted)));
}

export const findSecondCornerPositions = (
  opts: GameOptions,
  leftTop: Point,
  dices: [number, number],
  painted: Array<Painted>
) => {
  dices = [dices[0] - 1, dices[1] - 1];
  const positions: Array<Point> = [
    { x: leftTop.x - dices[0], y: leftTop.y - dices[1] },
    { x: leftTop.x - dices[0], y: leftTop.y + dices[1] },
    { x: leftTop.x + dices[0], y: leftTop.y - dices[1] },
    { x: leftTop.x + dices[0], y: leftTop.y + dices[1] },

    { x: leftTop.x - dices[1], y: leftTop.y - dices[0] },
    { x: leftTop.x - dices[1], y: leftTop.y + dices[0] },
    { x: leftTop.x + dices[1], y: leftTop.y - dices[0] },
    { x: leftTop.x + dices[1], y: leftTop.y + dices[0] }];

  return filterUniquePoints(positions).filter(pos => {
    if(
      pos.x < 0 || pos.x >= opts.width ||
      pos.y < 0 || pos.y >= opts.height
    ) {
      return false;
    }

    const rect = rectFromPoints(leftTop, pos);
    return painted.every(rect2 => !isRectsIntersects(rect, rect2));
  });
}

export const isPointInsideRect = (p: Point, rect: Rect) => (
  isRectsIntersects(rect, rectFromPoints(p, p)));

export const isPointInsideRects = (p: Point, rects: Array<Rect>) => {
  const rect = rectFromPoints(p, p);
  return rects.some(rect2 => isRectsIntersects(rect, rect2));
}

export const chooseClosestPoint = (pointer: Point, corners: Array<Point>) => {
  let closestIndex = -1;
  let closestDist = Infinity;
  for(let i = 0; i !== corners.length; i++) {
    const corner = corners[i];
    const dist = (pointer.x - corner.x)**2 + (pointer.y - corner.y)**2;
    if(dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }
  return corners[closestIndex];
}

export const isRectsIntersects = (r1: Rect, r2: Rect) => !(
  r2.x1 > r1.x2 || r2.x2 < r1.x1 || r2.y1 > r1.y2 || r2.y2 < r1.y1);

export const rectFromPoints = (p1: Point, p2: Point): Rect => ({
  x1: Math.min(p1.x, p2.x),
  y1: Math.min(p1.y, p2.y),
  x2: Math.max(p1.x, p2.x),
  y2: Math.max(p1.y, p2.y) });

export const filterUniquePoints = (points: Array<Point>) => {
  const unique: Array<Point> = [];
  points.forEach(p => {
    if(!unique.some(u => u.x === p.x && u.y === p.y)) {
      unique.push(p);
    }
  });
  return unique;
}

export const calculateAreas = (opts: GameOptions, painted: Array<Painted>): AreaInfo => {
  let firstPlayer = 0;
  let secondPlayer = 0;
  painted.forEach(p => {
    const area = (p.x2 - p.x1 + 1) * (p.y2 - p.y1 + 1);
    if(p.user === 0) {
      firstPlayer += area;
    } else {
      secondPlayer += area;
    }
  });

  return {
    firstPlayer, secondPlayer,
    empty: opts.width * opts.height - firstPlayer - secondPlayer }
}

export const hexToRGB = (hex: number) => {
  let str = hex.toString(16);
  while(str.length < 6) {
    str = '0' + str;
  }
  return (
    'rgb(' +
    [0,0,0].map((_, i) => parseInt(str.substring(i * 2, (i + 1) * 2), 16)).join(',') +
    ')');
}

export const hexToRGBA = (hex: number, alpha: number) => {
  let str = hex.toString(16);
  while(str.length < 6) {
    str = '0' + str;
  }
  return (
    'rgb(' +
    [0,0,0].map((_, i) => parseInt(str.substring(i * 2, (i + 1) * 2), 16)).join(',') +
    `, ${alpha})`); 
}

export const findEmptySurroundedClusters = (
  opts: GameOptions, painted: Array<Painted>
): Array<SurroundedCluster> => {
  const field = createGameFieldMatrix(opts, painted);
  const clusters = findEmptyClusters(opts, field);
  const surrouned: Array<SurroundedCluster> = [];
  clusters.forEach(cluster => {
    const surroundedBy = isClusterSurrounded(opts, cluster, field);
    if(surroundedBy !== false) {
      surrouned.push({ cluster, surroundedBy });
    }
  });
  return surrouned;
}

export const isClusterSurrounded = (
  opts: GameOptions, cluster: Cluster,
  field: Uint8Array
) => {
  if(cluster.player !== emptyPointMarker) {
    throw new Error('функция не проверялась на кластерах с не пустыми точками');
  }

  const decWidth = opts.width - 1;
  const decHeight = opts.height - 1;
  let player = -1;
  for(const p of cluster.points) {
    const neighbours = [
      { x: p.x    , y: p.y - 1},
      { x: p.x + 1, y: p.y    },
      { x: p.x    , y: p.y + 1},
      { x: p.x - 1, y: p.y    }];

    for(const n of neighbours) {
      if(n.x < 0 || n.x > decWidth || n.y < 0 || n.y > decHeight) {
        return false;
      }

      const pointPlayer = field[n.y * opts.width + n.x];
      if(pointPlayer === cluster.player) {
        continue;
      }

      if(player === -1) {
        player = pointPlayer;
      } else {
        if(player !== pointPlayer) {
          return false;
        }
      }
    }
  }

  return player === -1 ? false : player;
}

export const findEmptyClusters = (opts: GameOptions, field: Uint8Array): Array<Cluster> => {
  const clusters: Array<Cluster> = [];
  const { width } = opts;

  for(let i = 0; i !== field.length; i++) {
    if(field[i] === emptyPointMarker) {
      const x = i % width;
      const y = (i - x) / width;
      const cluster = collectAndMarkPoints(
        opts, field, x, y,
        emptyPointMarker,
        collectorMarker);
      clusters.push(cluster);
    }
  }

  for(let i = 0; i !== field.length; i++) {
    if(field[i] === collectorMarker) {
      field[i] = emptyPointMarker;
    }
  }

  return clusters;
}

export const createGameFieldMatrix = (opts: GameOptions, painted: Array<Painted>): Uint8Array => {
  const u8 = new Uint8Array(opts.width * opts.height);
  u8.fill(emptyPointMarker);
  painted.forEach(({ x1, y1, x2, y2, user: player }) => {
    for(let y = y1; y <= y2; y++)
      for(let x = x1; x <= x2; x++)
        u8[y * opts.width + x] = player;
  });
  return u8;
}

export const collectAndMarkPoints = (
  opts: GameOptions, field: Uint8Array, xStart: number, yStart: number,
  player: number, marker: number
): Cluster => {
  const points: Array<Point> = [];
  const check: Array<Point> = [{ x: xStart, y: yStart }];
  const { width, height } = opts;
  
  while(check.length) {
    const p = check.pop() as Point;
    const index = p.y * width + p.x;
    if(field[index] === player) {
      points.push(p);
      field[index] = marker;
      const { x, y } = p;
      if(y - 1 >= 0) {
        check.push({ x, y: y - 1 });
      }
      if(x + 1 < width) {
        check.push({ x: x + 1, y });
      }
      if(y + 1 < height) {
        check.push({ x, y: y + 1 });
      }
      if(x - 1 >= 0) {
        check.push({ x: x - 1, y });
      }
    }
  }

  return { player, points }
}

export const range = (from: number, to: number) => {
  const nums: Array<number> = [];
  for(let num = from; num < to; num++) {
    nums.push(num);
  }
  return nums;
}

export const minmax = (min: number, value: number, max: number) => {
  if(value < min) {
    return min;
  }

  if(value > max) {
    return max;
  }

  return value;
}