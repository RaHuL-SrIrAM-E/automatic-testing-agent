import React from 'react';
import { ComponentNode } from '../types';
import { importFlowFromJson } from '../utils/flowUtils';
import demoFlowData from '../data/demoFlow.json';

interface ExampleFlowProps {
  onLoadFlow: (nodes: ComponentNode[]) => void;
}

export const ExampleFlow: React.FC<ExampleFlowProps> = ({ onLoadFlow }) => {
  const handleLoadDemo = () => {
    const nodes = importFlowFromJson(JSON.stringify(demoFlowData));
    onLoadFlow(nodes);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">🚀</span>
        <div>
          <h3 className="text-lg font-medium text-blue-900">Quick Start</h3>
          <p className="text-sm text-blue-700">Try the demo flow to see how it works</p>
        </div>
      </div>
      <button
        onClick={handleLoadDemo}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Load Demo Flow
      </button>
    </div>
  );
};
