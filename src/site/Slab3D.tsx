import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The hero object: a thick slab of dark graphite glass, the same near-black as
 * the page, with a faint navy tint in its reflections, carrying the site mark
 * (the portico) as a fine, low relief in the slab's own tone. The light does the work
 * (studio reflections, one soft gradient of light across the face, bright
 * bevelled edges).
 *
 * On load it swings in from below; afterwards it slowly breathes, tilts toward
 * the pointer anywhere on the page, spins a little with scroll velocity and a
 * light sweeps across the face every ~7.5 s. Honors prefers-reduced-motion
 * (static pose, still lit).
 */

const GRAPHITE = 0x232830;
const NAVY = 0x1d3f8a;

const EASE_OUT = (t: number) => 1 - (1 - t) ** 4;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function Slab3D({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ---------- renderer / scene / camera ----------
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
    camera.position.set(0, 0.6, 11);
    camera.lookAt(0, 0, 0);

    // Studio environment: soft area-light reflections are what make glass read as glass.
    // A large soft-gradient panel is added to the room so ONE gentle wash of
    // light crosses the slab's face (the "graphite glass" look).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const g = cv.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(225,232,255,0.7)");
    grad.addColorStop(1, "rgba(200,210,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const panelTex = new THREE.CanvasTexture(cv);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 11),
      new THREE.MeshBasicMaterial({
        map: panelTex,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    );
    panel.position.set(-5, 2.2, 6);
    panel.lookAt(0, 0, 0);
    room.add(panel);
    const envTex = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 1.0;

    // ---------- lights ----------
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-5, 6, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fb4ea, 0.35);
    fill.position.set(6, -3, 4);
    scene.add(fill);
    // Sweep: a point light that glides across the face every few seconds.
    const sweep = new THREE.PointLight(0xffffff, 0, 10, 1.4);
    sweep.position.set(-4, 2, 2.4);
    scene.add(sweep);

    // ---------- object ----------
    const root = new THREE.Group(); // pointer tilt + wobble
    const spinner = new THREE.Group(); // scroll spin
    root.add(spinner);
    scene.add(root);

    const glass = new THREE.MeshPhysicalMaterial({
      color: GRAPHITE,
      roughness: 0.2,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.9,
      sheen: 0.35,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(NAVY),
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xcfd8f4),
    });

    const slab = new THREE.Mesh(
      new RoundedBoxGeometry(3.4, 3.4, 0.34, 8, 0.2),
      glass,
    );
    spinner.add(slab);

    // ---------- the mark: the site portico, drawn fine ----------
    // A refined classical front rather than a chunky icon: a low pediment
    // (classical pitch), a thin cornice, four slender columns with small
    // capitals and bases, two thin steps. Sized to fill the face the way a
    // monogram would; cut in the slab's own tone with a tiny bevel so the
    // light catches the edges rather than painting the shape.
    const MARK_SIZE = 2.55; // world units for the 32-unit design grid
    const S = MARK_SIZE / 32;
    const D = 0.035; // relief depth
    const BEVEL = 0.007;
    const FACE_Z = 0.17; // slab front face
    const stone = new THREE.MeshPhysicalMaterial({
      color: 0x3e4656,
      roughness: 0.22,
      metalness: 0.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      sheen: 0.3,
      sheenColor: new THREE.Color(0x9fb4ea),
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xdde4f7),
    });
    const mark = new THREE.Group();
    const Z0 = FACE_Z - 0.01;
    const extrude = (shape: THREE.Shape) => {
      const m = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth: D - BEVEL * 2,
          bevelEnabled: true,
          bevelThickness: BEVEL,
          bevelSize: BEVEL,
          bevelSegments: 2,
        }),
        stone,
      );
      m.position.z = Z0 + BEVEL;
      mark.add(m);
    };
    // grid → world (y down in the design grid)
    const gx = (x: number) => (x - 16) * S;
    const gy = (y: number) => (16 - y) * S;
    const rect = (x: number, y: number, w: number, h: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(gx(x), gy(y));
      sh.lineTo(gx(x + w), gy(y));
      sh.lineTo(gx(x + w), gy(y + h));
      sh.lineTo(gx(x), gy(y + h));
      sh.closePath();
      extrude(sh);
    };
    // pediment: low classical triangle, drawn as a thin raked cornice (hollow)
    const tri = new THREE.Shape();
    tri.moveTo(gx(2.6), gy(11.2));
    tri.lineTo(gx(16), gy(4.6));
    tri.lineTo(gx(29.4), gy(11.2));
    tri.closePath();
    const inner = new THREE.Path();
    inner.moveTo(gx(5.6), gy(10.1));
    inner.lineTo(gx(16), gy(6.2));
    inner.lineTo(gx(26.4), gy(10.1));
    inner.closePath();
    tri.holes.push(inner);
    extrude(tri);
    // thin architrave line
    rect(3.8, 12.2, 24.4, 1.0);
    // four slender columns with small capitals and bases
    const cols = [6.6, 12.87, 19.13, 25.4];
    for (const c of cols) {
      rect(c - 1.05, 14.2, 2.1, 0.7); // capital
      rect(c - 0.6, 14.9, 1.2, 10.9); // shaft
      rect(c - 1.0, 25.8, 2.0, 0.6); // base
    }
    // two thin steps
    rect(3.8, 27.3, 24.4, 0.8);
    rect(2.0, 28.9, 28.0, 0.8);
    mark.position.y = -0.02;
    slab.add(mark);

    const HOME = new THREE.Vector3(0, 0, 0);
    const FROM = new THREE.Vector3(0, -1.4, -2.8);
    const SWING = -0.7; // rad on X while arriving

    // ---------- interaction state ----------
    const target = new THREE.Vector2(0, 0);
    const cur = new THREE.Vector2(0, 0);
    let scrollVel = 0;
    let lastY = window.scrollY;
    let spinY = 0;
    const onMove = (e: PointerEvent) => {
      target.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onLeave = () => target.set(0, 0);
    const onScroll = () => {
      const y = window.scrollY;
      scrollVel += (y - lastY) * 0.0009;
      lastY = y;
    };
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // ---------- resize ----------
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || w;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ---------- animation ----------
    const t0 = performance.now();
    const ARRIVE = 1.4;
    let raf = 0;
    let running = true;
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(el);

    function frame(now: number) {
      raf = 0;
      const t = (now - t0) / 1000;

      // Arrival
      const k = reduce ? 1 : clamp01(t / ARRIVE);
      const e = EASE_OUT(k);
      slab.position.lerpVectors(FROM, HOME, e);
      slab.rotation.x = SWING * (1 - e);

      // Pointer tilt + idle wobble (resting pose is slightly turned, like a held card)
      cur.lerp(target, 0.045);
      const settle = reduce ? 1 : clamp01((t - 0.4) / 2.2);
      const wob = reduce ? 0 : settle * 0.045;
      root.rotation.y =
        -0.3 + cur.x * 0.4 + Math.sin(t * 0.55) * wob + Math.sin(t * 0.21) * wob;
      root.rotation.x =
        0.1 - cur.y * 0.24 + Math.cos(t * 0.47) * wob * 0.7;
      root.rotation.z = -0.06;
      root.position.y = reduce ? 0 : Math.sin(t * 0.6) * 0.06;

      // Scroll spin (velocity decays)
      spinY += scrollVel;
      scrollVel *= 0.9;
      spinY *= 0.965;
      spinner.rotation.y = spinY;

      // Light sweep every 7.5s once arrived
      if (!reduce && t > ARRIVE) {
        const period = 7.5;
        const ph = ((t - ARRIVE) % period) / period;
        const active = ph < 0.24;
        if (active) {
          const q = ph / 0.24;
          sweep.position.set(-4.5 + 9 * q, 2.6 - 2 * q, 2.6);
          sweep.intensity = Math.sin(q * Math.PI) * 10;
        } else sweep.intensity = 0;
      } else sweep.intensity = 0;

      renderer.render(scene, camera);
      if (reduce && t > 0.3) return; // static: stop after first paint
      if (running) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      slab.geometry.dispose();
      mark.children.forEach((c) => (c as THREE.Mesh).geometry.dispose());
      stone.dispose();
      glass.dispose();
      envTex.dispose();
      panelTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      {/* faint floor glow, navy only as a tint */}
      <div className="pointer-events-none absolute inset-x-[14%] bottom-[4%] h-[22%] rounded-[50%] bg-[#1d3f8a] opacity-25 blur-3xl" />
      <div ref={host} className="relative size-full" />
    </div>
  );
}
