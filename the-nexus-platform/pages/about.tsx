import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <Layout>
      <Head>
        <title>About Us - Nexus Technologies</title>
        <meta name="description" content="Learn about Nexus Technologies' mission, vision, and team of innovative leaders." />
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
              About Nexus Technologies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto"
            >
              Pioneering the Future of Enterprise Technology
            </motion.p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To democratize advanced technology and make it accessible to every organization, 
                  regardless of size or industry. We believe that cutting-edge AI, blockchain, 
                  and quantum-inspired computing should empower businesses to achieve unprecedented 
                  growth and innovation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  A world where technology seamlessly integrates with human creativity to solve 
                  the most complex challenges facing our society. We envision a future where 
                  every organization can harness the power of AI, blockchain, and advanced 
                  analytics to create meaningful impact.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Company Stats */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
              <p className="text-gray-300 text-lg">Transforming businesses worldwide</p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: '2,500+', label: 'Customers Served' },
                { number: '500PB+', label: 'Data Processed' },
                { number: '99.99%', label: 'Uptime' },
                { number: '4.9/5', label: 'Customer Satisfaction' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Leadership Team</h2>
              <p className="text-gray-300 text-lg">Visionary leaders driving innovation</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'Dr. Sarah Chen',
                  position: 'Chief Executive Officer',
                  bio: 'Former Google AI researcher with 15+ years in enterprise technology. PhD in Computer Science from MIT.',
                  expertise: ['AI Strategy', 'Product Vision', 'Enterprise Sales']
                },
                {
                  name: 'Marcus Rodriguez',
                  position: 'Chief Technology Officer',
                  bio: 'Ex-Tesla senior engineer and blockchain pioneer. Led development of 5 unicorn startups.',
                  expertise: ['System Architecture', 'Blockchain', 'Scalability']
                },
                {
                  name: 'Dr. Aisha Patel',
                  position: 'Chief AI Officer',
                  bio: 'Former OpenAI researcher, published 50+ papers on neural networks and machine learning.',
                  expertise: ['Deep Learning', 'NLP', 'Computer Vision']
                },
                {
                  name: 'James Thompson',
                  position: 'Chief Product Officer',
                  bio: 'Former Uber and Airbnb product leader. Expert in user experience and product-market fit.',
                  expertise: ['Product Strategy', 'User Experience', 'Growth']
                }
              ].map((leader, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{leader.name}</h3>
                  <p className="text-purple-300 mb-3">{leader.position}</p>
                  <p className="text-gray-300 text-sm mb-4">{leader.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {leader.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-gray-300 text-lg">The principles that guide everything we do</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Innovation First',
                  description: 'We push the boundaries of what\'s possible, always seeking new solutions to complex problems.',
                  icon: '🚀'
                },
                {
                  title: 'Collaborative Excellence',
                  description: 'We believe the best solutions emerge when diverse minds work together towards a common goal.',
                  icon: '🤝'
                },
                {
                  title: 'Customer Obsession',
                  description: 'Our customers\' success is our success. We\'re committed to delivering value that exceeds expectations.',
                  icon: '💡'
                },
                {
                  title: 'Technical Excellence',
                  description: 'We maintain the highest standards in engineering, security, and performance.',
                  icon: '⚡'
                },
                {
                  title: 'Continuous Learning',
                  description: 'We embrace change and continuously evolve our skills and knowledge.',
                  icon: '📚'
                },
                {
                  title: 'Ethical Leadership',
                  description: 'We use technology responsibly and consider the impact of our innovations on society.',
                  icon: '🌟'
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Awards & Recognition</h2>
              <p className="text-gray-300 text-lg">Recognized by industry leaders</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                'Forbes 30 Under 30 - Enterprise Technology (2023)',
                'Gartner Magic Quadrant Leader (2023)',
                'MIT Technology Review Innovator (2022)',
                'CES Innovation Award (2022)',
                'Fast Company Most Innovative Companies (2021)'
              ].map((award, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
                >
                  <div className="text-3xl mb-3">🏆</div>
                  <p className="text-gray-300">{award}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;