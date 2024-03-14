import { Shader, Texture, Geometry } from '@pixi/core'

const possibleVertexShader = `
precision mediump float;

attribute vec2 aVertexPosition;
attribute vec2 aUvs;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

varying vec2 vUvs;

void main() {
    vUvs = aUvs;
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}`;

const possibleFragmentShader = `
precision mediump float;

varying vec2 vUvs;

uniform sampler2D sampler;
uniform float alpha;

void main() {
    gl_FragColor = texture2D(sampler, vUvs);
    gl_FragColor.a = alpha;
}`;

export const createPossibleShader = (sampler: Texture) => Shader.from(
  possibleVertexShader, possibleFragmentShader, { sampler, alpha: 0 });

export const createPossibleGeometry = (cellSize: number) => (
  new Geometry()
    .addAttribute('aVertexPosition',
        [0, 0,
         1, 0,
         1, 1,
         0, 1].map(v => v * cellSize), 2)
    .addAttribute('aUvs',
        [0, 0,
         1, 0,
         1, 1,
         0, 1].map(v => v * cellSize), 2)
    .addIndex([0, 1, 2, 0, 2, 3]));