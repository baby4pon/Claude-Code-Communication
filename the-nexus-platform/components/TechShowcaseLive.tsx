import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSession {
  id: string;
  title: string;
  presenter: string;
  time: string;
  description: string;
  technology: string;
  viewers: number;
  isLive: boolean;
}

interface Demo {
  id: string;
  title: string;
  description: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  codePreview: string;
}

const TechShowcaseLive = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'demos' | 'vr'>('live');
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);

  const liveSessions: LiveSession[] = [
    {
      id: '1',
      title: 'Real-time AI Content Generation with GPT-4',
      presenter: 'Dr. Aisha Patel',
      time: '2:00 PM PST',
      description: 'See how our Neural Content Genesis system creates optimized content in real-time',
      technology: 'AI/ML',
      viewers: 234,
      isLive: true
    },
    {
      id: '2',
      title: 'Quantum-Inspired Performance Analytics',
      presenter: 'Marcus Rodriguez',
      time: '3:30 PM PST',
      description: 'Deep dive into our edge computing analytics platform',
      technology: 'Quantum Computing',
      viewers: 156,
      isLive: true
    },
    {
      id: '3',
      title: 'Blockchain Smart Contracts in Action',
      presenter: 'Sarah Kim',
      time: '5:00 PM PST',
      description: 'Live deployment and testing of smart contracts',
      technology: 'Blockchain',
      viewers: 89,
      isLive: false
    }
  ];

  const interactiveDemos: Demo[] = [
    {
      id: 'demo1',
      title: 'AI-Powered Content Optimization',
      description: 'Experience real-time content generation and SEO optimization',
      technology: 'Neural Networks',
      difficulty: 'Beginner',
      duration: '5 min',
      codePreview: `// AI Content Generation
const content = await ai.generateContent({
  topic: "enterprise technology",
  audience: "technical leaders",
  tone: "professional",
  seoKeywords: ["innovation", "AI"]
});`
    },
    {
      id: 'demo2',
      title: 'Real-time Performance Analytics',
      description: 'Monitor and optimize application performance with quantum-inspired algorithms',
      technology: 'Quantum Analytics',
      difficulty: 'Intermediate',
      duration: '8 min',
      codePreview: `// Quantum Performance Analysis
const metrics = quantum.analyzePerformance({
  timeWindow: "1h",
  algorithms: ["quantum-optimize"],
  realTime: true
});`
    },
    {
      id: 'demo3',
      title: 'Smart Contract Deployment',
      description: 'Deploy and interact with smart contracts on multiple blockchains',
      technology: 'Blockchain',
      difficulty: 'Advanced',
      duration: '12 min',
      codePreview: `// Smart Contract Deployment
const contract = await blockchain.deploy({
  network: "ethereum",
  gasOptimized: true,
  verification: "automatic"
});`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-6">
            TechShowcase Live
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            Experience cutting-edge technology through interactive demonstrations, live coding sessions, and virtual reality tours
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
            {[
              { id: 'live', label: 'Live Sessions', icon: '🔴' },
              { id: 'demos', label: 'Interactive Demos', icon: '💻' },
              { id: 'vr', label: 'VR Experience', icon: '🥽' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Live Sessions Tab */}
          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Live Sessions List */}
                <div className="lg:col-span-2 space-y-6">
                  {liveSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {session.isLive && (
                            <div className="flex items-center mr-4">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                              <span className="text-red-400 font-semibold">LIVE</span>
                            </div>
                          )}
                          <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                            {session.technology}
                          </span>
                        </div>
                        <span className="text-gray-400">{session.time}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{session.title}</h3>
                      <p className="text-gray-300 mb-3">{session.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <span className="mr-4">👨‍💻 {session.presenter}</span>
                          <span>👥 {session.viewers} viewers</span>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
                          {session.isLive ? 'Join Live' : 'Set Reminder'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Live Stream Preview */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">🔴 Currently Live</h3>
                  <div className="aspect-video bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎥</div>
                      <p className="text-gray-300">Live Stream</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Dr. Aisha Patel demonstrating real-time AI content generation
                  </p>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Join Live Session
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interactive Demos Tab */}
          {activeTab === 'demos' && (
            <motion.div
              key="demos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Demos List */}
                <div className="space-y-6">
                  {interactiveDemos.map((demo) => (
                    <motion.div
                      key={demo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedDemo(demo)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                          {demo.technology}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            demo.difficulty === 'Beginner' ? 'bg-green-600/20 text-green-300' :
                            demo.difficulty === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-300' :
                            'bg-red-600/20 text-red-300'
                          }`}>
                            {demo.difficulty}
                          </span>
                          <span className="text-gray-400 text-sm">{demo.duration}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2">{demo.title}</h3>
                      <p className="text-gray-300 text-sm">{demo.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Demo Preview */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  {selectedDemo ? (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">{selectedDemo.title}</h3>
                      <div className="bg-slate-800 rounded-lg p-4 mb-4">
                        <pre className="text-green-400 text-sm overflow-x-auto">
                          <code>{selectedDemo.codePreview}</code>
                        </pre>
                      </div>
                      <p className="text-gray-300 mb-4">{selectedDemo.description}</p>
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
                        Start Interactive Demo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-4">💻</div>
                      <p>Select a demo to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* VR Experience Tab */}
          {activeTab === 'vr' && (
            <motion.div
              key="vr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
                  <div className="text-6xl mb-6">🥽</div>
                  <h2 className="text-3xl font-bold text-white mb-6">Virtual Office Experience</h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Take a virtual reality tour of our offices, meet our team, and experience our technology in an immersive 3D environment.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                      { title: 'Office Tour', icon: '🏢', desc: 'Explore our San Francisco headquarters' },
                      { title: 'Team Meet', icon: '👥', desc: 'Meet our engineers and designers' },
                      { title: 'Tech Demo', icon: '⚡', desc: 'See our technology in action' }
                    ].map((experience, index) => (
                      <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="text-3xl mb-3">{experience.icon}</div>
                        <h3 className="text-lg font-semibold text-white mb-2">{experience.title}</h3>
                        <p className="text-gray-400 text-sm">{experience.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                      Launch VR Experience
                    </button>
                    <button className="px-8 py-3 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                      System Requirements
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TechShowcaseLive;