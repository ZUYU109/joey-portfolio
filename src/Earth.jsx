import { useEffect, useRef } from "react"

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uAngle;
varying vec2 vUv;
void main() {
  vec2 p = (vUv * 2.0 - 1.0) / 0.94;
  float r2 = dot(p, p);
  if (r2 > 1.12) discard;
  if (r2 > 1.0) {
    float glow = smoothstep(1.12, 1.0, r2);
    gl_FragColor = vec4(0.45, 0.68, 1.0, glow * 0.4);
    return;
  }
  float z = sqrt(max(0.0, 1.0 - r2));
  float c = cos(uAngle);
  float s = sin(uAngle);
  float x = p.x * c + z * s;
  float zz = -p.x * s + z * c;
  float lon = atan(x, zz);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  vec2 uv = vec2(lon / 6.2831853 + 0.5, lat / 3.14159265 + 0.5);
  vec3 color = texture2D(uTex, uv).rgb;
  float shade = clamp(0.38 + zz * 0.72 + p.x * 0.08, 0.32, 1.08);
  gl_FragColor = vec4(color * shade, 1.0);
}
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

export default function Earth() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    })
    if (!gl) return undefined

    const program = gl.createProgram()
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, "aPos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uAngle = gl.getUniformLocation(program, "uAngle")
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 20, 40, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    const image = new Image()
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    }
    image.src = `${import.meta.env.BASE_URL}earth-map.jpg`

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let stopped = false
    const started = performance.now()

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const size = Math.max(canvas.clientWidth, 1)
      const pixels = Math.round(size * ratio)
      if (canvas.width !== pixels) {
        canvas.width = pixels
        canvas.height = pixels
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const draw = (now) => {
      if (stopped) return
      resize()
      const angle = reduce ? 0.6 : ((now - started) / 1000) * 0.16
      gl.uniform1f(uAngle, angle)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" />
}