'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  MessageSquare, 
  Settings,
  Loader2,
  Github,
  FileArchive
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'zip' | 'github' | 'files'>('zip');
  const [githubUrl, setGithubUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchProjectData();
  }, [isAuthenticated, router, params.id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, filesRes, reviewsRes] = await Promise.all([
        api.get(`/projects/${params.id}`),
        api.get(`/files/project/${params.id}`),
        api.get(`/reviews/project/${params.id}`),
      ]);
      setProject(projectRes.data);
      setFiles(filesRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error('Failed to fetch project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (uploadType === 'github') {
        await api.post('/files/upload', {
          type: 'github',
          projectId: params.id,
          githubUrl,
        });
      } else {
        // Handle file upload
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput?.files) {
          const formData = new FormData();
          formData.append('type', uploadType);
          formData.append('projectId', String(params.id));
          for (const file of fileInput.files) {
            formData.append('files', file);
          }
          await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }
      toast.success('Files uploaded successfully!');
      setShowUpload(false);
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to upload files');
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
              <h1 className="text-xl font-bold text-gray-900">{project?.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{files.length}</div>
            <div className="text-sm text-gray-600">Files</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">
              {reviews.reduce((acc: number, r: any) => acc + (r.issues?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Issues Found</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl hover:bg-gray-50 transition border border-gray-200 flex items-center gap-3"
          >
            <FileText className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Code Review</div>
              <div className="text-sm text-gray-600">Review with AI</div>
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl hover:bg-gray-50 transition border border-gray-200 flex items-center gap-3"
          >
            <Settings className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Settings</div>
              <div className="text-sm text-gray-600">AI providers</div>
            </div>
          </motion.button>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Files</h2>
          </div>
          
          {files.length === 0 ? (
            <div className="p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No files uploaded yet</p>
              <button
                onClick={() => setShowUpload(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Upload your first files
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file: any) => (
                <motion.div
                  key={file.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">{file.path}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {file.language}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
          </div>
          
          {reviews.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No reviews yet</p>
              <p className="text-sm text-gray-500">Upload files and run a code review to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review: any) => (
                <motion.div
                  key={review.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{review.name}</h3>
                    <span className="text-sm text-gray-500 capitalize">{review.template}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{review.summary}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-red-600">{review.issues?.filter((i: any) => i.severity === 'critical').length || 0} Critical</span>
                    <span className="text-orange-600">{review.issues?.filter((i: any) => i.severity === 'high').length || 0} High</span>
                    <span className="text-yellow-600">{review.issues?.filter((i: any) => i.severity === 'medium').length || 0} Medium</span>
                    <span className="text-blue-600">{review.issues?.filter((i: any) => i.severity === 'low').length || 0} Low</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUpload && (
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
            <h2 className="text-xl font-bold mb-4">Upload Files</h2>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUploadType('zip')}
                className={`flex-1 p-3 rounded-lg border transition ${
                  uploadType === 'zip' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <FileArchive className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">ZIP</span>
              </button>
              <button
                onClick={() => setUploadType('github')}
                className={`flex-1 p-3 rounded-lg border transition ${
                  uploadType === 'github' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Github className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">GitHub</span>
              </button>
              <button
                onClick={() => setUploadType('files')}
                className={`flex-1 p-3 rounded-lg border transition ${
                  uploadType === 'files' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Upload className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Files</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {uploadType === 'github' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://github.com/owner/repo"
                    required
                  />
                </div>
              )}

              {uploadType !== 'github' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {uploadType === 'zip' ? 'ZIP File' : 'Files'}
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    multiple={uploadType === 'files'}
                    accept={uploadType === 'zip' ? '.zip' : '*'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Upload
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
