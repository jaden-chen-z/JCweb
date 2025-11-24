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
  const [videoLoaded, setVideoLoaded] = useState(false); // Track if first frame is loaded
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
    vid.playsInline = true;
    vid.preload = 'auto';
    // Add webkit-playsinline for older iOS devices
    vid.setAttribute('webkit-playsinline', 'true');
    vid.setAttribute('x5-playsinline', 'true'); // For WeChat browser
    vid.setAttribute('x5-video-player-type', 'h5'); // For WeChat browser

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

      // On mobile, we need to trigger a play/pause cycle to load the first frame
      // This is especially important for iOS Safari
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Immediately pause after starting to load first frame
          vid.pause();
          vid.currentTime = 0;
          setVideoLoaded(true);
        }).catch((error) => {
          console.warn('Video autoplay prevented:', error);
          // If autoplay is blocked, we'll handle it via user interaction
          // But still mark as ready to show content
          setVideoLoaded(true);
        });
      } else {
        setVideoLoaded(true);
      }
    };

    // Add event listener for when video can actually play through
    vid.oncanplaythrough = () => {
      setVideoLoaded(true);
    };

    videoRef.current = vid;

    // Create texture once
    const texture = new THREE.VideoTexture(vid);
    // LinearFilter is smoother for scaling
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat; // Assuming video might have alpha or just RGB
    textureRef.current = texture;

    // Add a one-time user interaction handler to ensure video can play on mobile
    const handleFirstInteraction = () => {
      if (vid.paused && vid.readyState >= 2) {
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            vid.pause();
            vid.currentTime = 0;
            setVideoLoaded(true);
            // Force texture update
            if (textureRef.current) {
              textureRef.current.needsUpdate = true;
            }
          }).catch(() => {
            // Ignore errors on subsequent attempts
          });
        }
      }
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };

    // Listen for first user interaction on mobile
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      texture.dispose();
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
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

    // Force texture update on every frame to ensure it's displaying correctly
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
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
    <>
      {/* Show a subtle white background while video is loading */}
      {!videoLoaded && (
        <mesh position={[0, 0, -1]} scale={[scaleX, scaleY, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Video mesh */}
      <mesh position={[0, 0, -1]} scale={[scaleX, scaleY, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={textureRef.current}
          toneMapped={false} // Keep colors exactly as in video
          side={THREE.DoubleSide}
          transparent={!videoLoaded}
          opacity={videoLoaded ? 1 : 0}
        />
      </mesh>
    </>
  );
};