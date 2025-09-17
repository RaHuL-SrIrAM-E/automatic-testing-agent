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
    <div className="bg-gradient-to-r from-wf-red-50 to-wf-yellow-50 border border-wf-red-200 rounded-xl shadow-sm animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-wf-red-500 to-wf-red-600 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-2xl">🚀</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-wf-gray-900">Quick Start</h3>
          <p className="text-sm text-wf-gray-700">Try demo flows</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleLoadBasicDemo}
          className="w-full px-4 py-3 bg-wf-red-600 text-white rounded-lg hover:bg-wf-red-700 transition-all duration-200 flex items-center space-x-3 text-sm font-medium"
        >
          <span className="text-lg">🌐</span>
          <div className="text-left">
            <div className="font-medium">Basic API Test</div>
            <div className="text-xs opacity-90">GET request with auth & validation</div>
          </div>
        </button>
        
        <button
          onClick={handleLoadSequentialDemo}
          className="w-full px-4 py-3 bg-wf-yellow-500 text-wf-gray-900 rounded-lg hover:bg-wf-yellow-600 transition-all duration-200 flex items-center space-x-3 text-sm font-medium"
        >
          <span className="text-lg">📅</span>
          <div className="text-left">
            <div className="font-medium">Sequential Workflow</div>
            <div className="text-xs opacity-90">Timeslots → Book → Cancel</div>
          </div>
        </button>
      </div>
    </div>
  );
};
