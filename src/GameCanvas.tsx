import React, { MouseEventHandler, WheelEventHandler, useContext, useEffect, useState } from "react";
import { Stage, Container } from '@pixi/react';
import { GameOptions, IMouseEvent, Point } from "./types";
import { maxScale, minScale, zoomFactor, initialScale, cellSize } from "./const";
import AppContext from "./AppContext";

// https://stackoverflow.com/questions/75969167/pixi-js-zoom-to-mouse-position

const normalizeScale = (scale: number) => Math.max(minScale, Math.min(scale, maxScale));
// const normalizeCoveredCell = (opts: GameOptions, p: Point) => (
//   p.x < 0 || p.x >= opts.width || p.y < 0 || p.y >= opts.height ? null : p );
const normalizeCoveredCell = (opts: GameOptions, p: Point) => ({
  x: Math.max(0, Math.min(p.x, opts.width  - 1)),
  y: Math.max(0, Math.min(p.y, opts.height - 1)) });

const getMousePosition = (e: IMouseEvent, c?: HTMLCanvasElement) => (
  c
  ? [e.clientX - c.offsetLeft, e.clientY - c.offsetTop]
  : [e.clientX, e.clientY]);

export type Mouse = {
  cell: Point | null,
  container: Point,
  canvas: Point,
  pressed: Point | false,
}

type MouseHandler = (m: Mouse) => void
type MouseClickHandler = (m: Mouse, button: number) => void

export default function GameCanvas({
  width, height, opts, children,
  onmove, ondown, onup,
  onmouseupdate, onclick,
}: {
  width: number, height: number,
  opts: GameOptions, children: React.ReactNode,
  onmove?: MouseHandler, ondown?: MouseHandler,
  onup?: MouseHandler, onclick?: MouseClickHandler,
  onmouseupdate: MouseHandler
}) {
  const { setApp } = useContext(AppContext);
  const [scale, setScale] = useState(initialScale);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [mouse, setMouse] = useState<Mouse>({
    cell: null,
    pressed: false,
    canvas: { x: 0, y: 0 },
    container: {
      x: (width  / 2 - opts.width  * cellSize / 2) * scale,
      y: (height / 2 - opts.height * cellSize / 2) * scale }});

  useEffect(() => (
    setCanvas(
      document.body.querySelector('main canvas') as HTMLCanvasElement)), []);
  useEffect(() => onmouseupdate(mouse), [mouse, onmouseupdate]);

  const updateMouse = (changes: Partial<Mouse>) => setMouse(Object.assign({}, Object.assign(mouse, changes)));

  const emitMouseAction = (changes: Partial<Mouse>, externalHandler?: MouseHandler) => {
    const updated = Object.assign({}, Object.assign(mouse, changes));
    setMouse(updated);
    externalHandler && externalHandler(updated);
  }

  const onscroll: WheelEventHandler<HTMLElement> = e => {
    const updatedScale = normalizeScale(
      e.deltaY < 0
      ? scale * zoomFactor
      : scale / zoomFactor );

    const [mouseX, mouseY] = getMousePosition(e, canvas);
    const worldPos = { 
      x: (mouseX - mouse.container.x) / scale,
      y: (mouseY - mouse.container.y) / scale }
    
    const newScreenPos = {
      x: worldPos.x * updatedScale + mouse.container.x,
      y: worldPos.y * updatedScale + mouse.container.y }
  
    updateMouse({
      container: {
        x: mouse.container.x - (newScreenPos.x - mouseX),
        y: mouse.container.y - (newScreenPos.y - mouseY) }});

    setScale(updatedScale);
  }

  const onmousedown: MouseEventHandler<HTMLElement> = e => {
    const [x, y] = getMousePosition(e, canvas);
    emitMouseAction({ pressed: { x, y }, canvas: { x, y } }, ondown);
  }

  const onmouseup: MouseEventHandler<HTMLElement> = e => {
    e.preventDefault();

    const [x, y] = getMousePosition(e, canvas);
    if(
      mouse.pressed &&
      Math.abs(x - mouse.pressed.x) + Math.abs(y - mouse.pressed.y) < 3
    ) {
      // console.log({ x, y }, lastMousePos);
      onclick && onclick(mouse, e.button);
    }
    emitMouseAction({ pressed: false, canvas: { x, y } }, onup);
  }

  const onmousemove: MouseEventHandler<HTMLElement> = e => {
    const [mouseX, mouseY] = getMousePosition(e, canvas);
    let changes: Partial<Mouse> = {};

    if(mouse.pressed) {
      changes = {
        canvas: {
          x: mouseX,
          y: mouseY },
        container: {
          x: mouse.container.x + mouseX - mouse.canvas.x,
          y: mouse.container.y + mouseY - mouse.canvas.y }};
    }

    changes = Object.assign(changes, {
      cell: normalizeCoveredCell(opts, {
        x: Math.floor((mouseX - mouse.container.x) / cellSize / scale),
        y: Math.floor((mouseY - mouse.container.y) / cellSize / scale) })});

    emitMouseAction(changes, onmove);
  }

  return (
    <Stage
      onMount={app => setApp && setApp(app)}
      onWheel={onscroll}
      onMouseDown={onmousedown}
      onMouseUp={onmouseup}
      onMouseMove={onmousemove}
      width={width} height={height}
      options={{ backgroundAlpha: 0, antialias: true }}>
      <Container scale={scale} x={mouse.container.x} y={mouse.container.y}>
        {
          children
        }
      </Container>
    </Stage>
  )
}