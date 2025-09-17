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
    <div className="p-6 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50 border border-wf-red-200 rounded-xl shadow-wf animate-fade-in">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-xl flex items-center justify-center shadow-wf">
          <span className="text-2xl">🚀</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-wf-gray-900">Quick Start</h3>
          <p className="text-wf-gray-700">Try the demo flow to see how it works</p>
        </div>
      </div>
      <button
        onClick={handleLoadDemo}
        className="w-full btn-primary flex items-center justify-center space-x-3"
      >
        <span className="text-lg">🎯</span>
        <span className="font-semibold">Load Demo Flow</span>
      </button>
    </div>
  );
};
