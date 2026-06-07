import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

interface Logo3DProps {
  svgPath?: string;
  id?: string;
  className?: string;
}

const Logo3D: React.FC<Logo3DProps> = ({
  svgPath = '/logo/scarlet-mark.svg',
  id = 'logo-3d',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let animationFrameId = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const environmentTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;

    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
    fillLight.position.set(-6, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(0, -2, -6);
    scene.add(rimLight);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      transparent: true,
      opacity: 1,
      thickness: 1.8,
      ior: 1.52,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      dispersion: 0.85,
      envMapIntensity: 1.6,
      reflectivity: 0.55,
      side: THREE.DoubleSide,
    });

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 8,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0.65,
      bevelSegments: 6,
    };

    const LOGO_TARGET_SIZE = 0.5;
    const CAMERA_FIT_PADDING = 3;

    const logoGroup = new THREE.Group();
    const disposables: THREE.BufferGeometry[] = [];

    const frameCamera = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 0.001);
      const fitHeightDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
      const distance = fitHeightDistance * CAMERA_FIT_PADDING;

      camera.position.set(center.x, center.y, center.z + distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    };

    const buildLogo = (svgData: ReturnType<SVGLoader['parse']>) => {
      svgData.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          disposables.push(geometry);
          logoGroup.add(new THREE.Mesh(geometry, glassMaterial));
        });
      });

      if (logoGroup.children.length === 0) {
        console.error('Logo3D: no extruded shapes were created from SVG');
        return;
      }

      logoGroup.scale.y = -1;

      let box = new THREE.Box3().setFromObject(logoGroup);
      let size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
      const fitScale = LOGO_TARGET_SIZE / maxDim;
      logoGroup.scale.multiplyScalar(fitScale);

      box = new THREE.Box3().setFromObject(logoGroup);
      const center = box.getCenter(new THREE.Vector3());

      logoGroup.position.set(-center.x, -center.y, -center.z);
      pivotGroup.add(logoGroup);
      frameCamera(pivotGroup);
      resize();
    };

    const loader = new SVGLoader();
    loader.load(
      svgPath,
      (data) => {
        if (disposed) return;
        buildLogo(data);
      },
      undefined,
      (error) => {
        console.error('Logo3D: failed to load SVG', error);
      }
    );

    const LOGO_VIEWPORT_RATIO = 1;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      const width = Math.round(clientWidth * LOGO_VIEWPORT_RATIO);
      const height = Math.round(clientHeight * LOGO_VIEWPORT_RATIO);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const animate = () => {
      if (disposed) return;
      pivotGroup.rotation.y -= 0.008;
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      disposables.forEach((geometry) => geometry.dispose());
      glassMaterial.dispose();
      environmentTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [svgPath]);

  return <div ref={containerRef} id={id} className={className} aria-hidden="true" />;
};

export default Logo3D;
