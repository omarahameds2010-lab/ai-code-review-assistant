'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Save,
  Check,
  Globe,
  Key,
  Cpu
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchProviders();
  }, [isAuthenticated, router]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/ai-providers');
      setProviders(response.data);
    } catch (error) {
      toast.error('Failed to fetch AI providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ai-providers', newProvider);
      toast.success('AI provider added successfully!');
      setNewProvider({
        name: '',
        baseUrl: '',
        apiKey: '',
        modelName: '',
        isDefault: false,
      });
      setShowAddProvider(false);
      fetchProviders();
    } catch (error) {
      toast.error('Failed to add AI provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      await api.delete(`/ai-providers/${id}`);
      toast.success('AI provider deleted successfully!');
      fetchProviders();
    } catch (error) {
      toast.error('Failed to delete AI provider');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/ai-providers/${id}`, { isDefault: true });
      toast.success('Default provider updated!');
      fetchProviders();
    } catch (error) {
      toast.error('Failed to update default provider');
    }
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
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
            <button
              onClick={() => setShowAddProvider(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">AI Providers</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure your AI providers for code review and chat features
            </p>
          </div>
          
          {providers.length === 0 ? (
            <div className="p-12 text-center">
              <Cpu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No AI providers configured</p>
              <button
                onClick={() => setShowAddProvider(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Add your first AI provider
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {providers.map((provider: any) => (
                <motion.div
                  key={provider.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                        {provider.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Default
                          </span>
                        )}
                        {provider.isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{provider.baseUrl}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          <span>{provider.modelName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          <span>••••••••••••</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!provider.isDefault && (
                        <button
                          onClick={() => handleSetDefault(provider.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition"
                          title="Set as default"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Example Configurations */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Example Configurations</h3>
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">OpenAI</div>
              <div className="text-gray-600 space-y-1">
                <div>Base URL: https://api.openai.com/v1</div>
                <div>Model: gpt-4 or gpt-3.5-turbo</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">LM Studio (Local)</div>
              <div className="text-gray-600 space-y-1">
                <div>Base URL: http://localhost:1234/v1</div>
                <div>Model: Your local model name</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Ollama (Local)</div>
              <div className="text-gray-600 space-y-1">
                <div>Base URL: http://localhost:11434/v1</div>
                <div>Model: llama2, codellama, etc.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Provider Modal */}
      {showAddProvider && (
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
            <h2 className="text-xl font-bold mb-4">Add AI Provider</h2>
            <form onSubmit={handleAddProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="My OpenAI"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={newProvider.baseUrl}
                  onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://api.openai.com/v1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="sk-..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={newProvider.modelName}
                  onChange={(e) => setNewProvider({ ...newProvider, modelName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="gpt-4"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newProvider.isDefault}
                  onChange={(e) => setNewProvider({ ...newProvider, isDefault: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default provider
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProvider(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
