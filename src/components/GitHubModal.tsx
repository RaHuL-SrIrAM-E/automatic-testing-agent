import React, { useState } from 'react';
import { X, Github, Key, Link, Loader2 } from 'lucide-react';

interface GitHubModalProps {
  onGenerateTests: (repoUrl: string, token: string) => Promise<void>;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ onGenerateTests, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || !token) return;

    setIsGenerating(true);
    try {
      await onGenerateTests(repoUrl, token);
    } catch (error) {
      console.error('GitHub generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isValidUrl = (url: string) => {
    return url.includes('github.com/') && url.split('/').length >= 5;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-wf-red-600 to-wf-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generate Tests from GitHub</h2>
                <p className="text-sm text-white/80">Analyze repository and create test cases</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Repository URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-wf-red-500 focus:border-transparent transition-all duration-200 text-sm"
                required
              />
              {repoUrl && !isValidUrl(repoUrl) && (
                <p className="text-red-500 text-xs mt-1">Please enter a valid GitHub repository URL</p>
              )}
            </div>

            {/* GitHub Token */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-wf-red-500 focus:border-transparent transition-all duration-200 text-sm"
                required
              />
              <p className="text-gray-500 text-xs mt-1">
                Generate a token at{' '}
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-wf-red-600 hover:text-wf-red-700 underline"
                >
                  GitHub Settings
                </a>
                {' '}with repo access
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">What will happen?</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Analyze API endpoints and data models</li>
                <li>• Identify authentication requirements</li>
                <li>• Generate comprehensive test scenarios</li>
                <li>• Populate canvas with test components</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!repoUrl || !token || !isValidUrl(repoUrl) || isGenerating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-wf-red-600 to-wf-red-700 text-white text-sm font-semibold rounded-xl hover:from-wf-red-700 hover:to-wf-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span>Generate Tests</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
