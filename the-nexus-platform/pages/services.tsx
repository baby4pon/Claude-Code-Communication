import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const Services = () => {
  const services = [
    {
      id: 'neural-content',
      title: 'Neural Content Genesis',
      subtitle: 'AI-Powered Content Management',
      description: 'Revolutionary content management system that leverages advanced AI to create, optimize, and personalize content in real-time.',
      features: [
        'GPT-4 powered content generation',
        'Real-time SEO optimization',
        'Multi-language support',
        'Brand voice consistency',
        'Performance analytics'
      ],
      benefits: [
        '75% reduction in content creation time',
        '300% increase in engagement rates',
        'Automated A/B testing',
        'Seamless brand consistency'
      ],
      icon: '🧠',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'quantum-analytics',
      title: 'Quantum Performance Analytics',
      subtitle: 'Edge Computing Excellence',
      description: 'Advanced analytics platform that processes data at the speed of thought with quantum-inspired algorithms.',
      features: [
        'Real-time data processing',
        'Predictive modeling',
        'Edge computing optimization',
        'Custom dashboard creation',
        'API-first architecture'
      ],
      benefits: [
        '99.9% uptime guarantee',
        'Sub-millisecond response times',
        'Scalable to petabyte volumes',
        'Enterprise-grade security'
      ],
      icon: '⚡',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'blockchain-verification',
      title: 'Blockchain Verification',
      subtitle: 'Decentralized Trust Infrastructure',
      description: 'Secure, transparent, and immutable verification system built on cutting-edge blockchain technology.',
      features: [
        'Smart contract automation',
        'Immutable record keeping',
        'Multi-chain compatibility',
        'Zero-knowledge proofs',
        'Decentralized governance'
      ],
      benefits: [
        '100% transparency',
        'Reduced fraud by 95%',
        'Automated compliance',
        'Cost reduction up to 60%'
      ],
      icon: '🔗',
      gradient: 'from-green-500 to-blue-600'
    },
    {
      id: 'techshowcase-live',
      title: 'TechShowcase Live',
      subtitle: 'Interactive Technology Demonstrations',
      description: 'Experience our technology firsthand through immersive demonstrations and virtual reality experiences.',
      features: [
        'VR office tours',
        'Live coding sessions',
        'Interactive demos',
        'AI-powered presentations',
        'Custom solution previews'
      ],
      benefits: [
        'Hands-on technology experience',
        'Real-time Q&A with experts',
        'Customized demonstrations',
        'Immediate implementation planning'
      ],
      icon: '🎮',
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Services - Nexus Technologies</title>
        <meta name="description" content="Discover our cutting-edge services: Neural Content Genesis, Quantum Analytics, Blockchain Verification, and TechShowcase Live." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-6"
            >
              Our Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto"
            >
              Transforming businesses with cutting-edge technology solutions
            </motion.p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto space-y-32">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Service Details */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className={`text-6xl mr-4 p-4 rounded-2xl bg-gradient-to-r ${service.gradient} bg-opacity-10`}>
                      {service.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {service.title}
                      </h2>
                      <p className="text-lg text-purple-300">{service.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Features */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-300">
                            <span className="text-green-400 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Benefits</h3>
                      <ul className="space-y-2">
                        {service.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-gray-300">
                            <span className="text-blue-400 mr-2">★</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className={`px-8 py-3 rounded-full bg-gradient-to-r ${service.gradient} text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105`}>
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Service Visualization */}
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className={`w-full h-64 rounded-2xl bg-gradient-to-r ${service.gradient} opacity-20 mb-6`}></div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
                        <div className="h-4 bg-white/20 rounded-full w-1/5"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-white/20 rounded-full w-1/2"></div>
                        <div className="h-4 bg-white/20 rounded-full w-2/5"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-white/20 rounded-full w-2/3"></div>
                        <div className="h-4 bg-white/20 rounded-full w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Let's discuss how our cutting-edge solutions can accelerate your digital transformation journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                  Schedule Consultation
                </button>
                <button className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300">
                  Request Demo
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;