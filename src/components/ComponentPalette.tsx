import React from 'react';
import { useDrag } from 'react-dnd';
import { getComponentsByCategory } from '../lib/componentDefinitions';
import { DragItem } from '../types';

const ComponentCard: React.FC<{ definition: any }> = ({ definition }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: {
      type: definition.type,
      componentDefinition: definition
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`component-card ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{definition.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {definition.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {definition.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{ category: string; title: string }> = ({ category, title }) => {
  const components = getComponentsByCategory(category);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {components.map((definition) => (
          <ComponentCard key={definition.type} definition={definition} />
        ))}
      </div>
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <CategorySection category="HTTP_REQUEST" title="HTTP Requests" />
      <CategorySection category="AUTHENTICATION" title="Authentication" />
      <CategorySection category="VALIDATION" title="Validation" />
      <CategorySection category="DATA_MANAGEMENT" title="Data Management" />
      <CategorySection category="CONTROL_FLOW" title="Control Flow" />
    </div>
  );
};
