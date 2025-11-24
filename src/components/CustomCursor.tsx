import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  // 状态：记录触摸坐标和激活状态
  const [touch, setTouch] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false
  });

  useEffect(() => {
    // 触摸开始和移动时的处理函数
    const updateTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        setTouch({ x: t.clientX, y: t.clientY, active: true });
      }
    };

    // 触摸结束时的处理函数
    const endTouch = () => {
      setTouch(prev => ({ ...prev, active: false }));
    };

    // 添加事件监听器 (passive: true 优化滚动性能)
    window.addEventListener('touchstart', updateTouch, { passive: true });
    window.addEventListener('touchmove', updateTouch, { passive: true });
    window.addEventListener('touchend', endTouch);

    return () => {
      window.removeEventListener('touchstart', updateTouch);
      window.removeEventListener('touchmove', updateTouch);
      window.removeEventListener('touchend', endTouch);
    };
  }, []);

  return (
    <AnimatePresence>
      {touch.active && (
        <motion.div
          // 初始状态：较小的半透明圆
          initial={{ scale: 0.5, opacity: 0.5 }}
          // 动画状态：逐渐变大（2.5倍），变为完全不透明
          animate={{ scale: 2.5, opacity: 1 }}
          // 离开状态：缩小并消失
          exit={{ scale: 0, opacity: 0 }}
          // 动画过渡：0.5秒缓出，营造柔和的扩散感
          transition={{ duration: 0.5, ease: "easeOut" }}
          // 样式：白色圆圈，mix-blend-difference 实现反色，z-index 确保在最上层
          className="fixed top-0 left-0 w-16 h-16 bg-white rounded-full mix-blend-difference pointer-events-none z-[9999]"
          style={{
            // 通过坐标偏移将圆心对准手指接触点 (w-16 = 64px, offset 32px)
            x: touch.x - 32,
            y: touch.y - 32
          }}
        />
      )}
    </AnimatePresence>
  );
};
