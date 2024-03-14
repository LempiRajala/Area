export type GameOptions = {
  width: number,
  height: number,
  autoFill: boolean
}

export type UserOptions = {
  fps: boolean
}

export type Painted = Rect & { user: number }

export type Camera = Point & { scale: number }

export type Point = { x: number, y: number }

export type Rect = { 
  x1: number,
  y1: number,
  x2: number,
  y2: number }

export interface IMouseEvent {
  clientX: number,
  clientY: number }

export type GameResults = {
  winner: number | null,
  reason: string }

export type AreaInfo = {
  firstPlayer: number,
  secondPlayer: number,
  empty: number }

export type Cluster = {
  player: number | null,
  points: Array<Point>
}

export type SurroundedCluster = {
  cluster: Cluster,
  surroundedBy: number
}