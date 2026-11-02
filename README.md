# ScatterMemory的人生

一个无需构建、无需后端的魔法古书个人网站。`dist/` 为完整网站，可直接部署到 GitHub Pages。

## 交互

- 封面魔眼跟随鼠标；点击魔眼开启书本。
- 第一组内页为序章与目录，可跳转生活记录、音乐创作、视频分享、随心杂记。
- 音乐章节支持 MP3 试听、播放/暂停、切歌、时间进度、音量、随机播放、单曲循环。
- 其他三章为留白占位，不包含虚构个人经历。
- 本机选择的 MP3 不上传、不持久保存；刷新后需重新选择。
- 桌面双页、移动端单页。键盘左右键翻章，Escape 合书。动效按钮可关闭动画，也尊重系统减少动态效果设置。

## 上传 GitHub Pages

1. 创建或打开 `你的用户名.github.io` 公开仓库。
2. 把 `dist` 文件夹里的所有文件上传到仓库根目录（不要把 `dist` 作为外层文件夹上传）。
3. 确保根目录可见 `index.html`、`style.css`、`app.js`、`tracks.js`。
4. 在仓库 Settings → Pages 设置 Deploy from a branch、main、/(root)，保存。
5. 等待部署完成后打开 GitHub 给出的网址。

页面没有外部字体、图片、脚本或统计请求。相对资源路径也兼容项目站点的子路径。

## 加入正式音乐

在网站根目录新建 `media/`，将 MP3 放进去，例如 `media/first-song.mp3`。编辑 `tracks.js`：

```js
window.SCATTER_TRACKS = [
  { title: '你的曲名', artist: 'ScatterMemory', src: './media/first-song.mp3' }
];
```

新增曲目后重新上传更新的文件即可。文件名建议使用英文字母、数字和短横线。MP3 不会自动播放，访客需要点击播放按钮。

## 本地预览

可以直接打开 `dist/index.html`。也可以在项目目录运行：

```sh
python -m http.server 4173 --directory dist
```

然后打开 http://localhost:4173 。

## 文件结构

```text
dist/
  index.html    页面结构、魔眼矢量图形
  style.css     古书、纸张与响应式布局
  app.js        开书翻页、眼睛跟随、播放器交互
  tracks.js     正式曲目配置
  .nojekyll     GitHub Pages 静态发布标记
```

本版本没有附带测试音频；试听测试使用的合成音频没有发布。
