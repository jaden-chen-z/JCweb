import React from 'react';
import { ScrollControls, Scroll, Sparkles } from '@react-three/drei';
import { VideoCharacter } from './VideoCharacter';
import { Overlay } from './Overlay';

export const Experience3D: React.FC = () => {
  return (
    <>
      {/* 
        Since we are using a video, we typically don't need 3D lights 
        unless the video is mapped to a 3D object that needs to be lit.
        For a "background video" feel, we use MeshBasicMaterial (unlit).
      */}

      {/* Scroll Controls - Damping adds smoothness to the scroll bar itself */}
      <ScrollControls pages={6} damping={0.3}>
        
        {/* The Video Component controlled by scroll */}
        <VideoCharacter />
        
        {/* Optional: Keep Sparkles for depth, put them in front of video */}
        {/* 性能优化：移动端进一步减少粒子数量 */}
        <Sparkles 
          count={30} 
          scale={10} 
          size={1.8} 
          speed={0.35} 
          opacity={0.35} 
          color="#10b981" 
          position={[0, 0, 1]} // Bring slightly forward
        />
        
        {/* HTML Content Overlay */}
        <Scroll html style={{ width: '100%', height: '100%' }}>
          <Overlay />
        </Scroll>
        
      </ScrollControls>
    </>
  );
};
