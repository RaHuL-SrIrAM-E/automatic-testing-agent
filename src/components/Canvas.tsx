import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ComponentNode, DragItem } from '../types';
import { getComponentDefinition } from '../lib/componentDefinitions';
import { CanvasNode } from './CanvasNode';

interface CanvasProps {
  nodes: ComponentNode[];
  onNodeUpdate: (nodeId: string, updates: Partial<ComponentNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
  onAddNode: (node: ComponentNode) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  onNodeUpdate,
  onNodeDelete,
  onNodeSelect,
  selectedNodeId,
  onAddNode
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

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
            connections: []
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

  return (
    <div
      ref={(ref) => {
        if (canvasRef.current !== ref) {
          (canvasRef as any).current = ref;
        }
        drop(ref);
      }}
      className={`relative w-full h-full glass-panel rounded-2xl border-2 border-dashed ${
        isOver 
          ? 'border-wf-red-400 bg-gradient-to-br from-wf-red-50 to-wf-yellow-50 shadow-wf-lg' 
          : 'border-wf-gray-300 hover:border-wf-red-300'
      } transition-all duration-300`}
      onClick={handleCanvasClick}
    >
      {nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-2xl flex items-center justify-center shadow-wf-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-wf-gray-900 mb-3">
              Start Building Your Test Flow
            </h3>
            <p className="text-wf-gray-600 text-lg mb-6">
              Drag components from the left panel to create your Karate test
            </p>
            <div className="flex items-center justify-center space-x-2 text-wf-gray-500">
              <div className="w-2 h-2 bg-wf-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-wf-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-wf-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {nodes.map((node, index) => (
            <div key={node.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
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
      
      {/* Connection lines would go here in a more advanced implementation */}
    </div>
  );
};
