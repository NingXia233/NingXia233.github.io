# Ning 的个人主页

夏宁的个人网站，记录凝聚态物理研究、学习笔记和小说创作。

网站：<https://ningxia233.github.io>

## 内容与目录

- `_posts/`：学习笔记和小说，分别使用 `categories: notes` 和 `categories: novel`。
- `menu/`：关于我、研究、归档、画廊和留言板。
- `_gallery/`、`assets/`：画廊内容、图片和样式。
- `_config.yml`：站点信息、构建设置和留言仓库。
- `_data/settings.yml`：导航、社交链接和界面文字。
- `_includes/math.html`：MathJax 配置；`_sass/_post.scss`：公式排版。

笔记封面位于 `assets/img/covers/`，是一组以旧纸张、墨线和低饱和色彩呈现的生成插画。站点使用 WebP 文件减少加载量；文章 front matter 中的 `image` 填写完整站内路径（例如 `/assets/img/covers/tensor-networks.webp`），`image_alt` 提供图片说明，`image_width` 和 `image_height` 记录尺寸，避免图片加载时页面跳动。

## 本地开发

需要 Ruby、Bundler 和编译 Ruby 原生扩展的工具链。在仓库根目录运行：

```sh
bundle install
bundle exec jekyll serve
```

构建与回归检查：

```sh
bundle exec jekyll build
python3 -m unittest discover -s tests -v
```

使用已配置的 Codex 云环境时，先运行 `source /workspace/.cloud-setup/activate.sh`，然后用 `ruby /workspace/.cloud-setup/ruby/usr/bin/bundle` 替代上述 `bundle` 命令。

`Gemfile.lock` 当前由仓库忽略；首次安装会生成本地锁文件。已有锁文件时可以使用 `BUNDLE_FROZEN=true bundle install`。`_site/` 和 Jekyll 缓存均为生成文件，无需提交。

## 书写 LaTeX 公式

本站使用 GitHub Pages 支持的 Kramdown 与固定版本的 MathJax 3.2.2。公式先由 Kramdown 保护，再由浏览器排版，避免下划线、花括号和反斜杠被 Markdown 当作普通文本处理。

**行内公式使用 `$$...$$`，前后放在同一段文字中：**

```markdown
态矢量 $$\lvert\psi\rangle$$ 属于空间 $$\mathcal{H}_i$$。
集合写成 $$\{s_1, s_2\}$$，张量指标写成 $$Y^{ab}_{ij}$$。
```

**独立公式的 `$$` 各占一行，并在公式块前后留空行：**

```latex
$$
\begin{aligned}
H &= -\sum_i \frac{\partial^2}{\partial x_i^2}
     + 2c \sum_{i<j} \delta(x_i-x_j), \\
H\psi &= E\psi.
\end{aligned}
$$
```

支持 AMS、`mathtools` 和 `braket`，例如 `\ket{\psi}`、`\bra{\phi}`、`\braket{\phi|\psi}`。较长的独立公式可以横向滚动，不会撑宽手机页面。

若使用原始 HTML 表格，在 `<table markdown="1">` 内为含公式的单元格加上 `markdown="span"`，例如 `<td markdown="span">态矢量 $$\ket{\psi}$$</td>`。这样单元格中的公式也会先经过 Kramdown，保持正确的行内排版。

不要直接在 Markdown 中使用单个 `$...$` 或 `\(...\)` 代替上述写法；它们可能在 MathJax 运行前被 Markdown 改写。代码围栏中的公式示例保持原样，不会被排版。普通金额直接写 `$5` 即可。

MathJax 和数学字体通过 jsDelivr 加载，浏览器需要能够访问该 CDN。无需公式的页面可以在 front matter 中设置 `math: false`。

新文章请添加一段**不含公式的纯文本 `description`**，供首页摘要和搜索描述使用。首页不再截取整篇正文，避免截断公式：

```yaml
---
layout: post
title: "文章标题"
author: "Ning Xia"
categories: notes
description: "一两句介绍这篇文章的内容。"
---
```

## 留言板

留言保存在本仓库的 [GitHub Discussions](https://github.com/NingXia233/NingXia233.github.io/discussions) 中，无需 LeanCloud、Valine 或自行维护服务器。

- 网站导航中的“留言板”提供公开留言列表和新留言入口。
- 文章底部按标题查找已有讨论，并提供带文章标题、原文链接的新留言入口。
- 阅读公开留言不需要登录；发表和回复需要 GitHub 账号。留言会在 GitHub 打开，不会内嵌进本站。
- 本仓库已启用 Discussions；公开留言入口可用。维护者可以回复、锁定或删除不合适的讨论。
- `_config.yml` 的 `comments.repository` 控制目标仓库，`comments.enabled: false` 关闭文章留言入口；单篇文章可以设置 `comments: false`。

这是一种使用 GitHub 保存共享留言的方案。纯静态网页自身无法持久保存所有访客共享的留言；浏览器本地存储也无法替代公开留言板。若以后需要在页面内直接阅读和回复，可再接入 Giscus；这需要安装 Giscus GitHub App 并选择讨论分类。

## 部署与主题来源

站点通过本仓库的 `gh-pages` 分支部署到 GitHub Pages，保留 Jekyll 原生构建方式，无需自定义构建插件。修改后可在 GitHub 的 Pages 设置中检查部署状态。

视觉主题基于 [Lagrange](https://github.com/LeNPaul/Lagrange)，保留其窄栏、衬线字体和简洁布局，使用暖棕色的旧纸张配色。原主题的 MIT 许可与作者版权信息保留在 [LICENSE.md](LICENSE.md)，`lagrange.gemspec` 仍记录主题的原始包信息。本站文章和创作属于各自作者；主题许可不代表原创内容可任意转载。
