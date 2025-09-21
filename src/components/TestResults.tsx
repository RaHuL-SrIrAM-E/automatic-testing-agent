import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Download, Eye } from 'lucide-react';

interface TestResultsProps {
  results: any;
  onClose: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ results, onClose }) => {
  if (!results) return null;

  const { success, error, summary, details, reportPath } = results;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'skipped':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Test Execution Results</h2>
              <p className="text-sm text-gray-600">
                {success ? 'Tests completed successfully' : 'Test execution failed'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {success ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-700">{summary.passed}</div>
                      <div className="text-sm text-green-600">Passed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-700">{summary.skipped}</div>
                      <div className="text-sm text-yellow-600">Skipped</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold text-blue-700">{summary.total}</div>
                      <div className="text-sm text-blue-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions for running tests */}
              {results.instructions && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <span>📋</span>
                      <span>How to Run Your Generated Test</span>
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="font-medium">The feature file has been downloaded to your computer.</p>
                      <div className="bg-white border border-blue-200 rounded-lg p-4 font-mono text-xs">
                        <div className="text-blue-600 font-semibold mb-2">Option 1: Using Karate JAR</div>
                        <div>1. Download Karate: <a href="https://github.com/karatelabs/karate" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://github.com/karatelabs/karate</a></div>
                        <div>2. Run: <code className="bg-gray-100 px-2 py-1 rounded">java -jar karate.jar generated-test.feature</code></div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4 font-mono text-xs">
                        <div className="text-blue-600 font-semibold mb-2">Option 2: Using Maven</div>
                        <div>1. Create a Maven project with Karate dependency</div>
                        <div>2. Place the .feature file in src/test/java/features/</div>
                        <div>3. Run: <code className="bg-gray-100 px-2 py-1 rounded">mvn test</code></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Details */}
              {details && details.length > 0 && !results.instructions && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Test Details</h3>
                  <div className="space-y-3">
                    {details.map((test: any, index: number) => (
                      <div key={index} className={`p-4 rounded-xl border ${getStatusColor(test.status)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              {test.message && (
                                <div className="text-sm opacity-75">{test.message}</div>
                              )}
                              {test.description && (
                                <div className="text-sm opacity-75">{test.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {test.duration ? `${test.duration}ms` : ''}
                          </div>
                        </div>
                        {test.error && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-sm text-red-700 font-medium">Error:</div>
                            <div className="text-sm text-red-600 font-mono">{test.error}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                {reportPath && (
                  <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Full Report</span>
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          ) : (
            /* Error State */
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Execution Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
