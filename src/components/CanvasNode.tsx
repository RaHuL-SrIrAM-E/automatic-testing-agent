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
        return 'from-wf-red-500 to-wf-red-600';
      case 'AUTHENTICATION':
        return 'from-wf-yellow-500 to-wf-yellow-600';
      case 'VALIDATION':
        return 'from-wf-red-600 to-wf-red-700';
      case 'DATA_MANAGEMENT':
        return 'from-wf-yellow-600 to-wf-yellow-700';
      case 'CONTROL_FLOW':
        return 'from-wf-gray-500 to-wf-gray-600';
      default:
        return 'from-wf-gray-400 to-wf-gray-500';
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
      <div className="drag-handle absolute -left-3 -top-3 w-6 h-6 bg-gradient-to-br from-wf-red-500 to-wf-red-600 rounded-full cursor-move flex items-center justify-center shadow-wf group-hover:scale-110 transition-transform duration-300">
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      {/* Delete Button */}
      <button
        className="absolute -right-3 -top-3 w-6 h-6 bg-gradient-to-br from-wf-red-500 to-wf-red-600 rounded-full flex items-center justify-center hover:from-wf-red-600 hover:to-wf-red-700 transition-all duration-300 shadow-wf hover:scale-110"
        onClick={handleDelete}
      >
        <X className="w-3 h-3 text-white" />
      </button>

      {/* Node Content */}
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(definition.category)} rounded-xl flex items-center justify-center shadow-wf`}>
          <span className="text-2xl text-white">{definition.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-wf-gray-900 truncate">
            {definition.name}
          </h3>
          <p className="text-xs text-wf-gray-600 truncate">
            {node.data.url || node.data.variableName || 'Configure...'}
          </p>
          <div className="mt-1">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-wf-gray-100 text-wf-gray-700 rounded-full">
              {definition.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Points */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-full border-2 border-white shadow-wf"></div>
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-wf-yellow-500 to-wf-red-500 rounded-full border-2 border-white shadow-wf"></div>
    </div>
  );
};
