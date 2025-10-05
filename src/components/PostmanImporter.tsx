import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { PostmanParser } from '../lib/postmanParser';
import { ComponentNode } from '../types';

interface PostmanImporterProps {
  onImportComplete: (nodes: ComponentNode[], collectionName: string) => void;
  onError: (error: string) => void;
}

export const PostmanImporter: React.FC<PostmanImporterProps> = ({
  onImportComplete,
  onError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [collectionInfo, setCollectionInfo] = useState<{ name: string; requestCount: number } | null>(null);
  const [useDynamicExecution, setUseDynamicExecution] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMessage('Please select a valid JSON file');
      setUploadStatus('error');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        
        if (useDynamicExecution) {
          // Use dynamic execution API
          const response = await fetch('http://localhost:3001/api/execute-postman-and-infer-schema', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postmanCollection: content
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to execute Postman requests');
          }

          onImportComplete(result.components, 'Dynamic Postman Collection');
          
          // Show detailed message with stats
          if (result.stats) {
            const { totalRequests, successful, failed, totalComponents } = result.stats;
            setErrorMessage(`${totalRequests} requests processed: ${successful} successful, ${failed} failed. Generated ${totalComponents} components.`);
            
            // Set status based on whether there were failures
            if (failed > 0) {
              setUploadStatus('warning');
            } else {
              setUploadStatus('success');
            }
          } else {
            setErrorMessage(result.message || `Successfully executed ${result.components.length} requests and generated components`);
            setUploadStatus('success');
          }
          
        } else {
          // Use static parsing (existing logic)
          const collection = PostmanParser.parseCollection(content);
          const requests = PostmanParser.extractRequests(collection);
          const nodes = PostmanParser.generateFlowFromRequests(requests);

          setCollectionInfo({
            name: collection.info.name,
            requestCount: requests.length
          });

          setUploadStatus('success');
          onImportComplete(nodes, collection.info.name);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to process collection';
        setErrorMessage(errorMsg);
        setUploadStatus('error');
        onError(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read file');
      setUploadStatus('error');
      setIsProcessing(false);
      onError('Failed to read file');
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    setCollectionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Import Postman Collection</h3>
          <p className="text-sm text-gray-600">Upload your Postman collection to generate Karate tests</p>
        </div>
      </div>

      {/* Dynamic Execution Toggle */}
      <div className="mb-4 p-3 bg-white/50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Execution Mode</h4>
            <p className="text-xs text-gray-600">
              {useDynamicExecution 
                ? 'Execute requests and infer schemas dynamically' 
                : 'Parse collection statically (faster)'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useDynamicExecution}
              onChange={(e) => setUseDynamicExecution(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-blue-400 bg-blue-50 scale-105'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'warning'
            ? 'border-yellow-400 bg-yellow-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Processing collection...</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="flex flex-col items-center space-y-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-sm font-medium text-green-700">Collection imported successfully!</p>
            {collectionInfo && (
              <div className="text-xs text-gray-600">
                <p><strong>{collectionInfo.name}</strong></p>
                <p>{collectionInfo.requestCount} requests found</p>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Import Another
            </button>
          </div>
        ) : uploadStatus === 'warning' ? (
          <div className="flex flex-col items-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <p className="text-sm font-medium text-yellow-700">Collection imported with warnings!</p>
            <p className="text-xs text-gray-600 text-center">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Import Another
            </button>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm font-medium text-red-700">Import failed</p>
            <p className="text-xs text-red-600">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <FileText className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop your collection here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports .json files from Postman
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-white/50 rounded-lg border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">How to export from Postman:</h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Open your collection in Postman</li>
          <li>2. Click the "..." menu next to your collection</li>
          <li>3. Select "Export" → "Collection v2.1"</li>
          <li>4. Save the JSON file and upload it here</li>
        </ol>
      </div>
    </div>
  );
};
