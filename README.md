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

绝对值建议写成 `\lvert\psi\rvert`，避免原始竖线 `|` 在含行内公式的段落中被 GFM 误解析为表格分隔符。

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

公开留言保存在本仓库的 [GitHub Discussions](https://github.com/NingXia233/NingXia233.github.io/discussions) 中。主页底部和导航中的“留言板”使用同一个嵌入组件；文章底部保留带文章标题、原文链接的讨论入口。

主页已准备好 [giscus](https://giscus.app/zh-CN) 嵌入，固定绑定现有的 [Discussion #2](https://github.com/NingXia233/NingXia233.github.io/discussions/2)。固定编号使主页和 `/guestbook/` 共用一个留言本，修改站点标题、URL 或重新部署均不会更换讨论或清除评论。旧文章下独立创建的讨论仍保留在 GitHub，不会自动迁入 #2。

### 启用嵌入

当前 `comments.giscus.enabled: false`，因为尚未确认 giscus App 已安装；此时两处仍提供可用的 GitHub 留言入口，不展示无法使用的组件。

1. 打开 [giscus GitHub App](https://github.com/apps/giscus)，安装到 `NingXia233/NingXia233.github.io`。仓库已公开并启用 Discussions。
2. 在 `_config.yml` 中将 `comments.giscus.enabled` 改为 `true`。已填写真实仓库 ID `R_kgDOOB13OQ` 和现有讨论编号 `2`，无需再填写分类 ID。
3. 部署后打开主页留言区，确认能阅读讨论，并用 GitHub 登录验证发言/回复。没有登录的访客仍可阅读。

按固定编号读取已有讨论不需要分类 ID。如果想改用新讨论，可先在 GitHub 建好讨论，再修改 `discussion_number`。也可以把它留空，并从 [giscus 配置页](https://giscus.app/zh-CN) 填入真实 `category` 和 `category_id`，以固定 `term: homepage-guestbook` 自动匹配/创建讨论；此时不要随意改 `term` 或分类，否则可能关联到另一个讨论。推荐只允许维护者新建话题的 Announcements 分类，访客仍可在指定话题下回复。

`comments.enabled: false` 会关闭主页、留言板和文章的留言入口；单篇文章可设置 `comments: false`。giscus 使用官方脚本 `https://giscus.app/client.js`，浏览器需要能访问 giscus 和 GitHub；脚本被阻止或禁用 JavaScript 时仍可通过页面上的链接去 GitHub 留言。网站代码无需放置任何 GitHub token。

### 保存和删除权限

- 刷新页面、换设备、清理浏览器缓存、重新构建或部署网站不会清空留言。删除网页上的嵌入组件也不会删除 GitHub 中的评论。
- 发言需要 GitHub 账号和 giscus 的 OAuth 授权，不支持免登录匿名投稿。
- 普通访客不能清空别人的留言；评论作者可管理自己的评论，仓库维护者可在 GitHub 管理、锁定或删除讨论及评论。
- 无法承诺“只能通过修改网站代码删除留言”：实际数据和权限在 GitHub，删除不要求改网站代码。隐藏网页按钮不会改变 GitHub 的权限。参见 [GitHub 评论管理权限](https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-disruptive-comments)。

若需要免登录投稿、只开放新增/查询、仅管理员可删除，就需要另接带持久存储的后端或评论服务；GitHub Pages 本身只托管静态内容，浏览器本地存储也不能提供全体访客共享的留言板。

## 部署与主题来源

站点通过本仓库的 `gh-pages` 分支部署到 GitHub Pages，保留 Jekyll 原生构建方式，无需自定义构建插件。修改后可在 GitHub 的 Pages 设置中检查部署状态。

视觉主题基于 [Lagrange](https://github.com/LeNPaul/Lagrange)，保留其窄栏、衬线字体和简洁布局，使用暖棕色的旧纸张配色。原主题的 MIT 许可与作者版权信息保留在 [LICENSE.md](LICENSE.md)，`lagrange.gemspec` 仍记录主题的原始包信息。本站文章和创作属于各自作者；主题许可不代表原创内容可任意转载。
