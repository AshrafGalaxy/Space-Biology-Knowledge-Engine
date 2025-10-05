'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/use-dashboard.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BrainCircuit } from 'lucide-react';
import * as Tone from 'tone';

// Simple 2D Vector class
class Vec2 {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v: Vec2) { return new Vec2(this.x + v.x, this.y + v.y); }
  subtract(v: Vec2) { return new Vec2(this.x - v.x, this.y - v.y); }
  multiply(s: number) { return new Vec2(this.x * s, this.y * s); }
  get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  get normalized() {
    const mag = this.magnitude;
    return mag > 0 ? new Vec2(this.x / mag, this.y / mag) : new Vec2();
  }
}

// Graph Node class
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

  constructor(name: string, radius: number, isActive: boolean) {
    this.name = name;
    this.radius = radius;
    this.mass = radius * radius;
    this.pos = new Vec2(Math.random() * 200 - 100, Math.random() * 200 - 100);
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
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);

    let color = this.isActive ? colors.active : colors.inactive;
    if (this.isHovered || this.isDragged) {
      color = colors.hover;
    }
    
    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = this.isActive ? colors.activeBorder : colors.inactiveBorder;
    ctx.lineWidth = this.isHovered || this.isActive ? 3 : 1;
    ctx.stroke();

    ctx.fillStyle = this.isActive ? colors.activeText : colors.inactiveText;
    ctx.font = this.isActive ? 'bold 13px Inter' : 'normal 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, this.pos.x, this.pos.y - this.radius - 8);
  }
}

