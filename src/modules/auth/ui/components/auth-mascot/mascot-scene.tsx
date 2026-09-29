"use client";

import { useEffect, useRef } from "react";
import {
  Clock,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { buildOwlScene, disposeObject } from "./owl-model";

interface MascotSceneProps {
  onError?: () => void;
}

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export const MascotScene = ({ onError }: MascotSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      onError?.();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.cursor = "pointer";
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 50);

    scene.add(new HemisphereLight("#f0fdfa", "#0f766e", 1.6));
    const key = new DirectionalLight("#ffffff", 2.4);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new DirectionalLight("#a7f3d0", 1.4);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const owl = buildOwlScene();
    scene.add(owl.root, owl.shadow, ...owl.props.map((p) => p.object), ...owl.sparkles);

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = width / height;
      // Keep the whole stage (owl + props, ~5.8 x 4.4 units) in frame.
      const halfFov = MathUtils.degToRad(camera.fov / 2);
      const distanceForHeight = 2.2 / Math.tan(halfFov);
      const distanceForWidth = 2.9 / (Math.tan(halfFov) * camera.aspect);
      const distance = Math.max(distanceForHeight, distanceForWidth);
      camera.position.set(0, 0.35, distance);
      camera.lookAt(0, 0.15, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Gaze target in [-1, 1]; follows the pointer anywhere on the page,
    // or the focused form field, so the owl "watches" you fill the form.
    const gazeTarget = new Vector2();
    const gaze = new Vector2();
    let lastPointerMove = 0;
    let covering = false;
    let cover = 0;

    const lookAtPoint = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      gazeTarget.set(
        MathUtils.clamp((clientX - cx) / (window.innerWidth * 0.45), -1, 1),
        MathUtils.clamp((cy - clientY) / (window.innerHeight * 0.45), -1, 1),
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      lastPointerMove = performance.now();
      lookAtPoint(event.clientX, event.clientY);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      covering = target.type === "password";
      const rect = target.getBoundingClientRect();
      lastPointerMove = performance.now();
      lookAtPoint(rect.left + Math.min(rect.width, 120), rect.top + rect.height / 2);
    };

    const onFocusOut = () => {
      covering = false;
    };

    // Clicking the owl makes it hop and spin.
    let hopStart = -1;
    const onClick = () => {
      if (hopStart < 0) hopStart = clock.getElapsedTime();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    renderer.domElement.addEventListener("click", onClick);

    const clock = new Clock();
    let nextBlink = 1.8;
    let blinkStart = -1;
    const restQuaternion = new Quaternion();
    const wingQuaternion = new Quaternion();

    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const motion = reducedMotion ? 0 : 1;

      // Entrance pop
      const intro = reducedMotion ? 1 : Math.min(t / 0.9, 1);
      owl.root.scale.setScalar(Math.max(0.001, easeOutBack(intro)));

      // Idle wandering gaze when the pointer has been still for a while.
      if (performance.now() - lastPointerMove > 4000 && !covering) {
        gazeTarget.set(Math.sin(t * 0.35) * 0.45, Math.sin(t * 0.5) * 0.2);
      }
      gaze.lerp(gazeTarget, 1 - Math.exp(-dt * 6));
      cover = MathUtils.damp(cover, covering ? 1 : 0, 9, dt);
      const coverEased = easeInOut(cover);

      // Hop + spin
      let hopLift = 0;
      let hopSpin = 0;
      let hopping = false;
      if (hopStart >= 0) {
        const p = (t - hopStart) / 0.8;
        if (p >= 1) {
          hopStart = -1;
        } else {
          hopping = true;
          hopLift = Math.sin(p * Math.PI) * 0.55;
          hopSpin = reducedMotion ? 0 : easeInOut(p) * Math.PI * 2;
        }
      }

      owl.root.rotation.y = gaze.x * 0.45 * (1 - coverEased * 0.6) + hopSpin;
      owl.root.rotation.x = -gaze.y * 0.18 + coverEased * 0.12;

      const idleBob = Math.sin(t * 1.6) * 0.06 * motion;
      owl.bob.position.y = idleBob + hopLift;
      owl.bob.scale.set(1, 1 + Math.sin(t * 3.2) * 0.012 * motion, 1);

      const lift = idleBob + hopLift;
      owl.shadow.scale.set(1 - lift * 0.5, 0.38 * (1 - lift * 0.5), 1);
      (owl.shadow.material as { opacity: number }).opacity = 1 - lift * 0.9;

      // Pupils track the target a little further than the head turns.
      owl.pupils.forEach((pupil) => {
        pupil.rotation.y = gaze.x * 0.55;
        pupil.rotation.x = -gaze.y * 0.45;
      });

      // Blinking (and happy squint mid-hop)
      if (blinkStart < 0 && t > nextBlink) blinkStart = t;
      let eyeOpen = 1;
      if (blinkStart >= 0) {
        const p = (t - blinkStart) / 0.16;
        if (p >= 1) {
          blinkStart = -1;
          nextBlink = t + 2.4 + Math.random() * 3.2;
        } else {
          eyeOpen = 1 - Math.sin(p * Math.PI) * 0.92;
        }
      }
      if (hopping) eyeOpen = Math.min(eyeOpen, 0.3);
      owl.eyes.forEach((eye) => eye.scale.set(1, eyeOpen, 1));

      // Wings: gentle flutter, excited flaps while hopping, cover eyes on password.
      owl.wings.forEach(({ pivot, side, restPosition, coverPosition, coverQuaternion }) => {
        const flutter = hopping
          ? 0.35 + Math.sin(t * 22) * 0.3
          : 0.06 + Math.sin(t * 2.4 + side) * 0.04 * motion;
        restQuaternion.setFromAxisAngle(pivot.up.set(0, 0, 1), side * flutter);
        pivot.up.set(0, 1, 0);
        wingQuaternion.copy(restQuaternion).slerp(coverQuaternion, coverEased);
        pivot.quaternion.copy(wingQuaternion);
        pivot.position.lerpVectors(restPosition, coverPosition, coverEased);
      });

      owl.tassel.rotation.z = (Math.sin(t * 2.2) * 0.15 - gaze.x * 0.2) * (motion || 0.3);
      owl.tassel.rotation.x = Math.cos(t * 1.7) * 0.1 * motion;

      owl.props.forEach(({ object, base, phase, spin }, i) => {
        const appear = reducedMotion ? 1 : MathUtils.clamp((t - 0.35 - i * 0.15) / 0.6, 0, 1);
        object.scale.setScalar(Math.max(0.001, easeOutBack(appear)));
        object.position.set(
          base.x + Math.sin(t * 0.6 + phase) * 0.05 * motion,
          base.y + Math.sin(t * 1.1 + phase) * 0.12 * motion,
          base.z,
        );
        object.rotation.y += dt * spin * motion;
      });

      owl.sparkles.forEach((sparkle, i) => {
        const pulse = reducedMotion ? 0.8 : 0.55 + Math.sin(t * 2.6 + i * 1.7) * 0.45;
        sparkle.scale.setScalar(Math.max(0.05, pulse) * Math.min(1, intro * 1.5));
        sparkle.rotation.y += dt * 1.2 * motion;
      });

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      renderer.domElement.removeEventListener("click", onClick);
      disposeObject(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [onError]);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
};
