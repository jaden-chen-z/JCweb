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

  // Handle user interaction for mobile browsers
  useEffect(() => {
    const handleInteraction = () => {
      if (videoRef.current) {
        // Trigger video loading on user interaction
        videoRef.current.load();
      }
    };

    // Listen for first user interaction (touch or click)
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('click', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);

  // Initialize video element
  useEffect(() => {
    const vid = document.createElement('video');

    // Set source before other attributes for better mobile compatibility
    vid.src = VIDEO_URL;

    // Essential attributes
    vid.loop = false;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = 'metadata'; // Changed from 'auto' to 'metadata' for better mobile performance
    vid.crossOrigin = 'anonymous'; // lowercase 'anonymous' is more compatible

    // Add mobile-specific attributes
    vid.setAttribute('playsinline', 'true'); // iOS Safari compatibility
    vid.setAttribute('webkit-playsinline', 'true'); // Older iOS versions
    vid.setAttribute('x5-playsinline', 'true'); // WeChat browser on Android
    vid.setAttribute('x5-video-player-type', 'h5'); // WeChat browser
    vid.setAttribute('x5-video-player-fullscreen', 'false'); // WeChat browser

    // Error handling with more detailed logging
    vid.onerror = (e) => {
      console.error('Video loading error:', e);
      console.error('Video error code:', vid.error?.code);
      console.error('Video error message:', vid.error?.message);
      console.error('Video src:', vid.src);
      console.error('Video networkState:', vid.networkState);
      console.error('Video readyState:', vid.readyState);
      // Still set ready to prevent infinite loading
      setVideoReady(true);
    };

    // Important: We don't call vid.play() because we want to control it manually.
    // However, loading metadata is required to know duration.
    vid.onloadedmetadata = () => {
      console.log('Video metadata loaded');
      console.log('Video dimensions:', vid.videoWidth, 'x', vid.videoHeight);
      console.log('Video duration:', vid.duration);

      setVideoReady(true);
      if (vid.videoWidth && vid.videoHeight) {
        setVideoAspect(vid.videoWidth / vid.videoHeight);
      }

      // Force a seek to 0 to ensure texture is ready
      vid.currentTime = 0;
    };

    // Add additional event listeners for debugging
    vid.onloadstart = () => console.log('Video load started');
    vid.onloadeddata = () => console.log('Video first frame loaded');
    vid.oncanplay = () => console.log('Video can start playing');
    vid.onstalled = () => console.warn('Video loading stalled');
    vid.onsuspend = () => console.log('Video loading suspended');
    vid.onwaiting = () => console.log('Video waiting for data');
    vid.onprogress = () => {
      if (vid.buffered.length > 0) {
        console.log('Video buffered:', vid.buffered.end(0), 'of', vid.duration);
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

  // Mobile optimization: Adjust vertical position based on viewport aspect ratio
  // On mobile (portrait mode with tall aspect ratio), move video downward
  // Formula: the taller the viewport (smaller aspect ratio), the more we shift downward
  const isMobilePortrait = viewportAspect < 0.75; // Typical mobile portrait aspect ratio
  const verticalOffset = isMobilePortrait ? -viewport.height * 0.1 : 0; // Shift down by 10% of viewport height on mobile

  // Show a loading placeholder with white/light background instead of black
  if (!videoReady || !textureRef.current) {
    return (
      <mesh position={[0, 0, -1]} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, verticalOffset, -1]} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={textureRef.current}
        toneMapped={false} // Keep colors exactly as in video
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};