import React, { useState } from 'react';
import { Download, Copy, Eye, EyeOff } from 'lucide-react';

interface CodePreviewProps {
  code: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-test.feature';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCode = (code: string) => {
    if (!code.trim()) {
      return '// No components added yet. Drag components to the canvas to generate Karate code.';
    }
    return code;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-wf-gray-200 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-xl flex items-center justify-center shadow-wf">
            <span className="text-white text-lg">📄</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-wf-gray-900">Generated Karate Code</h3>
            <span className="px-3 py-1 text-xs font-bold bg-wf-red-100 text-wf-red-800 rounded-full">
              Live Preview
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-wf-gray-600 hover:text-wf-red-600 hover:bg-wf-red-50 rounded-lg transition-all duration-300 hover:scale-110"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-3 text-wf-gray-600 hover:text-wf-yellow-600 hover:bg-wf-yellow-50 rounded-lg transition-all duration-300 hover:scale-110"
            title="Copy to clipboard"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 text-wf-gray-600 hover:text-wf-red-600 hover:bg-wf-red-50 rounded-lg transition-all duration-300 hover:scale-110"
            title="Download .feature file"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className={`flex-1 ${isExpanded ? 'h-96' : 'h-48'} overflow-hidden`}>
        <div className="h-full bg-gradient-to-br from-wf-gray-900 to-wf-gray-800 text-wf-gray-100 font-mono text-sm overflow-auto shadow-wf-lg">
          <div className="p-6">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {formatCode(code)}
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-3 bg-gradient-to-r from-wf-gray-100 to-wf-gray-200 border-t border-wf-gray-300 flex items-center justify-between text-sm text-wf-gray-600">
        <div className="flex items-center space-x-6">
          <span className="font-semibold">Lines: {code.split('\n').length}</span>
          <span className="font-semibold">Characters: {code.length}</span>
        </div>
        <div className="flex items-center space-x-3">
          {copied && (
            <span className="text-wf-red-600 font-bold animate-fade-in">✅ Copied!</span>
          )}
          <span className="font-semibold">Karate DSL</span>
        </div>
      </div>
    </div>
  );
};
