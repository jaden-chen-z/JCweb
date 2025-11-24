import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 微信浏览器检测和优化
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
if (isWeChat) {
  // 微信浏览器优化：禁用页面缩放
  document.addEventListener('WeixinJSBridgeReady', () => {
    // 微信JS-SDK准备就绪后的处理
  }, false);
  
  // 微信浏览器优化：防止页面被下拉刷新
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    // 如果向下滑动且页面在顶部，阻止默认行为
    if (touchY > touchStartY && window.scrollY === 0) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Error boundary for catching render errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
