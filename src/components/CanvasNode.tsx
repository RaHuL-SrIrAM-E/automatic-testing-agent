import React, { useState, useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { ComponentNode } from '../types';
import { getComponentDefinition } from '../lib/componentDefinitions';
import { X, GripVertical } from 'lucide-react';

interface CanvasNodeProps {
  node: ComponentNode;
  isSelected: boolean;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onClick: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  node,
  isSelected,
  onMove,
  onClick,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const definition = getComponentDefinition(node.type);

  const [{ isDragging: isDndDragging }, drag] = useDrag({
    type: 'canvas-node',
    item: { nodeId: node.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === nodeRef.current || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      onMove(node.id, newPosition);
    }
  }, [isDragging, dragStart, onMove, node.id]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  if (!definition) {
    return null;
  }

  return (
    <div
      ref={(ref) => {
        if (nodeRef.current !== ref) {
          (nodeRef as any).current = ref;
        }
        drag(ref);
      }}
      className={`canvas-node absolute ${isSelected ? 'selected' : ''} ${
        isDndDragging ? 'opacity-50' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Drag Handle */}
      <div className="drag-handle absolute -left-2 -top-2 w-4 h-4 bg-gray-400 rounded-full cursor-move flex items-center justify-center">
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      {/* Delete Button */}
      <button
        className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        onClick={handleDelete}
      >
        <X className="w-3 h-3 text-white" />
      </button>

      {/* Node Content */}
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{definition.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {definition.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {node.data.url || node.data.variableName || 'Configure...'}
          </p>
        </div>
      </div>

      {/* Connection Points */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
    </div>
  );
};
