import { motion } from 'framer-motion'
import { 
  CpuChipIcon, 
  CloudIcon, 
  ShieldCheckIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export const TechShowcase: React.FC = () => {
  const technologies = [
    {
      icon: CpuChipIcon,
      title: 'Neural Content Genesis',
      description: 'AI-driven content management system that automatically generates and updates website content based on your company data.',
      features: ['Real-time content generation', 'Multi-language support', 'SEO optimization']
    },
    {
      icon: CloudIcon,
      title: 'Quantum Performance Analytics',
      description: 'Edge computing platform with zero-latency delivery and predictive content optimization.',
      features: ['Edge computing', 'Predictive caching', 'Real-time analytics']
    },
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Verification',
      description: 'Immutable record of your technical achievements with smart contract-based certification.',
      features: ['Tamper-proof records', 'Smart contracts', 'Decentralized identity']
    },
    {
      icon: ChartBarIcon,
      title: 'Hyper-Intelligent SEO',
      description: 'Fully automated SEO optimization with competitor analysis and strategic recommendations.',
      features: ['Automated optimization', 'Competitor analysis', 'Performance monitoring']
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Revolutionary Technologies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Discover our cutting-edge solutions that redefine what's possible in modern web development
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <tech.icon className="h-8 w-8 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">{tech.title}</h3>
              </div>
              <p className="text-gray-300 mb-4">{tech.description}</p>
              <ul className="space-y-2">
                {tech.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}