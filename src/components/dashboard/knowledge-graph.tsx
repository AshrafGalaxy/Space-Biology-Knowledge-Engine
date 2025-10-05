'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDashboard } from '@/hooks/use-dashboard.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BrainCircuit } from 'lucide-react';
import * as Tone from 'tone';

// --- Vector, Node, and Simulation Classes ---

class Vec2 {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add = (v: Vec2) => new Vec2(this.x + v.x, this.y + v.y);
  subtract = (v: Vec2) => new Vec2(this.x - v.x, this.y - v.y);
  multiply = (s: number) => new Vec2(this.x * s, this.y * s);
  get magnitude() {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    return isNaN(mag) ? 0 : mag;
  }
  get normalized() {
    const mag = this.magnitude;
    return mag > 0 ? new Vec2(this.x / mag, this.y / mag) : new Vec2();
  }
}

class Node {
  pos: Vec2;
  vel: Vec2;
  force: Vec2;
  mass: number;
  name: string;
  radius: number;
  isHovered = false;
  isDragged = false;
  isActive = false;

  constructor(name: string, radius: number, isActive: boolean, canvasWidth: number, canvasHeight: number) {
    this.name = name;
    this.radius = radius;
    this.mass = Math.PI * radius * radius;
    this.pos = new Vec2(canvasWidth / 2 + (Math.random() - 0.5) * 100, canvasHeight / 2 + (Math.random() - 0.5) * 100);
    this.vel = new Vec2();
    this.force = new Vec2();
    this.isActive = isActive;
  }

  update(dt: number, damping: number) {
    if (this.isDragged) return;
    const acceleration = this.force.multiply(1 / this.mass);
    this.vel = this.vel.add(acceleration.multiply(dt));
    this.vel = this.vel.multiply(damping);
    this.pos = this.pos.add(this.vel.multiply(dt));
    this.force = new Vec2();
  }

  draw(ctx: CanvasRenderingContext2D, colors: Record<string, string>) {
    ctx.save();
    
    // Determine color and style based on state
    let color = this.isActive ? colors.active : colors.inactive;
    if (this.isHovered || this.isDragged) {
      color = colors.hover;
    }
    
    // Draw the node circle
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw the border
    ctx.strokeStyle = this.isActive ? colors.activeBorder : colors.inactiveBorder;
    ctx.lineWidth = this.isHovered || this.isActive ? 2 : 1;
    ctx.stroke();

    // Draw the text
    ctx.fillStyle = this.isActive ? colors.activeText : colors.inactiveText;
    ctx.font = this.isActive ? 'bold 13px Inter' : 'normal 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, this.pos.x, this.pos.y + this.radius + 10);
    
    ctx.restore();
  }
}

