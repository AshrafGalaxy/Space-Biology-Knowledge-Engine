'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useDashboard } from '@/hooks/use-dashboard.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KnowledgeGraph() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { toggleConcept, activeConcepts, filteredPublications } = useDashboard();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

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
      mountRef.current.innerHTML = '';
    }

    const currentMount = mountRef.current;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    const newRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    newRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();
    
    const clickSynth = new Tone.MembraneSynth().toDestination();

    const objects: THREE.Mesh[] = [];
    const textSprites: THREE.Sprite[] = [];
    const totalNodes = graphNodes.length;
    const radius = Math.max(6, totalNodes * 0.4);
    
    const activeColor = new THREE.Color("hsl(var(--primary))");
    const inactiveColor = new THREE.Color(0x334155); // slate-700
    const hoverColor = new THREE.Color(0xf59e0b); // amber-500

    graphNodes.forEach((node, i) => {
        const angle = (i / totalNodes) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const isActive = activeConcepts.has(node.name);
        const sphereSize = isActive ? 0.7 : 0.5;
        const geometry = new THREE.SphereGeometry(sphereSize, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
          color: isActive ? activeColor : inactiveColor,
          metalness: 0.3,
          roughness: 0.6,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, 0);
        sphere.userData = { name: node.name, type: 'node', baseSize: sphereSize, baseColor: new THREE.Color().copy(material.color) };
        scene.add(sphere);
        objects.push(sphere);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        context.font = 'Bold 24px Inter';
        canvas.width = context.measureText(node.name).width + 20;
        canvas.height = 34;
        context.font = 'Bold 24px Inter';
        context.fillStyle = isActive ? `hsl(var(--primary-foreground))` : '#FFFFFF';
        context.fillText(node.name, 10, 24);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, sizeAttenuation: false });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(canvas.width / 1500, canvas.height / 1500, 1);
        sprite.position.set(x, y + (isActive ? 1.0 : 0.8), 0);
        scene.add(sprite);
        textSprites.push(sprite);
    });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const animate = () => {
      requestAnimationFrame(animate);
      newRenderer.render(scene, camera);
    };
    animate();

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
                if(hovered) {
                  (hovered as THREE.Mesh).material.color.copy(hovered.userData.baseColor);
                   hovered.scale.set(1, 1, 1);
                }
                hovered = intersects[0].object;
                (hovered as THREE.Mesh).material.color.copy(hoverColor);
                hovered.scale.set(1.2, 1.2, 1.2);
                synth.triggerAttackRelease('C5', '8n');
                currentMount.style.cursor = 'pointer';
            }
        } else {
            if (hovered) {
                (hovered as THREE.Mesh).material.color.copy(hovered.userData.baseColor);
                 hovered.scale.set(1, 1, 1);
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
  }, [graphNodes, activeConcepts]); 

  return (
    <Card className="h-96 min-h-96 flex flex-col bg-muted/20">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <BrainCircuit className="text-primary"/>
            Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 -mt-4 relative">
        <div ref={mountRef} className="w-full h-full" />
        {graphNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-background/50">
            <p>No publications found for the current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
