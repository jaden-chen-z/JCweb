import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { VIDEO_URL } from '../constants';

export const VideoCharacter: React.FC = () => {
  const scroll = useScroll();
  const viewport = useThree((state) => state.viewport);

  // Create video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoAspect, setVideoAspect] = useState(16/9); // 默认比例，加载后更新

  // Texture ref to update it manually
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  // Initialize video element
  useEffect(() => {
    const vid = document.createElement('video');
    vid.src = VIDEO_URL;
    vid.crossOrigin = 'Anonymous';
    vid.loop = false;
    vid.muted = true;

    // Critical mobile attributes
    vid.playsInline = true;
    vid.setAttribute('playsinline', ''); // iOS Safari specific
    vid.setAttribute('webkit-playsinline', ''); // Older iOS versions
    vid.setAttribute('x5-playsinline', ''); // WeChat/QQ browser on Android
    vid.setAttribute('x5-video-player-type', 'h5'); // Tencent X5 kernel
    vid.setAttribute('x5-video-player-fullscreen', 'false'); // Prevent fullscreen on X5

    // Better mobile loading strategy
    vid.preload = 'metadata'; // Only load metadata initially (lighter on mobile)
    vid.defaultMuted = true; // Ensure muted for autoplay compatibility

    // Error handling
    vid.onerror = (e) => {
      console.error('Video loading error:', e);
      // Still set ready to prevent infinite loading
      setVideoReady(true);
    };

    // Important: We don't call vid.play() because we want to control it manually.
    // However, loading metadata is required to know duration.
    vid.onloadedmetadata = () => {
      setVideoReady(true);
      if (vid.videoWidth && vid.videoHeight) {
        setVideoAspect(vid.videoWidth / vid.videoHeight);
      }
      // Force a seek to 0 to ensure texture is ready
      vid.currentTime = 0;

      // Attempt to load video data after metadata is ready
      // This helps mobile browsers start loading the actual video
      vid.load();
    };

    // Canplay event - when enough data is loaded to start playing
    vid.oncanplay = () => {
      console.log('Video can play - ready for rendering');
    };

    // For mobile devices, we need to trigger loading more aggressively
    vid.onsuspend = () => {
      console.log('Video loading suspended (common on mobile)');
      // Try to resume loading by seeking to current time
      if (vid.readyState < 2) {
        vid.load();
      }
    };

    videoRef.current = vid;
    
    // Create texture once
    const texture = new THREE.VideoTexture(vid);
    // LinearFilter is smoother for scaling
    texture.minFilter = THREE.LinearFilter; 
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat; // Assuming video might have alpha or just RGB
    textureRef.current = texture;

    return () => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      texture.dispose();
    };
  }, []);

  useFrame((_state, delta) => {
    if (!videoRef.current || !videoReady) return;
    const vid = videoRef.current;
    
    // 1. Get Scroll Offset (0 to 1)
    const targetProgress = scroll.offset;

    // 2. Calculate target time
    // Ensure we don't exceed duration
    const duration = vid.duration || 0;
    if (duration === 0) return;
    const targetTime = targetProgress * duration;

    // 3. Apply Damping (Inertia)
    // Use MathUtils.damp to smoothly interpolate current time to target time
    // lambda = 10 means it catches up relatively quickly but with a smooth tail
    // Increase lambda (e.g., 20) for stiffer control, decrease (e.g., 5) for more loose/heavy feel.
    if (Math.abs(vid.currentTime - targetTime) > 0.01) {
      vid.currentTime = THREE.MathUtils.damp(vid.currentTime, targetTime, 10, delta);
    }
  });

  // --- Aspect Ratio & Cover Logic ---
  // We want the video to cover the screen like CSS object-fit: cover
  const viewportAspect = viewport.width / viewport.height;
  
  let scaleX, scaleY;
  if (viewportAspect > videoAspect) {
    // Viewport is wider than video -> fit width, crop height
    scaleX = viewport.width;
    scaleY = viewport.width / videoAspect;
  } else {
    // Viewport is taller than video -> fit height, crop width
    scaleX = viewport.height * videoAspect;
    scaleY = viewport.height;
  }

  if (!videoReady || !textureRef.current) return null;

  return (
    <mesh position={[0, 0, -1]} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={textureRef.current} 
        toneMapped={false} // Keep colors exactly as in video
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};