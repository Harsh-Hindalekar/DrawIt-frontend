import React from 'react';
import PageTransition from '../components/layout/PageTransition';

export const DrawingEditor = () => (
  <div className="h-screen w-screen bg-darkBg flex items-center justify-center overflow-hidden">
    <div className="animate-pulse bg-darkCard p-8 rounded-xl border border-slate-200">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light">
        Loading Drawing Canvas...
      </h2>
    </div>
  </div>
);

export const FlipbookEditor = () => (
  <div className="h-screen w-screen bg-darkBg flex items-center justify-center overflow-hidden">
    <div className="animate-pulse bg-darkCard p-8 rounded-xl border border-slate-200">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light">
        Loading Flipbook Engine...
      </h2>
    </div>
  </div>
);

export const Gallery = () => (
  <PageTransition>
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Your Gallery</h1>
      <p className="text-slate-500">All your saved projects.</p>
    </div>
  </PageTransition>
);

export const Community = () => (
  <PageTransition>
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Community Explorations</h1>
      <p className="text-slate-500">See what others are creating.</p>
    </div>
  </PageTransition>
);

export const Settings = () => (
  <PageTransition>
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-slate-500">Adjust your application preferences and shortcuts here.</p>
    </div>
  </PageTransition>
);
