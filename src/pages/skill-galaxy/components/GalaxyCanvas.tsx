import { useRef, useEffect, useState } from 'react';
import { motion, MotionValue } from 'framer-motion';
import { SkillNode, LayoutType } from '../types';

interface GalaxyCanvasProps {
  nodes: SkillNode[];
  layout: LayoutType;
  performanceMode: boolean;
  hoveredNode: SkillNode | null;
  selectedNode: SkillNode | null;
  onNodeClick: (node: SkillNode) => void;
  onNodeDoubleClick: (node: SkillNode) => void;
  onNodeHover: (node: SkillNode | null) => void;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

export const GalaxyCanvas = ({
  nodes,
  layout,
  performanceMode,
  hoveredNode,
  selectedNode,
  onNodeClick,
  onNodeDoubleClick,
  onNodeHover,
  mouseX,
  mouseY
}: GalaxyCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
        canvasRef.current.width = rect.width * window.devicePixelRatio;
        canvasRef.current.height = rect.height * window.devicePixelRatio;
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate node positions based on layout
  const calculateNodePositions = (nodes: SkillNode[], layout: LayoutType) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    switch (layout) {
      case 'force-directed':
        return nodes.map((node, index) => {
          const angle = (index / nodes.length) * Math.PI * 2;
          const radius = 150 + (node.xp / 10);
          return {
            ...node,
            position: {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              z: 0
            }
          };
        });
        
      case 'cluster':
        const categories = ['Technical', 'Soft Skills', 'Additional Skills', 'Achievements', 'Learning'];
        return nodes.map(node => {
          const categoryIndex = categories.indexOf(node.category);
          const categoryAngle = (categoryIndex / categories.length) * Math.PI * 2;
          const categoryRadius = 200;
          const categoryCenter = {
            x: centerX + Math.cos(categoryAngle) * categoryRadius,
            y: centerY + Math.sin(categoryAngle) * categoryRadius
          };
          
          const nodesInCategory = nodes.filter(n => n.category === node.category);
          const nodeIndex = nodesInCategory.indexOf(node);
          const nodeAngle = (nodeIndex / nodesInCategory.length) * Math.PI * 2;
          const nodeRadius = 50 + (node.score / 5);
          
          return {
            ...node,
            position: {
              x: categoryCenter.x + Math.cos(nodeAngle) * nodeRadius,
              y: categoryCenter.y + Math.sin(nodeAngle) * nodeRadius,
              z: 0
            }
          };
        });
        
      case 'layered':
        const levels = ['Easy', 'Medium', 'Hard'];
        return nodes.map(node => {
          const level = node.score < 40 ? 0 : node.score < 70 ? 1 : 2;
          const levelY = centerY + (level - 1) * 150;
          const nodesInLevel = nodes.filter(n => {
            const nLevel = n.score < 40 ? 0 : n.score < 70 ? 1 : 2;
            return nLevel === level;
          });
          const nodeIndex = nodesInLevel.indexOf(node);
          const spacing = Math.min(canvasSize.width / (nodesInLevel.length + 1), 100);
          
          return {
            ...node,
            position: {
              x: spacing * (nodeIndex + 1),
              y: levelY,
              z: 0
            }
          };
        });
        
      default:
        return nodes;
    }
  };

  const positionedNodes = calculateNodePositions(nodes, layout);

  // Render the galaxy
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      
      // Apply camera transform
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // Draw central hub (crystal)
      const hubX = canvasSize.width / 2;
      const hubY = canvasSize.height / 2;
      
