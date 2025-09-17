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
      ref={drag}
      className={`component-card group ${isDragging ? 'opacity-50 scale-95' : ''} animate-fade-in`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(definition.category)} rounded-lg flex items-center justify-center shadow-lg icon`}>
          <span className="text-lg text-white">{definition.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {definition.name}
          </h3>
          <p className="text-xs text-gray-600 truncate">
            {definition.description}
          </p>
          <div className="mt-1.5">
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-full">
              {definition.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{ category: string; title: string }> = ({ category, title }) => {
  const components = getComponentsByCategory(category);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HTTP_REQUEST':
        return '🌐';
      case 'AUTHENTICATION':
        return '🔐';
      case 'VALIDATION':
        return '✅';
      case 'DATA_MANAGEMENT':
        return '📊';
      case 'CONTROL_FLOW':
        return '🔄';
      default:
        return '📦';
    }
  };

  return (
    <div className="mb-4 animate-slide-up">
      <div className="flex items-center space-x-3 mb-3 px-4">
        <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
          <span className="text-sm">{getCategoryIcon(category)}</span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gray-200/60"></div>
      </div>
      <div className="space-y-2 px-4">
        {components.map((definition, index) => (
          <div key={definition.type} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <ComponentCard definition={definition} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  return (
    <div className="py-3 space-y-3">
      <CategorySection category="HTTP_REQUEST" title="HTTP Requests" />
      <CategorySection category="AUTHENTICATION" title="Authentication" />
      <CategorySection category="VALIDATION" title="Validation" />
      <CategorySection category="DATA_MANAGEMENT" title="Data Management" />
      <CategorySection category="CONTROL_FLOW" title="Control Flow" />
    </div>
  );
};
