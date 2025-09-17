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
      ref={drag}
      className={`component-card group ${isDragging ? 'opacity-50 scale-95' : ''} animate-fade-in`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(definition.category)} rounded-xl flex items-center justify-center shadow-wf icon`}>
          <span className="text-2xl text-white">{definition.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-wf-gray-900 truncate">
            {definition.name}
          </h3>
          <p className="text-xs text-wf-gray-600 truncate">
            {definition.description}
          </p>
          <div className="mt-1">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-wf-gray-100 text-wf-gray-700 rounded-full">
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
    <div className="mb-6 animate-slide-up">
      <div className="flex items-center space-x-3 mb-3 px-6">
        <div className="w-6 h-6 bg-gradient-to-br from-wf-red-500 to-wf-red-600 rounded-lg flex items-center justify-center">
          <span className="text-lg">{getCategoryIcon(category)}</span>
        </div>
        <h3 className="text-sm font-bold text-wf-gray-900 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex-1 h-px bg-wf-gray-200"></div>
      </div>
      <div className="space-y-2 px-6">
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
    <div className="py-4 space-y-4">
      <CategorySection category="HTTP_REQUEST" title="HTTP Requests" />
      <CategorySection category="AUTHENTICATION" title="Authentication" />
      <CategorySection category="VALIDATION" title="Validation" />
      <CategorySection category="DATA_MANAGEMENT" title="Data Management" />
      <CategorySection category="CONTROL_FLOW" title="Control Flow" />
    </div>
  );
};
