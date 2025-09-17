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
      className={`relative w-full h-full bg-white rounded-lg border-2 border-dashed ${
        isOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300'
      } transition-colors`}
      onClick={handleCanvasClick}
    >
      {nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start Building Your Test Flow
            </h3>
            <p className="text-gray-500">
              Drag components from the left panel to create your Karate test
            </p>
          </div>
        </div>
      ) : (
        nodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onMove={handleNodeMove}
            onClick={handleNodeClick}
            onDelete={onNodeDelete}
          />
        ))
      )}
      
      {/* Connection lines would go here in a more advanced implementation */}
    </div>
  );
};
