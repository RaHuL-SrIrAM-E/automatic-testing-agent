import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { SwaggerParser } from '../lib/swaggerParser';
import { ComponentNode } from '../types';

interface SwaggerImporterProps {
  onImportSwagger: (nodes: ComponentNode[], documentName: string) => void;
  onSwaggerError: (error: string) => void;
}

export const SwaggerImporter: React.FC<SwaggerImporterProps> = ({
  onImportSwagger,
  onSwaggerError
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      onSwaggerError('Please upload a JSON file');
      return;
    }

    setIsProcessing(true);
    setImportStatus('idle');

    try {
      const content = await readFileContent(file);
      const document = SwaggerParser.parseDocument(content);
      const nodes = SwaggerParser.convertToKarateNodes(document);
      
      if (nodes.length === 0) {
        throw new Error('No valid API endpoints found in the Swagger document');
      }

      onImportSwagger(nodes, document.info.title);
      setImportStatus('success');
      setStatusMessage(`Successfully imported ${nodes.length} API endpoints from ${document.info.title}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse Swagger document';
      onSwaggerError(errorMessage);
      setImportStatus('error');
      setStatusMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
    if (importStatus === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (importStatus === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (importStatus === 'success') return 'text-green-600';
    if (importStatus === 'error') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-3">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Import Swagger/OpenAPI Document
            </h3>
            <p className="text-xs text-gray-600">
              Drag and drop a Swagger JSON file or click to browse
            </p>
          </div>

          <input
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="hidden"
            id="swagger-file-input"
            disabled={isProcessing}
          />
          
          <label
            htmlFor="swagger-file-input"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isProcessing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Choose File'}
          </label>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`text-xs ${getStatusColor()} bg-gray-50 rounded-lg p-3`}>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Supported formats:</strong> Swagger 2.0, OpenAPI 3.0+</p>
        <p><strong>What gets imported:</strong></p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>HTTP requests (GET, POST, PUT, DELETE)</li>
          <li>Request parameters and headers</li>
          <li>Request/response schemas</li>
          <li>Status code validations</li>
          <li>Schema validations</li>
        </ul>
      </div>
    </div>
  );
};
