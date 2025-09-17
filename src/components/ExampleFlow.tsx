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
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-2xl">🚀</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Quick Start</h3>
          <p className="text-xs text-gray-600">Try demo flows</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={handleLoadBasicDemo}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center space-x-3 text-sm font-medium shadow-lg hover:shadow-xl"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-sm">🌐</span>
          </div>
          <div className="text-left">
            <div className="font-medium">Basic API Test</div>
            <div className="text-xs opacity-80">GET + Auth + Validation</div>
          </div>
        </button>
        
        <button
          onClick={handleLoadSequentialDemo}
          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center space-x-3 text-sm font-medium shadow-lg hover:shadow-xl"
        >
          <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
            <span className="text-sm">📅</span>
          </div>
          <div className="text-left">
            <div className="font-medium">Sequential Workflow</div>
            <div className="text-xs opacity-80">Timeslots → Book → Cancel</div>
          </div>
        </button>
      </div>
    </div>
  );
};
