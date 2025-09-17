import React, { useState, useEffect } from 'react';
import { ComponentNode } from '../types';
import { getComponentDefinition } from '../lib/componentDefinitions';

interface PropertiesPanelProps {
  selectedNode: ComponentNode | null;
  onNodeUpdate: (nodeId: string, updates: Partial<ComponentNode>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onNodeUpdate
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
    }
  }, [selectedNode]);

  const handleInputChange = (key: string, value: any) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);
    
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, { data: newFormData });
    }
  };

  const handleJsonInputChange = (key: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      handleInputChange(key, parsed);
    } catch {
      // If JSON is invalid, store as string for now
      handleInputChange(key, value);
    }
  };

  const renderPropertyInput = (property: any) => {
    const value = formData[property.key] || '';

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            className="property-input"
            value={value}
            onChange={(e) => handleInputChange(property.key, e.target.value)}
            placeholder={property.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="property-input"
            value={value}
            onChange={(e) => handleInputChange(property.key, Number(e.target.value))}
            placeholder={property.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            className="property-input"
            rows={4}
            value={value}
            onChange={(e) => handleInputChange(property.key, e.target.value)}
            placeholder={property.placeholder}
          />
        );

      case 'select':
        return (
          <select
            className="property-input"
            value={value}
            onChange={(e) => handleInputChange(property.key, e.target.value)}
          >
            <option value="">Select an option</option>
            {property.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={Boolean(value)}
              onChange={(e) => handleInputChange(property.key, e.target.checked)}
            />
            <label className="ml-2 text-sm text-gray-700">
              {property.label}
            </label>
          </div>
        );

      case 'json':
        return (
          <textarea
            className="property-input font-mono text-sm"
            rows={4}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => handleJsonInputChange(property.key, e.target.value)}
            placeholder={property.placeholder}
          />
        );

      default:
        return (
          <input
            type="text"
            className="property-input"
            value={value}
            onChange={(e) => handleInputChange(property.key, e.target.value)}
            placeholder={property.placeholder}
          />
        );
    }
  };

  if (!selectedNode) {
    return (
      <div className="p-8">
        <div className="text-center text-wf-gray-500 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-wf-red-100 to-wf-yellow-100 rounded-2xl flex items-center justify-center shadow-wf">
            <span className="text-3xl">⚙️</span>
          </div>
          <h3 className="text-xl font-bold text-wf-gray-900 mb-3">
            No Component Selected
          </h3>
          <p className="text-wf-gray-600">
            Click on a component in the canvas to configure its properties
          </p>
        </div>
      </div>
    );
  }

  const definition = getComponentDefinition(selectedNode.type);
  if (!definition) {
    return (
      <div className="p-8">
        <div className="text-center text-wf-gray-500 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-wf-red-100 to-wf-yellow-100 rounded-2xl flex items-center justify-center shadow-wf">
            <span className="text-3xl">❌</span>
          </div>
          <h3 className="text-xl font-bold text-wf-gray-900 mb-3">Unknown Component</h3>
          <p className="text-wf-gray-600">This component type is not recognized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-xl flex items-center justify-center shadow-wf">
            <span className="text-2xl text-white">{definition.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-wf-gray-900">
              {definition.name}
            </h3>
            <p className="text-wf-gray-600">
              {definition.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {definition.properties.map((property) => (
          <div key={property.key}>
            <label className="property-label">
              {property.label}
              {property.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            {renderPropertyInput(property)}
            {property.description && (
              <p className="text-xs text-gray-500 mt-1">
                {property.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Component Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Component Info</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Type: {selectedNode.type}</div>
          <div>ID: {selectedNode.id}</div>
          <div>Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})</div>
        </div>
      </div>
    </div>
  );
};
