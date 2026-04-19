"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Stars } from "@react-three/drei";

function TruckMesh({ position, color = "#3b82f6", speed = 1 }: { position: [number, number, number]; color?: string; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const startZ = position[2];

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.z += delta * speed * 8;
    if (ref.current.position.z > 25) ref.current.position.z = startZ - 30;
  });

  return (
    <group ref={ref} position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Cab */}
      <mesh position={[0, 0.8, 1.2]}>
        <boxGeometry args={[2.2, 1.6, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Trailer */}
      <mesh position={[0, 0.7, -1.8]}>
        <boxGeometry args={[2.4, 2.0, 6.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wheels */}
      {[-1, 1].map((x) =>
        [-0.5, 0.5, -2.5, -3.5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 1.25, -0.25, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.45, 0.45, 0.3, 12]} />
            <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.5} />
          </mesh>
        ))
      )}
      {/* Headlights */}
      <pointLight position={[0, 0.8, 2.4]} color="#fef3c7" intensity={2} distance={8} />
    </group>
  );
}

function Road() {
  const ref = useRef<THREE.Mesh>(null);
  return (
    <>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
        <planeGeometry args={[20, 200]} />
        <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.9} />
      </mesh>
      {/* Lane markings */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, i * 8 - 80]}>
          <planeGeometry args={[0.15, 3.5]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  );
}

function CityScape() {
  const buildings = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        x: (i % 2 === 0 ? -1 : 1) * (6 + Math.random() * 4),
        z: -30 + i * 5,
        h: 3 + Math.random() * 8,
        w: 1.5 + Math.random() * 2,
      })),
    []
  );
  return (
    <>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.7, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w * 0.8]} />
          <meshStandardMaterial color="#0f172a" emissive="#1e3a5f" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </>
  );
}

export default function LandingHero() {
  return (
    <Canvas
      camera={{ position: [0, 4, 12], fov: 60 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" color="#020617" near={20} far={60} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-10, 5, -10]} color="#3b82f6" intensity={3} />
      <pointLight position={[10, 3, 10]} color="#1d4ed8" intensity={2} />
      <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <Road />
      <CityScape />
      <TruckMesh position={[-1.8, 0, -5]} color="#2563eb" speed={1.2} />
      <TruckMesh position={[1.8, 0, -15]} color="#1e40af" speed={0.9} />
      <TruckMesh position={[-1.8, 0, -28]} color="#3b82f6" speed={1.0} />
    </Canvas>
  );
}
