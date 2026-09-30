"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { cities } from "@/content/cities";
import { GEO, VB_H, VB_W, project } from "@/lib/geo";

/**
 * SIGNATURE 01 — the 2D map becomes 3D terrain.
 * A single plane displaced by real elevation (Terrarium/SRTM) whose shader layers
 * map → rivers → elevation → terrain → settlement as `progress` goes 0 → 1.
 */

const PW = VB_W / 100; // world width
const PH = VB_H / 100; // world depth

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const STAGES = (p: number) => ({
  rivers: smooth(0.1, 0.24, p),
  elev: smooth(0.3, 0.44, p),
  extrude: smooth(0.5, 0.72, p),
  tilt: smooth(0.46, 0.76, p),
  life: smooth(0.8, 0.93, p),
});

/** Draw land (R), rivers (G) and borders (B) into one texture using the same SVG geometry as the 2D map. */
function useMapTexture() {
  return useMemo(() => {
    const w = 1024;
    const h = Math.round((w * VB_H) / VB_W);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.scale(w / VB_W, h / VB_H);
    g.globalCompositeOperation = "lighter";
    g.fillStyle = "rgb(255,0,0)";
    g.fill(new Path2D(GEO.outline));
    g.strokeStyle = "rgb(0,255,0)";
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const r of GEO.rivers) {
      g.lineWidth = r.id === "padma" || r.id === "jamuna" || r.id === "meghna" ? 5 : 3.2;
      g.stroke(new Path2D(r.path));
    }
    g.strokeStyle = "rgb(0,0,255)";
    g.lineWidth = 1.1;
    for (const d of GEO.divisions) g.stroke(new Path2D(d.path));
    g.lineWidth = 1.8;
    g.stroke(new Path2D(GEO.outline));
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

const vertex = /* glsl */ `
  uniform sampler2D uHeight;
  uniform float uExtrude;
  varying vec2 vUv;
  varying float vH;
  varying float vMask;
  void main() {
    vUv = uv;
    vec4 t = texture2D(uHeight, uv);
    vH = t.r;
    vMask = t.g;
    vec3 p = position;
    float k = mix(0.3, 1.0, vMask);
    p.z += t.r * 0.95 * uExtrude * k;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uHeight;
  uniform sampler2D uMap;
  uniform float uRivers;
  uniform float uElev;
  uniform float uLife;
  uniform float uTime;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying float vH;
  varying float vMask;

  vec3 hypso(float h) {
    vec3 c0 = vec3(0.13, 0.27, 0.19);
    vec3 c1 = vec3(0.30, 0.44, 0.27);
    vec3 c2 = vec3(0.55, 0.53, 0.33);
    vec3 c3 = vec3(0.64, 0.38, 0.22);
    vec3 c4 = vec3(0.87, 0.80, 0.66);
    if (h < 0.12) return mix(c0, c1, h / 0.12);
    if (h < 0.3) return mix(c1, c2, (h - 0.12) / 0.18);
    if (h < 0.6) return mix(c2, c3, (h - 0.3) / 0.3);
    return mix(c3, c4, clamp((h - 0.6) / 0.35, 0.0, 1.0));
  }

  void main() {
    vec4 m = texture2D(uMap, vUv);
    float land = m.r;
    // hillshade from the heightfield (light from the north-west, cartographic convention)
    float hl = texture2D(uHeight, vUv - vec2(uTexel.x, 0.0)).r;
    float hr = texture2D(uHeight, vUv + vec2(uTexel.x, 0.0)).r;
    float hd = texture2D(uHeight, vUv - vec2(0.0, uTexel.y)).r;
    float hu = texture2D(uHeight, vUv + vec2(0.0, uTexel.y)).r;
    vec3 n = normalize(vec3((hl - hr) * 6.0, (hd - hu) * 6.0, 0.08));
    float shade = clamp(dot(n, normalize(vec3(-0.6, 0.6, 0.55))), 0.0, 1.0);

    vec3 flatLand = vec3(0.102, 0.114, 0.098);
    vec3 elevated = hypso(vH) * (0.55 + shade * 0.75);
    vec3 col = mix(flatLand, elevated, uElev);

    // neighbours & sea: quiet context around the protagonist
    bool sea = land < 0.5 && vH < 0.004;
    if (land < 0.5) {
      vec3 ctx = mix(vec3(0.05, 0.06, 0.065), hypso(vH) * (0.35 + shade * 0.4), uElev * 0.55);
      col = sea ? vec3(0.035, 0.07, 0.085) : ctx;
    }

    // rivers — moving light along the channels
    float shimmer = 0.75 + 0.25 * sin(uTime * 1.6 + (vUv.x + vUv.y) * 90.0);
    col = mix(col, vec3(0.55, 0.78, 0.86) * shimmer, m.g * uRivers * 0.95);

    // outline & divisions fade as the land takes over
    col = mix(col, vec3(0.85, 0.78, 0.64), m.b * (1.0 - uElev * 0.7) * 0.85);

    // settlement stage: warm light rising from the lowlands
    col += vec3(0.9, 0.55, 0.25) * uLife * 0.05 * (1.0 - vH) * land;

    float alpha = sea ? 0.0 : (land > 0.5 ? 1.0 : mix(0.35, 0.75, uElev));
    // soften the plane's rectangular edge so the neighbours dissolve into the night
    float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x) * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    if (land < 0.5) alpha *= edge;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Terrain({ progress, segments }: { progress: MutableRefObject<number>; segments: [number, number] }) {
  const heightTex = useMemo(() => {
    const t = new THREE.TextureLoader().load(GEO.elevation.src);
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, []);
  const mapTex = useMapTexture();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uHeight: { value: heightTex },
      uMap: { value: mapTex },
      uExtrude: { value: 0 },
      uRivers: { value: 0 },
      uElev: { value: 0 },
      uLife: { value: 0 },
      uTime: { value: 0 },
      uTexel: { value: new THREE.Vector2(1 / GEO.elevation.width, 1 / GEO.elevation.height) },
    }),
    [heightTex, mapTex],
  );

  useEffect(
    () => () => {
      heightTex.dispose();
      mapTex.dispose();
    },
    [heightTex, mapTex],
  );

  useFrame((_, dt) => {
    const s = STAGES(progress.current);
    const u = (mat.current?.uniforms ?? uniforms) as typeof uniforms;
    u.uTime.value += dt;
    // ease uniforms toward targets for silky scrubbing
    u.uRivers.value += (s.rivers - u.uRivers.value) * 0.12;
    u.uElev.value += (s.elev - u.uElev.value) * 0.12;
    u.uExtrude.value += (s.extrude - u.uExtrude.value) * 0.1;
    u.uLife.value += (s.life - u.uLife.value) * 0.12;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[PW, PH, segments[0], segments[1]]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent />
    </mesh>
  );
}

/** Warm points of light at the eight divisional cities — the settlement layer. */
function CityLights({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const pts = useMemo(
    () =>
      cities.map((c) => {
        const [x, y] = project(c.coordinates);
        return new THREE.Vector3(x / 100 - PW / 2, 0.12, y / 100 - PH / 2);
      }),
    [],
  );
  useFrame(({ clock }) => {
    const s = STAGES(progress.current);
    group.current?.children.forEach((m, i) => {
      const k = s.life * (0.85 + 0.15 * Math.sin(clock.elapsedTime * 2 + i));
      m.scale.setScalar(Math.max(0.0001, k));
      m.position.y = 0.1 + s.extrude * 0.25;
    });
  });
  return (
    <group ref={group}>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#ffc27a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ progress }: { progress: MutableRefObject<number> }) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const s = STAGES(progress.current);
    const aspect = size.width / size.height;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    // distance that frames the whole country top-down (like the 2D map)
    const fitH = PH / 2 / Math.tan(fov / 2);
    const fitW = PW / 2 / Math.tan(fov / 2) / aspect;
    const flatDist = Math.max(fitH, fitW) * 1.08;
    const tilt = 0.015 + s.tilt * 0.96; // radians from vertical (never exactly 0: keeps north up)
    const dist = flatDist * (1 - s.tilt * 0.22);
    const az = -0.25 * s.tilt;
    const y = Math.cos(tilt) * dist;
    const h = Math.sin(tilt) * dist;
    camera.position.set(Math.sin(az) * h, y, Math.cos(az) * h + 0.0001);
    target.set(0, 0, -s.tilt * 0.9);
    camera.lookAt(target);
  });
  return null;
}

export default function TerrainScene({ progress, active, mobile }: { progress: MutableRefObject<number>; active: boolean; mobile: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.1, far: 200, position: [0, 20, 0.001] }}
      aria-hidden
    >
      <Terrain progress={progress} segments={mobile ? [120, 168] : [260, 364]} />
      <CityLights progress={progress} />
      <CameraRig progress={progress} />
    </Canvas>
  );
}
