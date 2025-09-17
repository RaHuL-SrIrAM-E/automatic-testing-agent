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
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900">Generated Karate Code</h3>
          <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
            Live Preview
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Download .feature file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className={`flex-1 ${isExpanded ? 'h-96' : 'h-48'} overflow-hidden`}>
        <div className="h-full bg-gray-900 text-gray-100 font-mono text-sm overflow-auto">
          <div className="p-4">
            <pre className="whitespace-pre-wrap">
              {formatCode(code)}
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          {copied && (
            <span className="text-green-600 font-medium">Copied!</span>
          )}
          <span>Karate DSL</span>
        </div>
      </div>
    </div>
  );
};
