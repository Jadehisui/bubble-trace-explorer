
import React from 'react';
import { WalletBubbleMap } from '../components/WalletBubbleMap';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Cosmic background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/10 to-transparent"></div>
      <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-slate-300/10 to-slate-400/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-indigo-300/10 to-purple-400/5 rounded-full blur-lg"></div>
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-slate-300/60 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-300/80 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-slate-400/70 rounded-full animate-pulse"></div>
      
      <WalletBubbleMap />
    </div>
  );
};

export default Index;
