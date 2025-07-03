import Link from 'next/link'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">NEXUS</h3>
            <p className="text-gray-300 max-w-md">
              Revolutionary AI-driven platform for next-generation corporate websites. 
              Experience the future of web technology today.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Technology</h4>
            <ul className="space-y-2">
              <li><Link href="/neural-content" className="text-gray-300 hover:text-white transition-colors">Neural Content Genesis</Link></li>
              <li><Link href="/quantum-analytics" className="text-gray-300 hover:text-white transition-colors">Quantum Analytics</Link></li>
              <li><Link href="/blockchain-verify" className="text-gray-300 hover:text-white transition-colors">Blockchain Verification</Link></li>
              <li><Link href="/ai-seo" className="text-gray-300 hover:text-white transition-colors">AI SEO Engine</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400">
            © 2024 The Nexus Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}