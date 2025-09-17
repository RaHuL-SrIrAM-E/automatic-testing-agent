import React, { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ComponentNode, DragItem, ComponentConnection } from '../types';
import { getComponentDefinition } from '../lib/componentDefinitions';
import { CanvasNode } from './CanvasNode';
import { Connection } from './Connection';
import { Move, ZoomIn, ZoomOut } from 'lucide-react';

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
      return { width: '100%', height: '100%' };
    }
    
    const maxX = Math.max(...nodes.map(node => node.position.x + 300));
    const maxY = Math.max(...nodes.map(node => node.position.y + 200));
    
    return {
      width: Math.max(maxX + 100, 1200), // Minimum 1200px width
      height: Math.max(maxY + 100, 800)  // Minimum 800px height
    };
  };

  const canvasDimensions = getCanvasDimensions();

  return (
    <div className="w-full h-full rounded-xl border-2 border-dashed border-wf-gray-300 hover:border-wf-red-400 transition-all duration-300 overflow-hidden relative bg-gradient-to-br from-wf-gray-50/50 to-white">
      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-full overflow-auto custom-scrollbar"
        onScroll={handleScroll}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20px 20px, rgba(220, 38, 38, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
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
              ? 'border-wf-red-500 bg-gradient-to-br from-wf-red-50/80 to-wf-yellow-50/80 shadow-lg' 
              : 'border-wf-gray-300/50 hover:border-wf-red-400'
          } transition-all duration-300`}
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            minWidth: '1200px',
            minHeight: '800px'
          }}
          onClick={handleCanvasClick}
        >
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-wf-red-500 to-wf-red-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-4xl">🎯</span>
                </div>
                <h3 className="text-3xl font-bold text-wf-gray-900 mb-4">
                  Start Building Your Test Flow
                </h3>
                <p className="text-wf-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Drag components from the left panel to create your Karate test
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-wf-red-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-wf-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-3 h-3 bg-wf-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
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
            <div className="absolute top-4 right-4 bg-wf-red-600 text-white px-4 py-2 rounded-lg shadow-wf-lg animate-fade-in z-10">
              <div className="flex items-center space-x-2">
                <Move className="w-4 h-4" />
                <span className="text-sm font-medium">Scroll to explore the full flow</span>
              </div>
            </div>
          )}
          
          {/* Scroll position indicator */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-wf-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs text-wf-gray-600 z-10">
            <div className="flex items-center space-x-4">
              <span>X: {Math.round(scrollPosition.x)}</span>
              <span>Y: {Math.round(scrollPosition.y)}</span>
            </div>
          </div>
          
          {/* Canvas size indicator */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-wf-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs text-wf-gray-600 z-10">
            <div className="flex items-center space-x-2">
              <span>Canvas: {canvasDimensions.width} × {canvasDimensions.height}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
