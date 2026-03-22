import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const InteractiveOnion = ({ color, scale }) => {
  const meshRef = useRef();
  const { mouse } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Continuous rotation
    meshRef.current.rotation.y += 0.005;

    // Smooth tilt based on mouse position
    const targetX = mouse.y * 0.4;
    const targetY = mouse.x * 0.4;
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.05);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, -targetY, 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.3}
          radius={1}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      {/* Onion Top sprout approximation */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.2, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </Float>
  );
};

const OnionScene = ({ status }) => {
  // status: 'normal', 'blame', 'praise'
  const onionProps = useMemo(() => {
    switch (status) {
      case 'blame':
        return { color: '#ef4444', scale: 0.85 }; // Red & Shrunk
      case 'praise':
        return { color: '#fbbf24', scale: 1.2 };  // Gold & Grown
      default:
        return { color: '#d1d5db', scale: 1 };    // Silver/White
    }
  }, [status]);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        <InteractiveOnion color={onionProps.color} scale={onionProps.scale} />
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default OnionScene;
