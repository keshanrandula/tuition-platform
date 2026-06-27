import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0b1329] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-extrabold text-brand-500 tracking-wide">
                Edu<span className="text-white">Lanka</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium learning platform dedicated to empowering Sri Lankan students with high quality education and technology.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/live-classes" className="hover:text-brand-500 transition-colors">Live Class</Link>
              </li>
              <li>
                <Link to="/video-library" className="hover:text-brand-500 transition-colors">Videos</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-brand-500 transition-colors">Pricing</Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">Newsletter</h3>
            <p className="text-xs text-slate-400">Get the latest educational updates and class schedules.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-stretch bg-[#14203e] rounded-lg overflow-hidden border border-slate-700 focus-within:border-brand-500 transition-colors">
              <input
                type="email"
                placeholder="Email"
                className="bg-transparent px-3 py-2 text-xs w-full text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 px-3 text-white transition-colors flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-slate-800/80 mt-10 pt-6 text-center text-[10px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} EduLanka. Premium Learning for Sri Lanka.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
