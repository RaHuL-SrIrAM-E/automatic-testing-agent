import React from 'react';
import { ComponentConnection, ComponentNode } from '../types';

interface ConnectionProps {
  connection: ComponentConnection;
  fromNode: ComponentNode;
  toNode: ComponentNode;
}

export const Connection: React.FC<ConnectionProps> = ({ connection, fromNode, toNode }) => {
  const fromX = fromNode.position.x + 100; // Center of source node
  const fromY = fromNode.position.y + 50;  // Bottom of source node
  const toX = toNode.position.x + 100;    // Center of target node
  const toY = toNode.position.y;          // Top of target node

  // Calculate control points for smooth curve
  const controlPoint1X = fromX;
  const controlPoint1Y = fromY + 50;
  const controlPoint2X = toX;
  const controlPoint2Y = toY - 50;

  const pathData = `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`;

  return (
    <g className="connection-group">
      {/* Connection line */}
      <path
        d={pathData}
        stroke="url(#connectionGradient)"
        strokeWidth="3"
        fill="none"
        className="connection-line"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Connection label */}
      <text
        x={(fromX + toX) / 2}
        y={(fromY + toY) / 2 - 10}
        textAnchor="middle"
        className="connection-label"
        fontSize="12"
        fill="#dc2626"
        fontWeight="bold"
      >
        {connection.label || `${connection.fromOutput} → ${connection.toInput}`}
      </text>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        
        {/* Arrowhead marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#f59e0b"
          />
        </marker>
      </defs>
    </g>
  );
};
