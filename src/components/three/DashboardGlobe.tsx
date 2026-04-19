"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Line, Sphere } from "@react-three/drei";

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.2; });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial color="#0f172a" emissive="#1e3a5f" emissiveIntensity={0.3} wireframe={false} shininess={30} />
      </mesh>
      <mesh ref={ref} scale={1.001}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#1d4ed8" wireframe opacity={0.08} transparent />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function RouteArcs() {
  const cities: Array<[number, number]> = [
    [40.7, -74.0], [34.0, -118.2], [41.9, -87.6], [29.7, -95.4], [47.6, -122.3],
    [33.7, -84.4], [39.9, -75.2], [25.8, -80.2], [44.9, -93.1], [39.7, -104.9],
  ];

  function latLngToVec(lat: number, lng: number, r = 2.05): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const arcs = useMemo(() => {
    const pairs: Array<[number, number][]> = [
      [cities[0], cities[2]], [cities[1], cities[4]], [cities[3], cities[5]],
      [cities[6], cities[9]], [cities[7], cities[8]],
    ];
    return pairs.map(([a, b]) => {
      const va = latLngToVec(a[0], a[1]);
      const vb = latLngToVec(b[0], b[1]);
      const mid = va.clone().add(vb).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(2.8);
      const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
      return curve.getPoints(40).map((p) => [p.x, p.y, p.z] as [number, number, number]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arcRef = useRef<any[]>([]);
  useFrame(({ clock }) => {
    const t = Math.sin(clock.elapsedTime * 1.5) * 0.5 + 0.5;
    arcRef.current.forEach((m, i) => { if (m) m.material.opacity = 0.3 + t * 0.5 * (0.5 + (i % 3) * 0.2); });
  });

  return (
    <>
      {arcs.map((points, i) => (
        <Line key={i} points={points} color="#3b82f6" lineWidth={1.5} transparent opacity={0.6} ref={(r: any) => { arcRef.current[i] = r; }} />
      ))}
      {cities.slice(0, 8).map((c, i) => {
        const v = latLngToVec(c[0], c[1], 2.1);
        return (
          <mesh key={i} position={v}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#60a5fa" />
          </mesh>
        );
      })}
    </>
  );
}

export default function DashboardGlobe() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} style={{ width: "100%", height: "100%" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} color="#3b82f6" intensity={3} />
      <pointLight position={[-5, -5, -5]} color="#1d4ed8" intensity={1} />
      <Globe />
      <RouteArcs />
    </Canvas>
  );
}