      // Hub glow
      const hubGradient = ctx.createRadialGradient(hubX, hubY, 0, hubX, hubY, 60);
      hubGradient.addColorStop(0, 'rgba(37, 99, 235, 0.8)');
      hubGradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.4)');
      hubGradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
      
      ctx.fillStyle = hubGradient;
      ctx.fillRect(hubX - 60, hubY - 60, 120, 120);
      
      // Hub crystal
      ctx.beginPath();
      ctx.moveTo(hubX, hubY - 30);
      ctx.lineTo(hubX + 25, hubY - 10);
      ctx.lineTo(hubX + 15, hubY + 20);
      ctx.lineTo(hubX - 15, hubY + 20);
      ctx.lineTo(hubX - 25, hubY - 10);
      ctx.closePath();
      
      const crystalGradient = ctx.createLinearGradient(hubX - 25, hubY - 30, hubX + 25, hubY + 20);
      crystalGradient.addColorStop(0, 'rgba(147, 197, 253, 0.9)');
      crystalGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.7)');
      crystalGradient.addColorStop(1, 'rgba(29, 78, 216, 0.9)');
      
      ctx.fillStyle = crystalGradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw links between hub and nodes
      positionedNodes.forEach(node => {
        ctx.beginPath();
        ctx.moveTo(hubX, hubY);
        ctx.lineTo(node.position.x, node.position.y);
        
        const linkGradient = ctx.createLinearGradient(
          hubX, hubY, node.position.x, node.position.y
        );
        linkGradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        linkGradient.addColorStop(1, 'rgba(245, 158, 11, 0.2)');
        
        ctx.strokeStyle = linkGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw nodes
      positionedNodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const scale = isHovered ? 1.2 : isSelected ? 1.1 : 1;
        const radius = (20 + node.xp / 10) * scale;
        
        // Node glow
        if (isHovered || isSelected) {
          const glowGradient = ctx.createRadialGradient(
            node.position.x, node.position.y, 0,
            node.position.x, node.position.y, radius + 20
          );
          glowGradient.addColorStop(0, getCategoryColor(node.category, 0.6));
          glowGradient.addColorStop(1, getCategoryColor(node.category, 0));
          
          ctx.fillStyle = glowGradient;
          ctx.fillRect(
            node.position.x - radius - 20,
            node.position.y - radius - 20,
            (radius + 20) * 2,
            (radius + 20) * 2
          );
        }
        
        // Node body
        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, radius, 0, Math.PI * 2);
        
        const nodeGradient = ctx.createRadialGradient(
          node.position.x - radius * 0.3,
          node.position.y - radius * 0.3,
          0,
          node.position.x,
          node.position.y,
          radius
        );
        nodeGradient.addColorStop(0, getCategoryColor(node.category, 0.9));
        nodeGradient.addColorStop(0.7, getCategoryColor(node.category, 0.6));
        nodeGradient.addColorStop(1, getCategoryColor(node.category, 0.3));
        
        ctx.fillStyle = nodeGradient;
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Score indicator
        const scoreAngle = (node.score / 100) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, radius + 5, -Math.PI / 2, scoreAngle);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Node label
        if (camera.zoom > 0.5) {
          ctx.fillStyle = 'white';
          ctx.font = `${12 * scale}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name,
            node.position.x,
            node.position.y + radius + 20
          );
        }
      });

      ctx.restore();
    };

    render();
  }, [positionedNodes, camera, hoveredNode, selectedNode, canvasSize]);

  const getCategoryColor = (category: string, alpha: number = 1): string => {
    const colors = {
      'Technical': `rgba(59, 130, 246, ${alpha})`, // Blue
      'Soft Skills': `rgba(245, 158, 11, ${alpha})`, // Gold
      'Additional Skills': `rgba(147, 51, 234, ${alpha})`, // Purple
      'Achievements': `rgba(34, 197, 94, ${alpha})`, // Emerald
      'Learning': `rgba(236, 72, 153, ${alpha})` // Pink
    };
    return colors[category as keyof typeof colors] || `rgba(156, 163, 175, ${alpha})`;
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      setCamera(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    } else {
      // Check for node hover
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const hoveredNode = positionedNodes.find(node => {
          const dx = mouseX - (node.position.x + camera.x) * camera.zoom;
          const dy = mouseY - (node.position.y + camera.y) * camera.zoom;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radius = (20 + node.xp / 10) * camera.zoom;
          return distance <= radius;
        });
        
        onNodeHover(hoveredNode || null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const clickedNode = positionedNodes.find(node => {
        const dx = mouseX - (node.position.x + camera.x) * camera.zoom;
        const dy = mouseY - (node.position.y + camera.y) * camera.zoom;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = (20 + node.xp / 10) * camera.zoom;
        return distance <= radius;
      });
      
      if (clickedNode) {
        onNodeClick(clickedNode);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const clickedNode = positionedNodes.find(node => {
        const dx = mouseX - (node.position.x + camera.x) * camera.zoom;
        const dy = mouseY - (node.position.y + camera.y) * camera.zoom;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = (20 + node.xp / 10) * camera.zoom;
        return distance <= radius;
      });
      
      if (clickedNode) {
        onNodeDoubleClick(clickedNode);
        // Center camera on node
        setCamera({
          x: canvasSize.width / 2 - clickedNode.position.x,
          y: canvasSize.height / 2 - clickedNode.position.y,
          zoom: 1.5
        });
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * zoomFactor))
    }));
  };

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ width: '100%', height: '100%' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};