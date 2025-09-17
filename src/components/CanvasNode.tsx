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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'HTTP_REQUEST':
        return 'from-red-500 to-red-600';
      case 'AUTHENTICATION':
        return 'from-yellow-500 to-yellow-600';
      case 'VALIDATION':
        return 'from-red-600 to-red-700';
      case 'DATA_MANAGEMENT':
        return 'from-yellow-600 to-yellow-700';
      case 'CONTROL_FLOW':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div
      ref={(ref) => {
        if (nodeRef.current !== ref) {
          (nodeRef as any).current = ref;
        }
        drag(ref);
      }}
      className={`canvas-node absolute ${isSelected ? 'selected' : ''} ${
        isDndDragging ? 'opacity-50 scale-95' : ''
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
      <div className="drag-handle absolute -left-2 -top-2 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full cursor-move flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      {/* Delete Button */}
      <button
        className="absolute -right-2 -top-2 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:scale-110"
        onClick={handleDelete}
      >
        <X className="w-3 h-3 text-white" />
      </button>

      {/* Node Content */}
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(definition.category)} rounded-lg flex items-center justify-center shadow-lg`}>
          <span className="text-lg text-white">{definition.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {definition.name}
          </h3>
          <p className="text-xs text-gray-600 truncate">
            {node.data.url || node.data.variableName || 'Configure...'}
          </p>
          <div className="mt-1">
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-full">
              {definition.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Points */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  );
};
