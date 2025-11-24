// 临时测试文件 - 用于诊断问题
// 如果这个能显示，说明 React 基础功能正常

import React from 'react';

export const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '50px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>测试：如果你看到这个，说明 React 正常工作</h1>
      <p>如果还是空白，可能是 Canvas 或 Three.js 的问题</p>
    </div>
  );
};

