import * as THREE from "three";
import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Html,
  Environment,
  useGLTF,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import "./index.css"; // Ensure this is imported to apply the styles

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

  const defaultMaterial = new THREE.MeshStandardMaterial({ color: "gray" });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: "white" });

  const materialMapping = useMemo(() => {
    const materialKeys = Object.keys(materials);
    const mapping = {};

    Object.keys(nodes).forEach((nodeName, index) => {
      if (nodeName === "Phone_PHONE_screen001_0") {
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
            material={whiteMaterial} // Explicitly assign white material here
            rotation-z={Math.PI}
            rotation-y={Math.PI}
            position={[0, 0, 0.0544]}
            scale={[0.2, 0.2, 0.2]}
          >
            {/* <FigmaEmbed /> */}
          </mesh>{" "}
          <mesh
            key={nodeName}
            geometry={geometry}
            material={whiteMaterial} // Explicitly assign white material here
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
    const t = state.clock.getElapsedTime();
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      Math.cos(t / 2) / 20 + 0.25,
      0.1
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      Math.sin(t / 4) / 20,
      0.1
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      Math.sin(t / 8) / 20,
      0.1
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      (2 + Math.sin(t / 2)) / 6,
      0.1
    );
  });

  return (
    <group ref={group} {...props} dispose={null} scale={[2, 2, 2]}>
      {Object.keys(nodes).map((nodeName) => renderMesh(nodeName))}
    </group>
  );
}

export default function Phone(props) {
  return (
    <Canvas camera={{ position: [0, 0, -5], fov: 55 }}>
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <group rotation={[-0.5, -Math.PI / 6.5, 0]} position={[0, -0.5, 0]}>
          <Model link={props.link} />
        </group>
        <Environment preset="city" />
      </Suspense>
      <ContactShadows position={[0, -4.5, 0]} scale={20} blur={2} far={4.5} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
