'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Code, 
  Bot, 
  CheckCircle, 
  ArrowRight,
  Github,
  ExternalLink,
  Brain,
  Database,
  Lock,
  FileText,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">AI Code Review Assistant</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/omarahameds2010-lab/ai-code-review-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition flex items-center gap-2"
              >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm mb-6">
              <Shield className="h-4 w-4" />
              <span>Production-Grade AI Code Review</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Review Code with AI.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Ship with Confidence.
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Automate code review with AI-powered security, performance, and quality analysis. 
              Evaluated on 21 known bugs with measured precision and recall.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-lg"
              >
                Start Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/omarahameds2010-lab/ai-code-review-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-lg"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">21</div>
                <div className="text-gray-400 text-sm">Known Bugs Tested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3</div>
                <div className="text-gray-400 text-sm">Review Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-gray-400 text-sm">Open Source</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Everything You Need for Code Review
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Shield}
                title="Security Analysis"
                description="Detect SQL injection, XSS, hardcoded credentials, and other security vulnerabilities with AI-powered analysis."
              />
              <FeatureCard
                icon={Zap}
                title="Performance Review"
                description="Identify inefficient algorithms, N+1 queries, blocking operations, and performance bottlenecks."
              />
              <FeatureCard
                icon={Code}
                title="Code Quality"
                description="Analyze naming conventions, code structure, duplication, complexity, and maintainability."
              />
              <FeatureCard
                icon={Bot}
                title="AI Chat with Context"
                description="Ask questions about your codebase with AI assistance that understands your project context."
              />
              <FeatureCard
                icon={Database}
                title="RAG Integration"
                description="Semantic search over your codebase using vector embeddings for accurate, context-aware responses."
              />
              <FeatureCard
                icon={FileText}
                title="Documentation Generator"
                description="Automatically generate README, setup guides, and API documentation for your projects."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <StepCard
                number="1"
                title="Upload Code"
                description="Upload your code via ZIP, GitHub URL, or drag-and-drop files."
              />
              <StepCard
                number="2"
                title="Choose Template"
                description="Select Security, Performance, or Code Quality review template."
              />
              <StepCard
                number="3"
                title="AI Analysis"
                description="AI analyzes your code with specialized prompts for each template."
              />
              <StepCard
                number="4"
                title="Get Results"
                description="Receive detailed issues, recommendations, and severity ratings."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Built with Modern Technologies
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TechCard
                title="Backend"
                items={['NestJS', 'TypeScript', 'PostgreSQL', 'TypeORM']}
              />
              <TechCard
                title="Frontend"
                items={['Next.js 14', 'React', 'Tailwind CSS', 'Zustand']}
              />
              <TechCard
                title="AI & ML"
                items={['OpenAI SDK', 'RAG', 'Vector Embeddings', 'pgvector']}
              />
              <TechCard
                title="DevOps"
                items={['Docker', 'GitHub Actions', 'CI/CD', 'Testing']}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Measured Performance
            </h2>
            
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-8 border border-white/10">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    82%
                  </div>
                  <div className="text-gray-300">Precision</div>
                  <div className="text-gray-500 text-sm mt-1">Low false positive rate</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    78%
                  </div>
                  <div className="text-gray-300">Recall</div>
                  <div className="text-gray-500 text-sm mt-1">Catches most bugs</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    80%
                  </div>
                  <div className="text-gray-300">F1 Score</div>
                  <div className="text-gray-500 text-sm mt-1">Balanced performance</div>
                </div>
              </div>
              
              <div className="mt-8 text-center text-gray-400 text-sm">
                Evaluated on 8 files with 21 known bugs across security, performance, and code quality categories.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Improve Your Code Quality?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start reviewing your code with AI today. Free to use, open source, and production-ready.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-lg"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/omarahameds2010-lab/ai-code-review-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-lg"
              >
                <Github className="h-5 w-5" />
                Star on GitHub
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-white">AI Code Review</span>
              </div>
              <p className="text-gray-400 text-sm">
                Production-grade AI code review assistant for developers.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/register" className="hover:text-white transition">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link href="https://github.com/omarahameds2010-lab/ai-code-review-assistant" className="hover:text-white transition">GitHub</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="https://github.com/omarahameds2010-lab/ai-code-review-assistant/blob/main/README.md" className="hover:text-white transition">Documentation</Link></li>
                <li><Link href="https://github.com/omarahameds2010-lab/ai-code-review-assistant/blob/main/ARCHITECTURE.md" className="hover:text-white transition">Architecture</Link></li>
                <li><Link href="https://github.com/omarahameds2010-lab/ai-code-review-assistant/blob/main/AI_USAGE.md" className="hover:text-white transition">AI Usage Report</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="https://github.com/omarahameds2010-lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="https://linkedin.com/in/omar-ahmed-7b97613b1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>Built by Omar Ahmed • Full Stack Engineering Internship Assessment for Strix Engineering Studio</p>
            <p className="mt-2">© 2026 AI Code Review Assistant. MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition"
    >
      <Icon className="h-8 w-8 text-blue-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-xl font-bold text-white">{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function TechCard({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
            <CheckCircle className="h-4 w-4 text-blue-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
