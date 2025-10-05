'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KnowledgeGraph() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { concepts, toggleConcept, activeConcepts, filteredPublications } = useDashboard();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  // Derive nodes from currently filtered publications for a dynamic graph
  const graphNodes = React.useMemo(() => {
    const conceptCounts: Record<string, number> = {};
    filteredPublications.forEach(pub => {
      pub.keyConcepts.forEach(concept => {
        conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
      });
    });
    return Object.keys(conceptCounts).map(name => ({ name, count: conceptCounts[name] }));
  }, [filteredPublications]);

  useEffect(() => {
    if (!mountRef.current || graphNodes.length === 0) return;
    if (renderer) {
      // If we have a renderer, just update the scene, don't create a new one.
      // For this simplified version, we'll recreate it. In a real app, you'd manage scene objects.
      mountRef.current.innerHTML = '';
    }

    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    const newRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    newRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Sound setup
    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();
    
    const clickSynth = new Tone.MembraneSynth().toDestination();

    // Create nodes
    const objects: THREE.Mesh[] = [];
    const textSprites: THREE.Sprite[] = [];

    const totalNodes = graphNodes.length;
    const radius = Math.max(5, totalNodes * 0.5);

    graphNodes.forEach((node, i) => {
        const angle = (i / totalNodes) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const isActive = activeConcepts.has(node.name);
        const geometry = new THREE.SphereGeometry(isActive ? 0.7 : 0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: isActive ? '#BE0AFF' : '#00305E' });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, 0);
        sphere.userData = { name: node.name, type: 'node' };
        scene.add(sphere);
        objects.push(sphere);

        // Text label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        context.font = '24px Inter';
        const metrics = context.measureText(node.name);
        canvas.width = metrics.width + 20;
        canvas.height = 34;
        context.font = '24px Inter';
        context.fillStyle = isActive ? '#BE0AFF' : '#FFFFFF';
        context.fillText(node.name, 10, 24);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(canvas.width / 50, canvas.height / 50, 1);
        sprite.position.set(x, y + (isActive ? 1.1 : 0.9), 0);
        scene.add(sprite);
        textSprites.push(sprite);
    });
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      objects.forEach(obj => {
        obj.rotation.y += 0.005;
      });
      newRenderer.render(scene, camera);
    };
    animate();

    // Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;
    
    const onMouseMove = (event: MouseEvent) => {
        const rect = newRenderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            if (hovered !== intersects[0].object) {
                if(hovered) (hovered as THREE.Mesh).material.color.set(activeConcepts.has(hovered.userData.name) ? '#BE0AFF' : '#00305E');
                hovered = intersects[0].object;
                (hovered as THREE.Mesh).material.color.set('#FFA500'); // Orange hover
                synth.triggerAttackRelease('C5', '8n');
                currentMount.style.cursor = 'pointer';
            }
        } else {
            if (hovered) {
                (hovered as THREE.Mesh).material.color.set(activeConcepts.has(hovered.userData.name) ? '#BE0AFF' : '#00305E');
                currentMount.style.cursor = 'default';
            }
            hovered = null;
        }
    };
    
    const onClick = () => {
        if (hovered) {
            clickSynth.triggerAttackRelease('C3', '8n');
            toggleConcept(hovered.userData.name);
        }
    };

    currentMount.addEventListener('mousemove', onMouseMove);
    currentMount.addEventListener('click', onClick);

    // Handle resize
    const onResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        newRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (currentMount) {
        currentMount.removeEventListener('mousemove', onMouseMove);
        currentMount.removeEventListener('click', onClick);
        currentMount.innerHTML = '';
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [graphNodes, activeConcepts]); // Re-render graph when nodes or active concepts change

  return (
    <Card className="h-96 min-h-96 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <BrainCircuit />
            Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 -mt-4 relative">
        <div ref={mountRef} className="w-full h-full" />
        {graphNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-background/50">
            <p>Select publications to build graph.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
