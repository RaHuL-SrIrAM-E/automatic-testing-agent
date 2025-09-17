import React, { useState } from 'react';
import { Download, FolderOpen, FileText, Settings, Database } from 'lucide-react';
import { ComponentNode } from '../types';
import { KarateProjectGenerator, KarateProject } from '../lib/karateProjectGenerator';

interface ProjectGeneratorProps {
  nodes: ComponentNode[];
}

export const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ nodes }) => {
  const [projectName, setProjectName] = useState('karate-test-project');
  const [generatedProject, setGeneratedProject] = useState<KarateProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generator = new KarateProjectGenerator();

  const handleGenerateProject = () => {
    setIsGenerating(true);
    try {
      const project = generator.generateProject(nodes, projectName);
      setGeneratedProject(project);
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProject = () => {
    if (!generatedProject) return;

    const projectZip = generator.generateProjectZip(generatedProject);
    const blob = new Blob([projectZip], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFeature = (feature: any) => {
    const blob = new Blob([feature.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = feature.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadConfig = (config: any) => {
    const blob = new Blob([config.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generate Complete Karate Project</h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
          />
        </div>

        <button
          onClick={handleGenerateProject}
          disabled={isGenerating || nodes.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              <span>Generate Project</span>
            </>
          )}
        </button>
      </div>

      {generatedProject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Generated Project Files</h4>
            <button
              onClick={handleDownloadProject}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Download All</span>
            </button>
          </div>

          {/* Feature Files */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Feature Files ({generatedProject.features.length})</span>
            </h5>
            <div className="space-y-2">
              {generatedProject.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                    <div className="text-xs text-gray-500">{feature.path}</div>
                    <div className="text-xs text-gray-400">{feature.description}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadFeature(feature)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Files */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>Configuration Files ({generatedProject.configFiles.length})</span>
            </h5>
            <div className="space-y-2">
              {generatedProject.configFiles.map((config, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{config.name}</div>
                    <div className="text-xs text-gray-500">{config.path}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadConfig(config)}
                    className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Files */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Data Files ({generatedProject.dataFiles.length})</span>
            </h5>
            <div className="space-y-2">
              {generatedProject.dataFiles.map((dataFile, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{dataFile.name}</div>
                    <div className="text-xs text-gray-500">{dataFile.path}</div>
                    <div className="text-xs text-gray-400">Type: {dataFile.type.toUpperCase()}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadConfig(dataFile)}
                    className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Structure */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Project Structure</h5>
            <div className="p-3 bg-gray-900 text-gray-100 rounded font-mono text-xs overflow-x-auto">
              <pre>{JSON.stringify(generatedProject.folderStructure, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {nodes.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p>Add some components to the canvas to generate a project</p>
        </div>
      )}
    </div>
  );
};
