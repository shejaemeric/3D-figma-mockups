import * as THREE from "three";
import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  Environment,
  useGLTF,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { GUI } from "dat.gui";
import "./index.css";

// Define the FigmaEmbed component
const FigmaEmbed = (props) => (
  <Html
    position={[0, 0, -0.1]}
    transform
    occlude
    rotation-z={Math.PI}
    rotation-y={Math.PI}
    opacity={0.3}
  >
    <iframe
      className="figma"
      src={props.link}
      referrerPolicy="strict-origin-when-cross-origin"
    />
  </Html>
);

function Model(props) {
  const group = useRef();
  const { nodes, materials } = useGLTF("/phone1.glb");
  const { gui } = props;

  const [modelParams, setModelParams] = useState({
    rotationSpeed: 1,
    positionAmplitude: 1,
    scale: 2,
    rotationX: 0.4,
    rotationY: -3,
    rotationZ: 0.4,
    animationEnabled: true,
  });

  useEffect(() => {
    if (gui) {
      const modelFolder = gui.addFolder("Model");
      modelFolder.add(modelParams, "rotationSpeed", 0, 5);
      modelFolder.add(modelParams, "positionAmplitude", 0, 5);
      modelFolder.add(modelParams, "scale", 0.1, 5);
      modelFolder.add(modelParams, "rotationX", -Math.PI * 2, Math.PI * 2);
      modelFolder.add(modelParams, "rotationY", -Math.PI * 2, Math.PI * 2);
      modelFolder.add(modelParams, "rotationZ", -Math.PI * 2, Math.PI * 2);
      modelFolder.add(modelParams, "animationEnabled").name("Animation On/Off");
      modelFolder.open();
    }
  }, [gui]);

  const defaultMaterial = new THREE.MeshStandardMaterial({ color: "gray" });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: "white" });

  const materialMapping = useMemo(() => {
    const materialKeys = Object.keys(materials);
    const mapping = {};

    Object.keys(nodes).forEach((nodeName, index) => {
      if (nodeName === "Phone_PHONE_screen001_0") {
        // Skip this node as it's handled separately
      } else {
        mapping[nodeName] =
          materials[materialKeys[index % materialKeys.length]] ||
          defaultMaterial;
      }
    });

    return mapping;
  }, [nodes, materials]);

  const renderMesh = (nodeName) => {
    const node = nodes[nodeName];
    if (!node) return null;

    const geometry = node.geometry;
    const material = materialMapping[nodeName] || defaultMaterial;

    if (nodeName === "Phone_PHONE_screen001_0") {
      return (
        <group>
          <mesh
            key={nodeName}
            geometry={geometry}
            material={whiteMaterial}
            rotation-z={Math.PI}
            rotation-y={Math.PI}
            position={[0, 0, 0.0544]}
            scale={[0.2, 0.2, 0.2]}
          />
          <mesh
            key={`${nodeName}-figma`}
            geometry={geometry}
            material={whiteMaterial}
            rotation-z={Math.PI}
            rotation-y={Math.PI}
            position={[0, 0, 0.0544]}
            scale={[0.2, 0.2, 0.2]}
          >
            <FigmaEmbed link={props.link} />
          </mesh>
        </group>
      );
    }

    return (
      <mesh
        key={nodeName}
        geometry={geometry}
        material={material}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
      />
    );
  };
  useFrame((state) => {
    if (modelParams.animationEnabled) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        Math.cos(t / 2) / 20 + 0.25 + modelParams.rotationX,
        0.1 * modelParams.rotationSpeed
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(t / 4) / 20 + modelParams.rotationY,
        0.1 * modelParams.rotationSpeed
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        Math.sin(t / 8) / 20 + modelParams.rotationZ,
        0.1 * modelParams.rotationSpeed
      );
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        (2 + Math.sin(t / 2)) / 6,
        0.1 * modelParams.positionAmplitude
      );
    } else {
      group.current.rotation.x = modelParams.rotationX;
      group.current.rotation.y = modelParams.rotationY;
      group.current.rotation.z = modelParams.rotationZ;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={[modelParams.scale, modelParams.scale, modelParams.scale]}
    >
      {Object.keys(nodes).map((nodeName) => renderMesh(nodeName))}
    </group>
  );
}

function CameraControls({ gui }) {
  const { camera } = useThree();

  useEffect(() => {
    if (gui) {
      const cameraFolder = gui.addFolder("Camera");
      cameraFolder.add(camera.position, "x", -10, 10);
      cameraFolder.add(camera.position, "y", -10, 10);
      cameraFolder.add(camera.position, "z", -10, 10);
      cameraFolder
        .add(camera, "fov", 10, 100)
        .onChange(() => camera.updateProjectionMatrix());
      cameraFolder.open();
    }
  }, [gui, camera]);

  return null;
}

function LightingControls({ gui }) {
  const [lightParams, setLightParams] = useState({
    intensity: 1.5,
    color: "#ffffff",
  });

  useEffect(() => {
    if (gui) {
      const lightFolder = gui.addFolder("Lighting");
      lightFolder.add(lightParams, "intensity", 0, 5);
      lightFolder.addColor(lightParams, "color");
      lightFolder.open();
    }
  }, [gui]);

  return (
    <pointLight
      position={[10, 10, 10]}
      intensity={lightParams.intensity}
      color={lightParams.color}
    />
  );
}

function EnvironmentControls({ gui }) {
  const [preset, setPreset] = useState("city");

  useEffect(() => {
    if (gui) {
      const envFolder = gui.addFolder("Environment");
      envFolder
        .add({ preset }, "preset", ["city", "dawn", "night"])
        .onChange(setPreset);
      envFolder.open();
    }
  }, [gui]);

  return <Environment preset={preset} />;
}

function ContactShadowsControls({ gui }) {
  const [shadowParams, setShadowParams] = useState({
    position: [0, -4.5, 0],
    scale: 20,
    blur: 2,
    far: 4.5,
  });

  useEffect(() => {
    if (gui) {
      gui.hide();
      gui.close();
      gui.destroy();
      const shadowFolder = gui.addFolder("Contact Shadows");
      shadowFolder.add(shadowParams.position, "1", -10, 0).name("y position");
      shadowFolder.add(shadowParams, "scale", 1, 50);
      shadowFolder.add(shadowParams, "blur", 0, 10);
      shadowFolder.add(shadowParams, "far", 0, 10);
      shadowFolder.open();
    }
  }, [gui]);

  return (
    <ContactShadows
      position={shadowParams.position}
      scale={shadowParams.scale}
      blur={shadowParams.blur}
      far={shadowParams.far}
    />
  );
}

export default function Phone(props) {
  const [gui, setGui] = useState(null);

  useEffect(() => {
    const newGui = new GUI();
    setGui(newGui);
    newGui.hide();
    newGui.close();

    return () => {
      newGui.destroy();
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, -6], fov: 55 }}>
      <CameraControls gui={gui} />
      <LightingControls gui={gui} />
      <Suspense fallback={null}>
        <group rotation={[-0.5, -Math.PI / 6.5, 0]} position={[0, -0.5, 0]}>
          <Model link={props.link} gui={gui} />
        </group>
        <EnvironmentControls gui={gui} />
      </Suspense>
      <ContactShadowsControls gui={gui} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
