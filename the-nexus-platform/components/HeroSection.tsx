import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white">
            The Future of
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Driven Innovation
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-300 leading-relaxed">
            Experience next-generation technology through our revolutionary platform 
            that combines artificial intelligence, blockchain verification, and 
            quantum-level performance optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Explore Our Technology
              <ChevronRightIcon className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              View Case Studies
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </section>
  )
}