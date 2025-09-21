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

  const handleArrayAdd = (key: string) => {
    const currentArray = formData[key] || [];
    const newItem = {
      variableName: '',
      jsonPath: '',
      defaultValue: ''
    };
    handleInputChange(key, [...currentArray, newItem]);
  };

  const handleArrayRemove = (key: string, index: number) => {
    const currentArray = formData[key] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    handleInputChange(key, newArray);
  };

  const handleArrayItemChange = (key: string, index: number, fieldKey: string, value: string) => {
    const currentArray = formData[key] || [];
    const newArray = [...currentArray];
    newArray[index] = { ...newArray[index], [fieldKey]: value };
    handleInputChange(key, newArray);
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

      case 'array':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="property-label">{property.label}</label>
              <button
                type="button"
                onClick={() => handleArrayAdd(property.key)}
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {(value || []).map((item: any, index: number) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Extraction {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove(property.key, index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(property.arrayItemSchema || {}).map(([fieldKey, fieldSchema]: [string, any]) => (
                      <div key={fieldKey}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {fieldSchema.label}
                        </label>
                        <input
                          type="text"
                          className="property-input text-sm"
                          value={item[fieldKey] || ''}
                          onChange={(e) => handleArrayItemChange(property.key, index, fieldKey, e.target.value)}
                          placeholder={fieldSchema.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!value || value.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No extractions configured. Click "Add Item" to get started.
                </div>
              )}
            </div>
          </div>
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
      <div className="p-6">
        <div className="text-center text-gray-500 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-100 to-yellow-100 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">⚙️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            No Component Selected
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Click on a component in the canvas to configure its properties
          </p>
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-100">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Drag components from the left panel to the canvas to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  const definition = getComponentDefinition(selectedNode.type);
  if (!definition) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-100 to-yellow-100 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">❌</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Unknown Component</h3>
          <p className="text-sm text-gray-600 leading-relaxed">This component type is not recognized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg text-white">{definition.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {definition.name}
            </h3>
            <p className="text-sm text-gray-600">
              {definition.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
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
      <div className="mt-8 pt-6 border-t border-gray-200/60">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Component Info</h4>
        <div className="text-xs text-gray-500 space-y-2 bg-gray-50/50 p-3 rounded-lg">
          <div>Type: {selectedNode.type}</div>
          <div>ID: {selectedNode.id}</div>
          <div>Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})</div>
        </div>
      </div>
    </div>
  );
};
