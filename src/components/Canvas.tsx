import React, { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ComponentNode, DragItem, ComponentConnection } from '../types';
import { getComponentDefinition } from '../lib/componentDefinitions';
import { CanvasNode } from './CanvasNode';
import { Connection } from './Connection';
import { Move } from 'lucide-react';

interface CanvasProps {
  nodes: ComponentNode[];
  connections: ComponentConnection[];
  onNodeUpdate: (nodeId: string, updates: Partial<ComponentNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
  onAddNode: (node: ComponentNode) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  onNodeUpdate,
  onNodeDelete,
  onNodeSelect,
  selectedNodeId,
  onAddNode
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [showScrollHint, setShowScrollHint] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: DragItem, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const x = offset.x - canvasRect.left - 100; // Center the component
        const y = offset.y - canvasRect.top - 50;
        
        const definition = getComponentDefinition(item.type);
        if (definition) {
          const newNode: ComponentNode = {
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: item.type,
            position: { x, y },
            data: { ...definition.defaultData },
            connections: [],
            outputs: definition.outputs || [],
            inputs: definition.inputs || []
          };
          
          onAddNode(newNode);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleNodeMove = (nodeId: string, newPosition: { x: number; y: number }) => {
    onNodeUpdate(nodeId, { position: newPosition });
  };

  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(nodeId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onNodeSelect(null);
    }
  };

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop
    });
  };

  // Show scroll hint when there are many nodes
  useEffect(() => {
    if (nodes.length > 3) {
      setShowScrollHint(true);
      const timer = setTimeout(() => setShowScrollHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [nodes.length]);

  // Auto-scroll to show all nodes when loading a flow
  useEffect(() => {
    if (nodes.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const canvas = canvasRef.current;
      
      if (container && canvas) {
        // Center the canvas in the scroll area
        const centerX = (canvas.offsetWidth - container.clientWidth) / 2;
        const centerY = (canvas.offsetHeight - container.clientHeight) / 2;
        
        container.scrollTo({
          left: Math.max(0, centerX),
          top: Math.max(0, centerY),
          behavior: 'smooth'
        });
      }
    }
  }, [nodes.length]);

  // Calculate canvas dimensions based on node positions
  const getCanvasDimensions = () => {
    if (nodes.length === 0) {
      return { width: 600, height: 400 };
    }
    
    const maxX = Math.max(...nodes.map(node => node.position.x + 250));
    const maxY = Math.max(...nodes.map(node => node.position.y + 150));
    
    return {
      width: Math.max(maxX + 100, 600), // Minimum 600px width
      height: Math.max(maxY + 100, 400)  // Minimum 400px height
    };
  };

  const canvasDimensions = getCanvasDimensions();

  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-full overflow-auto custom-scrollbar bg-gradient-to-br from-gray-50/30 to-white/50"
        onScroll={handleScroll}
        style={{
          backgroundImage: `
            radial-gradient(circle at 15px 15px, rgba(220, 38, 38, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}
      >
        <div
          ref={(ref) => {
            if (canvasRef.current !== ref) {
              (canvasRef as any).current = ref;
            }
            drop(ref);
          }}
          className={`relative glass-panel rounded-xl border-2 border-dashed ${
            isOver 
              ? 'border-red-500 bg-gradient-to-br from-red-50/60 to-yellow-50/60 shadow-lg' 
              : 'border-gray-300/40 hover:border-red-400/60'
          } transition-all duration-300`}
          style={{
            width: Math.max(canvasDimensions.width, 600),
            height: Math.max(canvasDimensions.height, 400),
            minWidth: '600px',
            minHeight: '400px'
          }}
          onClick={handleCanvasClick}
        >
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Start Building Your Test Flow
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Drag components from the left panel to create your Karate test
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* SVG for connections */}
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                {connections.map((connection) => {
                  const fromNode = nodes.find(n => n.id === connection.fromNodeId);
                  const toNode = nodes.find(n => n.id === connection.toNodeId);
                  
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <Connection
                      key={connection.id}
                      connection={connection}
                      fromNode={fromNode}
                      toNode={toNode}
                    />
                  );
                })}
              </svg>
              
              {/* Component nodes */}
              {nodes.map((node, index) => (
                <div key={node.id} className="animate-scale-in relative" style={{ animationDelay: `${index * 0.1}s`, zIndex: 2 }}>
                  <CanvasNode
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onMove={handleNodeMove}
                    onClick={handleNodeClick}
                    onDelete={onNodeDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll indicators and controls */}
      {nodes.length > 0 && (
        <>
          {/* Scroll hint */}
          {showScrollHint && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg animate-fade-in z-10">
              <div className="flex items-center space-x-2">
                <Move className="w-4 h-4" />
                <span className="text-sm font-medium">Scroll to explore</span>
              </div>
            </div>
          )}
          
          {/* Scroll position indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs text-gray-600 z-10">
            <div className="flex items-center space-x-4">
              <span>X: {Math.round(scrollPosition.x)}</span>
              <span>Y: {Math.round(scrollPosition.y)}</span>
            </div>
          </div>
          
          {/* Canvas size indicator */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs text-gray-600 z-10">
            <div className="flex items-center space-x-2">
              <span>Canvas: {canvasDimensions.width} × {canvasDimensions.height}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
