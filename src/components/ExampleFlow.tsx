import React from 'react';
import { FlowState } from '../types';
import { importFlowStateFromJson } from '../utils/flowUtils';
import demoFlow1Data from '../data/demoFlow1.json';
import demoFlow2Data from '../data/demoFlow2.json';

interface ExampleFlowProps {
  onLoadFlow: (flowState: FlowState) => void;
}

export const ExampleFlow: React.FC<ExampleFlowProps> = ({ onLoadFlow }) => {
  const handleLoadBasicDemo = () => {
    const flowState = importFlowStateFromJson(JSON.stringify(demoFlow1Data));
    onLoadFlow(flowState);
  };

  const handleLoadSequentialDemo = () => {
    const flowState = importFlowStateFromJson(JSON.stringify(demoFlow2Data));
    onLoadFlow(flowState);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50 border border-wf-red-200 rounded-xl shadow-wf animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-xl flex items-center justify-center shadow-wf">
          <span className="text-2xl">🚀</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-wf-gray-900">Quick Start</h3>
          <p className="text-wf-gray-700">Try these demo flows to see how it works</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={handleLoadBasicDemo}
          className="w-full btn-primary flex items-center justify-center space-x-3"
        >
          <span className="text-lg">🌐</span>
          <div className="text-left">
            <div className="font-semibold">Basic API Test</div>
            <div className="text-xs opacity-90">GET request with auth & validation</div>
          </div>
        </button>
        
        <button
          onClick={handleLoadSequentialDemo}
          className="w-full btn-secondary flex items-center justify-center space-x-3"
        >
          <span className="text-lg">📅</span>
          <div className="text-left">
            <div className="font-semibold">Sequential Workflow</div>
            <div className="text-xs opacity-90">Timeslots → Book → Cancel</div>
          </div>
        </button>
      </div>
    </div>
  );
};
