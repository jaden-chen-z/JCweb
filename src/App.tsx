import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience3D } from './components/Experience3D';
import { CustomCursor } from './components/CustomCursor';

const LoadingScreen = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading Experience...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="fixed-aspect-container">
      <div className="aspect-content">
        
        {/* 增加负片效果的跟随圆点 */}
        <CustomCursor />

        {/* 
           Canvas handles the 3D Context. 
           Shadows enabled for depth.
           Camera field of view adjusted for better portrait framing.
        */}
        <Canvas 
          shadows 
          camera={{ position: [0, 0, 8], fov: 40 }}
          className="absolute inset-0 w-full h-full"
        >
          <Suspense fallback={null}>
             <Experience3D />
          </Suspense>
        </Canvas>

        {/* Simple visual fallback for suspense if needed, though ScrollControls usually handles mounting well */}
        <Suspense fallback={<LoadingScreen />}>
          {/* Preload critical assets if any */}
        </Suspense>
      </div>
    </div>
  );
};

export default App;

