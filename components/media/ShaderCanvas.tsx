"use client";
import { useEffect, useRef, type MutableRefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal full-screen fragment-shader canvas (raw WebGL — far lighter than a 3D scene).
 * Provides uTime, uRes, uProgress and uPointer. Pauses off-screen; cleans up its GL resources.
 */
export function ShaderCanvas({
  fragment,
  progress,
  className,
  paused = false,
}: {
  fragment: string;
  progress?: MutableRefObject<number>;
  className?: string;
  paused?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const c = canvas.current!;
    const gl = c.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    const v = compile(gl.VERTEX_SHADER, vs);
    const f = compile(gl.FRAGMENT_SHADER, `precision mediump float;\nuniform float uTime; uniform vec2 uRes; uniform float uProgress; uniform vec2 uPointer;\n${fragment}`);
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uProg = gl.getUniformLocation(prog, "uProgress");
    const uPtr = gl.getUniformLocation(prog, "uPointer");
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5) * 0.75; // soft by design: mist doesn't need pixels
      c.width = Math.max(1, Math.floor(c.clientWidth * dpr));
      c.height = Math.max(1, Math.floor(c.clientHeight * dpr));
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (pausedRef.current) return;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      gl.uniform1f(uTime, reduced ? 12 : (performance.now() - t0) / 1000);
      gl.uniform2f(uRes, c.width, c.height);
      gl.uniform1f(uProg, progress?.current ?? 0);
      gl.uniform2f(uPtr, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(v);
      gl.deleteShader(f);
    };
  }, [fragment, progress]);

  return <canvas ref={canvas} aria-hidden className={cn("block h-full w-full", className)} />;
}
