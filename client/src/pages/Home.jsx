import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Video, Users, CheckCircle, ChevronRight, Lock, Award, Play, MessageSquare, HelpCircle, Calendar } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-24 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="space-y-6 lg:col-span-7 text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Master Your Subjects <br />
              with <span className="text-brand-500 text-gradient-glow font-extrabold">Expert Guidance</span>
            </h1>
            <p className="max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              Live classes, recorded videos & personal attention — all in one place. Join thousands of Sri Lankan students succeeding with EduLanka.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="btn-primary flex items-center space-x-2 text-base px-8 py-3.5 w-full sm:w-auto justify-center"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto justify-center"
                  >
                    Join Free Today
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto justify-center border-brand-500/20 text-brand-500 hover:bg-brand-50"
                  >
                    Watch Demo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Right Floating Live Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-100/80 dark:shadow-slate-900/60 relative">
              {/* Live Badge */}
              <div className="absolute top-4 left-4 bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider animate-pulse-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>● Live Now</span>
              </div>
              
              {/* Small menu dots */}
              <div className="absolute top-4 right-4 flex space-x-1">
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              </div>

              {/* Class Info */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">A/L Physics 2025</h3>
                <span className="text-xs text-slate-400 font-semibold block">Subject: Physics</span>

                {/* Avatar list + Join stats */}
                <div className="flex items-center space-x-3 pt-2">
                  <div className="flex -space-x-2">
                    <img className="w-7 h-7 rounded-full border border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                    <img className="w-7 h-7 rounded-full border border-white" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                    <img className="w-7 h-7 rounded-full border border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">124 Students Joining</span>
                </div>

                {/* CTA join button */}
                <Link
                  to={user ? "/live-classes" : "/register"}
                  className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2 text-sm mt-6 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-semibold rounded-2xl"
                >
                  <span>Join Class</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS BAR SECTION */}
      <section className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700/50 py-10 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { count: '500+', label: 'Active Students', icon: Users },
            { count: '200+', label: 'Expert Videos', icon: Video },
            { count: '15+', label: 'Subjects Covered', icon: BookOpen },
            { count: '98%', label: 'Pass Rate', icon: Award },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center space-y-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/15">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stat.count}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. THREE STEPS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Simple steps to success</h2>
          <div className="w-16 h-1 bg-brand-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Register', desc: 'Create your free account in 10 seconds and join our growing community of learners.', icon: Users },
            { step: '2', title: 'Attend Live Class', desc: 'Join real-time interactive classes via Google Meet and ask questions directly to experts.', icon: Calendar },
            { step: '3', title: 'Watch Replays', desc: 'Missed a class? No worries. Rewatch high-quality recorded sessions anytime, anywhere.', icon: Play },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-8 rounded-3xl relative border border-slate-100 flex flex-col text-left space-y-4">
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/15">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SUBJECTS WE COVER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Subjects We Cover</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Explore comprehensive syllabuses led by senior subject instructors.</p>
          </div>
          <Link to="/video-library" className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center space-x-1.5">
            <span>View All Subjects</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Mathematics', count: '24 Videos', desc: 'Comprehensive lessons covering Pure and Applied Math for local syllabuses.', icon: BookOpen },
            { name: 'Physics', count: '42 Videos', desc: 'Deep dive into Mechanics, Waves, and Modern Physics with practical examples.', icon: Award },
            { name: 'Chemistry', count: '32 Videos', desc: 'Inorganic, Organic, and Physical Chemistry made simple with clear visuals.', icon: Play },
            { name: 'Biology', count: '18 Videos', desc: 'Detailed exploration of life sciences, anatomy, and biological concepts.', icon: Users },
            { name: 'Commerce', count: '32 Videos', desc: 'Accounting, Economics and Business Studies from industry experts.', icon: HelpCircle },
            { name: 'English', count: '28 Videos', desc: 'Grammar, literature, and spoken English for academic and career growth.', icon: MessageSquare },
          ].map((sub, idx) => {
            const Icon = sub.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/15">
                      <Icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                      {sub.count}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{sub.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PRICING PACKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Choose Your Study Pack</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Investment in knowledge pays the best interest. Select a plan that fits your learning journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { 
              name: 'Basic', price: '999', 
              features: ['10 High-quality videos', '1 Subject access', '30 days validity', 'Live class participation'], 
              buttonStyle: 'btn-secondary text-brand-500 border-brand-500/20 hover:bg-brand-50', isPopular: false 
            },
            { 
              name: 'Standard', price: '1,999', 
              features: ['30 High-quality videos', '3 Subjects access', '90 days validity', 'Live class participation'], 
              buttonStyle: 'btn-primary bg-gradient-to-r from-brand-600 to-brand-500 text-white', isPopular: true 
            },
            { 
              name: 'Premium', price: '3,499', 
              features: ['Unlimited video access', 'All subjects included', 'Lifetime access', 'Priority support'], 
              buttonStyle: 'btn-secondary text-brand-500 border-brand-500/20 hover:bg-brand-50', isPopular: false 
            },
          ].map((pack, i) => (
            <div 
              key={i} 
              className={`glass-panel p-8 rounded-3xl border flex flex-col justify-between text-left relative ${
                pack.isPopular ? 'border-brand-500 shadow-xl ring-2 ring-brand-500/10' : 'border-slate-100'
              }`}
            >
              {pack.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pack.name}</h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xs text-slate-400 font-semibold">LKR</span>
                    <span className="text-3xl font-extrabold text-slate-950 dark:text-white">{pack.price}</span>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {pack.features.map((f, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-6">
                <Link
                  to={user ? "/video-library" : "/register"}
                  className={`w-full text-center flex items-center justify-center text-xs py-3 rounded-xl font-bold ${pack.buttonStyle}`}
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">What our students say</h2>
          <div className="flex justify-center space-x-1 text-brand-500">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: 'The live classes are incredible. I never feel like I am in a virtual room. The teachers explain everything so clearly.', author: 'Kavya P.', subtitle: 'Grade 11 Student', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100' },
            { quote: "As an A/L student, finding good Physics recordings was hard. EduLanka's video library changed everything for me.", author: 'Dinushan M.', subtitle: 'A/L Student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
            { quote: "The personal attention I get during classes helps me clear my doubts immediately. It's much better than normal tuition.", author: 'Nethmi S.', subtitle: 'Grade 10 Student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100' },
          ].map((test, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-left space-y-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                "{test.quote}"
              </p>
              <div className="flex items-center space-x-3.5">
                <img className="w-9 h-9 rounded-full border object-cover" src={test.avatar} alt={test.author} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{test.author}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{test.subtitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
