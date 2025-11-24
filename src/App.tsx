import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience3D } from './components/Experience3D';
import { CustomCursor } from './components/CustomCursor';

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-slate-50 z-50">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-slate-600 text-lg font-semibold animate-pulse">Loading Experience...</p>
      <p className="text-slate-400 text-sm mt-2">This may take a moment</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white to-slate-50 relative">
      
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
        className="w-full h-full"
      >
        <Suspense fallback={null}>
           <Experience3D />
        </Suspense>
      </Canvas>

      {/* Loading screen shown during initial asset loading */}
      <Suspense fallback={<LoadingScreen />}>
        <div />
      </Suspense>
    </div>
  );
};

export default App;