// Main Component
export function KnowledgeGraph() {
  const mountRef = useRef<HTMLCanvasElement>(null);
  const { toggleConcept, activeConcepts, filteredPublications } = useDashboard();
  const [synths, setSynths] = useState<{ hover: Tone.Synth, click: Tone.MembraneSynth } | null>(null);

  const { nodes: graphNodes, links } = React.useMemo(() => {
    const conceptCounts: Record<string, number> = {};
    const cooccurrence: Record<string, Record<string, number>> = {};
    
    filteredPublications.forEach(pub => {
      pub.keyConcepts.forEach(c1 => {
        conceptCounts[c1] = (conceptCounts[c1] || 0) + 1;
        cooccurrence[c1] = cooccurrence[c1] || {};
        pub.keyConcepts.forEach(c2 => {
          if (c1 !== c2) {
            cooccurrence[c1][c2] = (cooccurrence[c1][c2] || 0) + 1;
          }
        });
      });
    });

    const nodes = Object.entries(conceptCounts).map(([name, count]) => {
      const isActive = activeConcepts.has(name);
      const radius = 8 + Math.log2(count + 1) * (isActive ? 4 : 2);
      return new Node(name, radius, isActive);
    });

    const newLinks: { source: Node, target: Node, strength: number }[] = [];
    const minOccurrenceForLink = 2;

    Object.keys(cooccurrence).forEach(c1 => {
      Object.keys(cooccurrence[c1]).forEach(c2 => {
        if (c1 < c2 && cooccurrence[c1][c2] >= minOccurrenceForLink) {
          const source = nodes.find(n => n.name === c1);
          const target = nodes.find(n => n.name === c2);
          if (source && target) {
            newLinks.push({ source, target, strength: cooccurrence[c1][c2] });
          }
        }
      });
    });

    return { nodes, links: newLinks };
  }, [filteredPublications, activeConcepts]);
  
  useEffect(() => {
    // Initialize synths on client
    if(!synths) {
      setSynths({
          hover: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination(),
          click: new Tone.MembraneSynth().toDestination(),
      });
    }
  
    const canvas = mountRef.current;
    if (!canvas || graphNodes.length === 0 || !synths) return;
    
    const ctx = canvas.getContext('2d')!;
    let animationFrameId: number;
    let draggedNode: Node | null = null;
    let hoveredNode: Node | null = null;
    
    const dpr = window.devicePixelRatio || 1;
    let rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const colors = {
        active: 'hsl(217.2 91.2% 59.8%)', // primary
        inactive: '#334155', // slate-700
        hover: '#f59e0b', // amber-500
        activeBorder: 'hsl(217.2 91.2% 79.8%)',
        inactiveBorder: '#475569', // slate-600
        link: '#475569', // slate-600
        activeText: '#FFFFFF',
        inactiveText: '#CBD5E1', // slate-300
    };

    const applyForces = () => {
        // Repulsion force between all nodes
        for (let i = 0; i < graphNodes.length; i++) {
            for (let j = i + 1; j < graphNodes.length; j++) {
                const nodeA = graphNodes[i];
                const nodeB = graphNodes[j];
                const delta = nodeB.pos.subtract(nodeA.pos);
                const distance = delta.magnitude;
                const minDistance = nodeA.radius + nodeB.radius + 10;
                
                if (distance < minDistance) {
                    const forceMagnitude = -300 / (distance * distance); // Coulomb's law
                    const force = delta.normalized.multiply(forceMagnitude);
                    nodeA.force = nodeA.force.add(force);
                    nodeB.force = nodeB.force.subtract(force);
                }
            }
        }
        
        // Spring force for links
        links.forEach(link => {
            const { source, target, strength } = link;
            const delta = target.pos.subtract(source.pos);
            const distance = delta.magnitude;
            const idealDistance = (source.radius + target.radius) * 2;
            const displacement = distance - idealDistance;
            const forceMagnitude = displacement * 0.05 * strength; // Hooke's Law
            const force = delta.normalized.multiply(forceMagnitude);
            
            source.force = source.force.add(force);
            target.force = target.force.subtract(force);
        });

        // Centering force
        graphNodes.forEach(node => {
            const center = new Vec2(rect.width / 2, rect.height / 2);
            const toCenter = center.subtract(node.pos);
            node.force = node.force.add(toCenter.multiply(0.01));
        });
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw links
        ctx.strokeStyle = colors.link;
        ctx.lineWidth = 0.5;
        links.forEach(link => {
            ctx.beginPath();
            ctx.moveTo(link.source.pos.x, link.source.pos.y);
            ctx.lineTo(link.target.pos.x, link.target.pos.y);
            ctx.stroke();
        });

        // Draw nodes
        graphNodes.forEach(node => node.draw(ctx, colors));
    };

    let lastTime = 0;
    const animate = (time: number) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        if (dt > 0) {
            applyForces();
            graphNodes.forEach(node => node.update(dt, 0.95)); // damping
        }

        ctx.save();
        ctx.translate(0.5, 0.5); // Anti-aliasing hack
        draw();
        ctx.restore();

        animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    const getMousePos = (e: MouseEvent): Vec2 => {
        const rect = canvas.getBoundingClientRect();
        return new Vec2(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseDown = (e: MouseEvent) => {
        const mousePos = getMousePos(e);
        const node = graphNodes.find(n => mousePos.subtract(n.pos).magnitude < n.radius);
        if (node) {
            draggedNode = node;
            node.isDragged = true;
            canvas.style.cursor = 'grabbing';
        }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        const mousePos = getMousePos(e);
        if (draggedNode) {
            draggedNode.pos = mousePos;
        } else {
            const node = graphNodes.find(n => mousePos.subtract(n.pos).magnitude < n.radius);
            if (node !== hoveredNode) {
                if(hoveredNode) hoveredNode.isHovered = false;
                hoveredNode = node || null;
                if(hoveredNode) {
                    hoveredNode.isHovered = true;
                    synths.hover.triggerAttackRelease('C5', '8n');
                }
            }
            canvas.style.cursor = node ? 'pointer' : 'default';
        }
    };
    
    const handleMouseUp = () => {
        if (draggedNode && hoveredNode === draggedNode) {
            synths.click.triggerAttackRelease('C3', '8n');
            toggleConcept(draggedNode.name);
        }
        if (draggedNode) {
            draggedNode.isDragged = false;
        }
        draggedNode = null;
    };
    
    const handleMouseLeave = () => {
        if (hoveredNode) {
            hoveredNode.isHovered = false;
            hoveredNode = null;
        }
    };

    const handleResize = () => {
      rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);
    };
}, [graphNodes, links, activeConcepts, synths]);

  return (
    <Card className="h-96 min-h-96 flex flex-col bg-muted/20">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <BrainCircuit className="text-primary"/>
            Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 -mt-4 relative">
        <canvas ref={mountRef} className="w-full h-full" />
        {graphNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-background/50">
            <p>No publications found for the current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
