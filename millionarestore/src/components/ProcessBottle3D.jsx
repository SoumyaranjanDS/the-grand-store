import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { bottleState } from './Process';

export default function ProcessBottle3D() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = bottleState.rotationY - Math.PI / 2;
      groupRef.current.rotation.z = bottleState.rotationZ;
      groupRef.current.scale.setScalar(bottleState.scale);
    }
  });
  // Create a lathe geometry for the bottle profile
  const bottleGeometry = useMemo(() => {
    const points = [];
    // Bottle base
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(4, 0));
    points.push(new THREE.Vector2(4, 12)); // Straight body
    
    // Shoulder curve
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const r = 4 - 2.5 * (t * t); // Curve inwards
      const y = 12 + 6 * t;
      points.push(new THREE.Vector2(r, y));
    }
    
    // Neck
    points.push(new THREE.Vector2(1.5, 18));
    points.push(new THREE.Vector2(1.5, 23));
    
    // Lip
    points.push(new THREE.Vector2(1.7, 23.5));
    points.push(new THREE.Vector2(1.7, 24));
    points.push(new THREE.Vector2(1.4, 24.5));
    points.push(new THREE.Vector2(0, 24.5));

    const geo = new THREE.LatheGeometry(points, 64);
    geo.computeBoundingBox();
    const height = geo.boundingBox.max.y - geo.boundingBox.min.y;
    geo.translate(0, -height / 2, 0); // Center vertically
    return { geo, height };
  }, []);

  // Dark glass material
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#020502', // Very dark green/black
    metalness: 0.3,
    roughness: 0.1,
    transmission: 0.9,
    ior: 1.5,
    thickness: 2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }), []);

  // Foil cap material
  const foilMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111', // Black textured foil
    metalness: 0.7,
    roughness: 0.5,
  }), []);

  // Main Label material (Blue and Gold)
  const labelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d3278', // Royal Blue
    metalness: 0.2,
    roughness: 0.4,
  }), []);

  // Gold trim material
  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cfa64c', // Gold
    metalness: 0.8,
    roughness: 0.2,
  }), []);

  const { geo, height } = bottleGeometry;

  return (
    <group ref={groupRef} dispose={null} scale={0.3} rotation={[0, -Math.PI / 2, 0]}>
      {/* Bottle Body */}
      <mesh geometry={geo} material={glassMaterial} castShadow receiveShadow />
      
      {/* Foil Cap */}
      <mesh position={[0, height / 2 - 2, 0]} castShadow>
        <cylinderGeometry args={[1.55, 1.6, 5, 32]} />
        <primitive object={foilMaterial} attach="material" />
      </mesh>
      
      {/* Foil Bottom Trim (Gold) */}
      <mesh position={[0, height / 2 - 4.5, 0]}>
        <cylinderGeometry args={[1.62, 1.62, 0.2, 32]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>

      {/* Main Label */}
      <group position={[0, -2, 0]}>
        <mesh>
          <cylinderGeometry args={[4.05, 4.05, 7, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5]} />
          <primitive object={labelMaterial} attach="material" />
        </mesh>
        {/* Label Gold Border */}
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[4.06, 4.06, 0.2, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5]} />
          <primitive object={goldMaterial} attach="material" />
        </mesh>
        <mesh position={[0, -3.5, 0]}>
          <cylinderGeometry args={[4.06, 4.06, 0.2, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5]} />
          <primitive object={goldMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Neck Label */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[3.2, 3.8, 2, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5]} />
        <primitive object={labelMaterial} attach="material" />
      </mesh>
    </group>
  );
}
