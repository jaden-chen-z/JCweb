# 视频优化指南 - 移动设备兼容性

## 问题说明
移动设备（特别是 iOS Safari 和 Android 微信/QQ 浏览器）对视频加载有特殊限制，可能导致视频无法显示。

## 已实施的修复

### 1. 视频属性优化
- 添加了所有必要的移动端播放属性：
  - `playsinline` - iOS Safari 必需
  - `webkit-playsinline` - 旧版 iOS 兼容
  - `x5-playsinline` / `x5-video-player-type` - 腾讯 X5 内核（微信/QQ浏览器）
  - `muted` 和 `defaultMuted` - 确保自动播放兼容性

### 2. 加载策略改进
- 改用 `preload="metadata"` 而非 `auto`，减少移动网络负担
- 添加了 `oncanplay` 和 `onsuspend` 事件处理，主动恢复暂停的加载
- 在元数据加载后调用 `vid.load()` 触发实际视频数据加载

### 3. HTML Meta 标签
- 添加移动端 Web App 兼容性标签
- 防止用户缩放导致的视频显示问题

### 4. Vite 构建配置
- 设置 `assetsInlineLimit: 0` 确保视频文件不被内联
- 配置视频文件保持原始文件名，便于缓存

## 建议的视频文件优化

为了获得最佳移动端性能，建议对视频文件进行以下优化：

### 使用 FFmpeg 优化视频

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -movflags +faststart \
  -g 30 \
  -keyint_min 30 \
  -sc_threshold 0 \
  -crf 23 \
  -preset slow \
  -c:a aac \
  -b:a 128k \
  -ar 44100 \
  output.mp4
```

#### 参数说明：
- `-profile:v baseline -level 3.0`: 最大兼容性配置
- `-movflags +faststart`: 将元数据移到文件开头，支持流式播放
- `-g 30 -keyint_min 30`: 每 30 帧一个关键帧（支持平滑跳转/倒放）
- `-sc_threshold 0`: 禁用场景检测，确保关键帧间隔一致
- `-crf 23`: 平衡质量和文件大小
- `-preset slow`: 更好的压缩效果

### 额外建议

1. **文件大小**: 尽量控制在 20MB 以内
2. **分辨率**: 移动端建议 1080p 或 720p
3. **帧率**: 30fps 或 24fps
4. **格式**: MP4 (H.264) 是兼容性最好的格式

## 测试清单

在部署前，请在以下设备/浏览器中测试：
- [ ] iOS Safari (iPhone)
- [ ] iOS Safari (iPad)
- [ ] Android Chrome
- [ ] 微信内置浏览器
- [ ] QQ 浏览器

## 常见问题

### 视频仍然无法加载？
1. 检查视频文件是否已正确优化（使用上述 FFmpeg 命令）
2. 确认视频文件路径正确（`/public/my-character.mp4`）
3. 检查浏览器控制台是否有错误信息
4. 确认网络连接稳定（移动设备可能需要较长加载时间）

### 视频加载很慢？
1. 减小视频文件大小
2. 降低视频分辨率
3. 使用 CDN 托管视频文件
4. 考虑使用自适应流媒体（HLS/DASH）

## 相关文件
- `/src/components/VideoCharacter.tsx` - 视频组件实现
- `/index.html` - HTML 配置和移动端 meta 标签
- `/vite.config.ts` - 构建配置
- `/public/my-character.mp4` - 视频文件位置
