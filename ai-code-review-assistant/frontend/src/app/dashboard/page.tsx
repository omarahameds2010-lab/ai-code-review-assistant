'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FolderPlus, 
  Upload, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [isAuthenticated, router]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        name: newProjectName,
        description: newProjectDescription,
      });
      toast.success('Project created successfully!');
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProject(false);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                AI Code Review Assistant
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowNewProject(true)}
            className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition flex items-center gap-3"
          >
            <FolderPlus className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">New Project</div>
              <div className="text-sm opacity-80">Create a project</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl hover:bg-gray-50 transition border border-gray-200 flex items-center gap-3"
          >
            <Upload className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Upload Code</div>
              <div className="text-sm text-gray-600">ZIP, files, or GitHub</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl hover:bg-gray-50 transition border border-gray-200 flex items-center gap-3"
          >
            <FileText className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Review Code</div>
              <div className="text-sm text-gray-600">AI-powered review</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl hover:bg-gray-50 transition border border-gray-200 flex items-center gap-3"
          >
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">AI Chat</div>
              <div className="text-sm text-gray-600">Ask about code</div>
            </div>
          </motion.button>
        </div>

        {/* New Project Modal */}
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="My Project"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Brief description of your project"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <button
                onClick={() => setShowNewProject(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {projects.map((project: any) => (
                <motion.div
                  key={project.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-6 cursor-pointer"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{project.files?.length || 0} files</span>
                        <span>{project.reviews?.length || 0} reviews</span>
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