// --- Main Component ---
export function KnowledgeGraph() {
  const mountRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleConcept, activeConcepts, filteredPublications } = useDashboard();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<{ source: Node; target: Node; strength: number }[]>([]);
  const [synths, setSynths] = useState<{ hover: Tone.Synth, click: Tone.MembraneSynth } | null>(null);

  useEffect(() => {
    // Client-side Tone.js initialization
    if (typeof window !== 'undefined' && !synths) {
      try {
        const hoverSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination();
        const clickSynth = new Tone.MembraneSynth().toDestination();
        setSynths({ hover: hoverSynth, click: clickSynth });
      } catch (e) {
        console.error("Failed to initialize Tone.js synths:", e);
      }
    }
  }, [synths]);

  // Debounced recreation of nodes and links
  useEffect(() => {
    const canvas = mountRef.current;
    if (!canvas) return;

    const conceptCounts: Record<string, number> = {};
    const cooccurrence: Record<string, Record<string, number>> = {};
    
    filteredPublications.forEach(pub => {
      (pub.keyConcepts || []).forEach(c1 => {
        conceptCounts[c1] = (conceptCounts[c1] || 0) + 1;
        cooccurrence[c1] = cooccurrence[c1] || {};
        (pub.keyConcepts || []).forEach(c2 => {
          if (c1 < c2) { // Ensure pairs are unique and ordered
             cooccurrence[c1][c2] = (cooccurrence[c1][c2] || 0) + 1;
          }
        });
      });
    });

    const newNodes = Object.entries(conceptCounts).map(([name, count]) => {
      const isActive = activeConcepts.has(name);
      const radius = 8 + Math.log2(count + 1) * (isActive ? 4 : 2);
      return new Node(name, radius, isActive, canvas.width, canvas.height);
    });

    const newLinks: { source: Node, target: Node, strength: number }[] = [];
    const minOccurrenceForLink = 2;

    Object.keys(cooccurrence).forEach(c1 => {
      Object.keys(cooccurrence[c1]).forEach(c2 => {
        if (cooccurrence[c1][c2] >= minOccurrenceForLink) {
          const source = newNodes.find(n => n.name === c1);
          const target = newNodes.find(n => n.name === c2);
          if (source && target) {
            newLinks.push({ source, target, strength: cooccurrence[c1][c2] });
          }
        }
      });
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [filteredPublications, activeConcepts]);
  
  // The main simulation and rendering loop
  useEffect(() => {
    const canvas = mountRef.current;
    const container = containerRef.current;
    if (!canvas || !container || nodes.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let draggedNode: Node | null = null;
    let hoveredNode: Node | null = null;
    
    let canvasRect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
        canvasRect = container.getBoundingClientRect();
        canvas.width = canvasRect.width * dpr;
        canvas.height = canvasRect.height * dpr;
        ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    const colors = {
        active: 'hsl(217.2 91.2% 59.8%)', // primary
        inactive: '#334155', // slate-700
        hover: 'hsl(47.9 95.8% 53.1%)', // amber-500
        activeBorder: 'hsl(217.2 91.2% 79.8%)',
        inactiveBorder: '#475569', // slate-600
        link: '#475569',
        activeText: '#FFFFFF',
        inactiveText: '#CBD5E1', // slate-300
    };

    const applyForces = () => {
        const repulsionConstant = 1000;
        const springConstant = 0.05;
        const centeringConstant = 0.00005;

        // Repulsion force between all nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                const delta = nodeB.pos.subtract(nodeA.pos);
                let distance = delta.magnitude;
                if (distance < 1) distance = 1;
                
                const forceMagnitude = -repulsionConstant / (distance);
                const force = delta.normalized.multiply(forceMagnitude);

                nodeA.force = nodeA.force.add(force);
                nodeB.force = nodeB.force.subtract(force);
            }
        }
        
        // Spring force for links
        links.forEach(link => {
            const { source, target, strength } = link;
            const delta = target.pos.subtract(source.pos);
            const distance = delta.magnitude;
            if (distance === 0) return;
            const idealDistance = 150 - Math.log(strength) * 10;
            const displacement = distance - idealDistance;
            const forceMagnitude = displacement * springConstant;
            const force = delta.normalized.multiply(forceMagnitude);
            
            source.force = source.force.add(force);
            target.force = target.force.subtract(force);
        });

        // Centering force
        nodes.forEach(node => {
            const center = new Vec2(canvasRect.width / 2, canvasRect.height / 2);
            const toCenter = center.subtract(node.pos);
            node.force = node.force.add(toCenter.multiply(node.mass * centeringConstant));
        });
    };

    const enforceBoundaries = (node: Node) => {
        const bounceDamping = -0.5;
        if (node.pos.x - node.radius < 0) {
            node.pos.x = node.radius;
            node.vel.x *= bounceDamping;
        }
        if (node.pos.x + node.radius > canvasRect.width) {
            node.pos.x = canvasRect.width - node.radius;
            node.vel.x *= bounceDamping;
        }
        if (node.pos.y - node.radius < 0) {
            node.pos.y = node.radius;
            node.vel.y *= bounceDamping;
        }
        if (node.pos.y + node.radius > canvasRect.height) {
            node.pos.y = canvasRect.height - node.radius;
            node.vel.y *= bounceDamping;
        }
    };


    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw links
        ctx.save();
        links.forEach(link => {
            const { source, target } = link;
            const isHovered = hoveredNode && (hoveredNode === source || hoveredNode === target);
            ctx.strokeStyle = colors.link;
            ctx.globalAlpha = isHovered ? 0.8 : 0.2;
            ctx.lineWidth = isHovered ? 1.5 : 0.5;
            ctx.beginPath();
            ctx.moveTo(source.pos.x, source.pos.y);
            ctx.lineTo(target.pos.x, target.pos.y);
            ctx.stroke();
        });
        ctx.restore();

        // Draw nodes
        nodes.forEach(node => node.draw(ctx, colors));
    };

    let lastTime = 0;
    const animate = (time: number) => {
        const dt = (time - lastTime) / 16.67 || 0; // Normalize to 60fps
        lastTime = time;

        applyForces();
        nodes.forEach(node => {
            node.update(dt, 0.95); // 0.95 is damping
            enforceBoundaries(node);
        });

        draw();
        animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    const getMousePos = (e: MouseEvent): Vec2 => {
        const rect = canvas.getBoundingClientRect();
        return new Vec2((e.clientX - rect.left), (e.clientY - rect.top));
    };
    
    let dragStartTime = 0;

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        const mousePos = getMousePos(e);
        // Find node from top-most layer
        const node = [...nodes].reverse().find(n => mousePos.subtract(n.pos).magnitude < n.radius + 5);
        if (node) {
            draggedNode = node;
            node.isDragged = true;
            dragStartTime = Date.now();
            canvas.style.cursor = 'grabbing';
        }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const mousePos = getMousePos(e);
        if (draggedNode) {
            draggedNode.pos = mousePos;
        } else {
            const node = [...nodes].reverse().find(n => mousePos.subtract(n.pos).magnitude < n.radius + 5);
            if (node !== hoveredNode) {
                if(hoveredNode) hoveredNode.isHovered = false;
                hoveredNode = node || null;
                if(hoveredNode) {
                    hoveredNode.isHovered = true;
                    if(synths?.hover.state === 'stopped') synths.hover.triggerAttack('C5');
                } else {
                    if (synths?.hover.state === 'started') synths.hover.triggerRelease();
                }
            }
            canvas.style.cursor = node ? 'pointer' : 'default';
        }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        const dragDuration = Date.now() - dragStartTime;

        if (draggedNode && dragDuration < 200) { // It's a click, not a drag
            if(synths) synths.click.triggerAttackRelease('C3', '8n');
            toggleConcept(draggedNode.name);
        }

        if (draggedNode) {
            draggedNode.isDragged = false;
            draggedNode = null;
        }
        canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        if (synths?.hover.state === 'started') synths.hover.triggerRelease();
    };
    
    const handleMouseLeave = () => {
        if (hoveredNode) {
            hoveredNode.isHovered = false;
            hoveredNode = null;
        }
        if (draggedNode) {
            draggedNode.isDragged = false;
            draggedNode = null;
        }
        canvas.style.cursor = 'default';
        if (synths?.hover.state === 'started') synths.hover.triggerRelease();
    };

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(container);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        if (canvas) {
          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
        synths?.hover.dispose();
        synths?.click.dispose();
    };
}, [nodes, links, toggleConcept, synths]);

  return (
    <Card className="flex flex-col bg-muted/20">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <BrainCircuit className="text-primary"/>
            Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent ref={containerRef} className="flex-1 relative w-full h-full min-h-[400px] aspect-video">
        <canvas ref={mountRef} className="absolute top-0 left-0 w-full h-full" />
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-background/50 backdrop-blur-sm rounded-b-lg">
            <p>No publications found for the current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
