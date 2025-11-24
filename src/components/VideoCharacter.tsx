import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  
  // 性能优化：节流控制，减少更新频率
  const lastUpdateTime = useRef(0);
  const targetTimeRef = useRef(0);
  const UPDATE_INTERVAL = 1000 / 30; // 限制到30fps更新视频时间，减少卡顿

  // Initialize video element
  useEffect(() => {
    const vid = document.createElement('video');
    vid.src = VIDEO_URL;
    vid.crossOrigin = 'Anonymous';
    vid.loop = false;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = 'auto';
    
    // 性能优化：降低视频质量以提升性能（移动端）
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // 移动端可以设置更低的预加载策略
      vid.preload = 'metadata';
    }
    
    // 移动端优化：设置视频属性以确保在移动设备上正确加载
    vid.setAttribute('playsinline', 'true');
    vid.setAttribute('webkit-playsinline', 'true');
    vid.setAttribute('x5-playsinline', 'true'); // 腾讯X5内核支持
    vid.setAttribute('x5-video-player-type', 'h5');
    vid.setAttribute('x5-video-player-fullscreen', 'false');
    
    // Error handling
    vid.onerror = (e) => {
      console.error('Video loading error:', e, 'URL:', VIDEO_URL);
      // 尝试fallback到mp4（如果webm失败）
      if (VIDEO_URL.endsWith('.webm')) {
        const mp4Url = VIDEO_URL.replace('.webm', '.mp4');
        console.log('Trying fallback to:', mp4Url);
        vid.src = mp4Url;
        vid.load();
      } else {
        setVideoReady(true);
      }
    };
    
    // 使用ref来跟踪是否已设置ready，避免状态依赖问题
    let isReadySet = false;
    
    // 移动端优化：添加loadeddata事件作为备用
    vid.onloadeddata = () => {
      if (!isReadySet) {
        isReadySet = true;
        setVideoReady(true);
        if (vid.videoWidth && vid.videoHeight) {
          setVideoAspect(vid.videoWidth / vid.videoHeight);
        }
        vid.currentTime = 0;
        
        // 移动端：短暂播放以确保视频可以正确显示
        if (isMobile) {
          vid.play().then(() => {
            vid.pause();
            vid.currentTime = 0;
            if (textureRef.current) {
              textureRef.current.needsUpdate = true;
            }
          }).catch(err => {
            console.warn('Video play failed:', err);
          });
        }
      }
    };
    
    // Important: We don't call vid.play() because we want to control it manually.
    // However, loading metadata is required to know duration.
    vid.onloadedmetadata = () => {
      if (!isReadySet) {
        isReadySet = true;
        setVideoReady(true);
        if (vid.videoWidth && vid.videoHeight) {
          setVideoAspect(vid.videoWidth / vid.videoHeight);
        }
        // Force a seek to 0 to ensure texture is ready
        vid.currentTime = 0;
      }
    };
    
    // 预加载优化：当视频可以播放时确保纹理更新
    vid.oncanplay = () => {
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
    };
    
    // 移动端优化：尝试加载视频
    vid.load();

    videoRef.current = vid;
    
    // Create texture once with optimized settings
    const texture = new THREE.VideoTexture(vid);
    // 性能优化：使用更高效的纹理过滤
    texture.minFilter = THREE.LinearFilter; 
    texture.magFilter = THREE.LinearFilter;
    // 性能优化：webm格式使用RGBFormat可能更高效（如果视频没有alpha通道）
    // 如果有alpha通道或需要更好的兼容性，使用RGBAFormat
    texture.format = THREE.RGBAFormat;
    texture.generateMipmaps = false; // 禁用mipmap生成，提升性能
    texture.flipY = false; // webm通常不需要翻转
    textureRef.current = texture;
    
    // 确保纹理需要更新
    texture.needsUpdate = true;

    return () => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  useFrame((_state, delta) => {
    if (!videoRef.current || !videoReady || !textureRef.current) return;
    const vid = videoRef.current;
    const now = performance.now();
    
    // 1. Get Scroll Offset (0 to 1)
    const targetProgress = scroll.offset;

    // 2. Calculate target time
    const duration = vid.duration || 0;
    if (duration === 0) return;
    targetTimeRef.current = targetProgress * duration;

    // 3. 性能优化：节流更新，减少currentTime的频繁设置
    if (now - lastUpdateTime.current >= UPDATE_INTERVAL) {
      // Apply Damping (Inertia)
      const currentTime = vid.currentTime;
      const targetTime = targetTimeRef.current;
      
      if (Math.abs(currentTime - targetTime) > 0.01) {
        const newTime = THREE.MathUtils.damp(currentTime, targetTime, 8, delta);
        vid.currentTime = newTime;
        
        // 性能优化：只在时间改变时更新纹理，而不是每帧都更新
        if (textureRef.current) {
          textureRef.current.needsUpdate = true;
        }
      }
      
      lastUpdateTime.current = now;
    }
  });

  // --- Aspect Ratio & Cover Logic ---
  // 性能优化：使用useMemo缓存计算结果
  const scale = useMemo(() => {
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
    
    return [scaleX, scaleY, 1] as [number, number, number];
  }, [viewport.width, viewport.height, videoAspect]);

  if (!videoReady || !textureRef.current) return null;

  return (
    <mesh position={[0, 0, -1]} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={textureRef.current} 
        toneMapped={false} // Keep colors exactly as in video
        side={THREE.FrontSide} // 只渲染一面，提升性能
      />
    </mesh>
  );
};