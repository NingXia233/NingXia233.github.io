---
layout: post
title: "机器学习笔记：概论与自动微分"
author: "Ning Xia"
description: "从物理问题出发，理解机器学习的表示、优化与泛化；沿计算图推导前向与反向自动微分、神经网络反向传播及变分能量梯度，并用代码核验。"
categories: notes
tags: [documentation]
image: /assets/img/covers/automatic-differentiation.webp
image_width: 1672
image_height: 941
image_alt: "棕色前向路径与灰绿色回传路径交织的计算图"
---

***创作声明：这一部分的笔记整理自清华大学物理系罗迪老师的课堂讲授内容，经过笔者理解整理后记录在此。***

> 本文在原有课堂笔记的基础上，补充了概念辨析、公式推导、图示和可运行示例。后续的整理与延伸用于串联笔者的理解，不代表课堂逐字记录，也不将补充内容归为老师的原话。

对于学物理的人来说，机器学习并不是一个完全陌生的问题。给定一组实验或数值数据，我们希望找到能描述它们的函数；给定一个含有许多变分参数的波函数，我们希望找到使能量最低的一组参数。这些问题都包含两个环节：**选择一个能够表达目标的模型，以及找到合适的模型参数。**

当模型从几个参数变成几百万个参数时，计算导数就成了一项核心任务。这篇笔记从机器学习的基本分类出发，逐步走到计算图、自动微分和神经网络的反向传播，最后再回到一个熟悉的物理问题：变分能量的梯度。

## 一、机器学习究竟在学习什么？

### 1. 按照学习任务分类

按照数据中提供的信息和学习的目标，可以先区分以下三类。

- **监督学习（Supervised Learning）**：训练样本包含输入与目标输出，例如 $$\{(x_i,y_i)\}_{i=1}^{N}$$。目标可以是离散的类别，这就是分类问题（Classification）；也可以是连续的数值，这就是回归问题（Regression）。判断一张图对应哪一种物相是分类，根据原子构型预测能量和力则是回归。
- **非监督学习（Unsupervised Learning）**：没有逐个样本给定的目标标签，希望从数据中发现结构。例如聚类（Clustering）尝试发现样本之间的分组关系，降维尝试寻找较少的有效自由度，生成建模则尝试学习数据的概率分布，并产生符合该分布的新样本。聚类的类别数可以事先指定，也可以由具体方法估计，并不总是由算法自动决定。
- **强化学习（Reinforcement Learning）**：学习者与环境交互，通过动作、状态变化和奖励学习策略。它的标准框架之一是马尔可夫决策过程（Markov Decision Process），通常希望最大化期望累计奖励。它与随机过程、动态规划以及非平衡问题存在联系，但具体对应关系需要结合状态、动力学和奖励的定义来讨论。

这些分类的边界并不绝对。例如，自监督学习可以从数据本身构造预测目标，不需要人工逐条标注；生成模型也可以在给定类别或文本条件下训练。因此，“有没有监督”和“能不能生成”描述的是不同方面。

生成模型尤其容易和统计物理建立直觉联系。统计力学中，我们经常由能量函数出发计算分布；生成建模则可以从样本出发，学习一个分布 $$p_\theta(x)$$。自回归模型（Autoregressive Model）、流模型（Flow-based Model）和扩散模型（Diffusion Model）是其中几类重要方法。这里的“逆问题”是一种有用的类比：仅从有限样本恢复真实分布通常既不唯一，也不精确，需要模型假设和统计估计。

### 2. 按照理论问题区分：表示、优化与泛化

另一种划分并不是把算法分成三种，而是把研究机器学习时需要回答的问题分成三个层次。

**表示（Representation）**关心：我们选择的函数族能表达什么？设模型为 $$f_\theta$$，参数为 $$\theta\in\mathbb{R}^{P}$$。即使某类神经网络具有通用逼近性质，也不意味着一个给定宽度、深度的网络能高效表达任何函数；更不意味着训练过程一定能找到那组参数。对称性、局域性和守恒律等物理先验，往往可以帮助我们选择更合适的表示。

**优化（Optimization）**关心：在选定的函数族中，如何找到损失较小的参数？随机梯度下降是更新参数的方法；反向传播是高效计算梯度的方法。两者分工不同：算出梯度以后，还需要优化器决定怎样使用它。

**泛化（Generalization）**关心：在有限训练数据上得到的模型，对未见过的数据表现如何？最基本的讨论通常假设训练样本与测试样本来自同一分布。泛化并不等同于外推：在相同分布下识别一张未见过的图片也是泛化；预测训练温区之外的新物相则额外涉及分布变化或外推，通常需要更强的假设。

这三个层次需要一起考虑。模型太简单可能无法表达目标，模型很强但优化失败也无法得到好结果，而训练误差很小仍然可能只是记住了有限样本。

## 二、从损失函数到随机梯度下降

对于监督学习，可以用单个样本的损失 $$\ell(f_\theta(x),y)$$ 衡量预测误差。理想情况下，我们关心数据分布上的期望损失：

$$
\mathcal{R}(\theta)
=\mathbb{E}_{(x,y)\sim p_{\mathrm{data}}}
\left[\ell(f_\theta(x),y)\right].
$$

真实的数据分布通常未知，于是用训练集上的平均值近似它，并且可以加入正则项：

$$
\mathcal{L}(\theta)
=\frac{1}{N}\sum_{i=1}^{N}\ell(f_\theta(x_i),y_i)
+\lambda\Omega(\theta).
$$

例如，连续量回归可以使用平方损失 $$\ell(\hat y,y)=\frac{1}{2}\lVert\hat y-y\rVert^2$$；分类中则常使用交叉熵。正则项 $$\Omega$$ 可以约束参数大小，但它不能代替独立数据上的检验。训练集用于更新参数，验证集用于选择模型和超参数，测试集用于最后评估；反复根据测试结果调整模型，会削弱测试结果的独立性。

对于一组连续参数，一个直接的更新方式是梯度下降：

$$
\theta_{t+1}
=\theta_t-\eta_t\nabla_\theta\mathcal{L}(\theta_t),
$$

其中 $$\eta_t$$ 是学习率。负梯度给出当前点附近使损失下降最快的欧氏方向，但只是一阶局部信息；学习率过大时，一步更新仍然可能使损失上升。

如果每次都遍历整个训练集，计算开销可能很大。随机梯度下降（Stochastic Gradient Descent，SGD）及其小批量形式，每次只取一个大小为 $$B$$ 的批次 $$\mathcal{B}_t$$：

$$
\begin{aligned}
g_t
&=\frac{1}{B}\sum_{i\in\mathcal{B}_t}
\nabla_\theta\ell(f_{\theta_t}(x_i),y_i)
+\lambda\nabla_\theta\Omega(\theta_t),\\
\theta_{t+1}&=\theta_t-\eta_t g_t.
\end{aligned}
$$

在固定当前参数、均匀抽样的条件下，批次平均梯度是训练集平均梯度的无偏估计。不同批次给出不同方向，因此轨迹会有随机波动。这里真正需要自动微分回答的问题是：**在每一个当前参数点，如何高效地算出损失对全部参数的梯度？**

<figure>
  <img src="{{ '/assets/img/notes/autodiff-training.svg' | relative_url }}" alt="训练循环：样本经过模型得到预测，再计算标量损失，反向计算参数梯度，由优化器更新参数。" loading="lazy">
  <figcaption>图 1：训练循环。自动微分负责计算梯度，优化器负责更新参数；泛化表现需要在独立数据上检查。</figcaption>
</figure>

## 三、三种求导方法：符号、数值与自动微分

对于一个由程序实现的复杂函数，求导大致有三条路线。

### 1. 符号微分：对表达式进行代数变换

符号微分根据求导规则，从函数的符号表达式得到新的导数表达式。例如：

$$
f(x)=\sin(x^2)
\quad\Longrightarrow\quad
f'(x)=2x\cos(x^2).
$$

这种方式能够给出显式公式，适合解析研究。对于复杂表达式，直接展开和反复代入可能造成表达式膨胀；不过，符号系统也可以通过化简和复用公共子表达式减轻这个问题。因此，不能把“符号微分一定指数变慢”当成普遍结论。

### 2. 数值微分：用函数值近似导数

有限差分不需要知道函数内部如何计算。以一元函数为例，中心差分写成：

$$
D_h f(x)=\frac{f(x+h)-f(x-h)}{2h}.
$$

为什么它通常比前向差分更准确？假设函数足够光滑，在 $$x$$ 附近作 Taylor 展开：

$$
\begin{aligned}
f(x+h)
&=f(x)+hf'(x)+\frac{h^2}{2}f''(x)\\
&\quad+\frac{h^3}{6}f'''(x)+\frac{h^4}{24}f^{(4)}(x)+O(h^5),\\
f(x-h)
&=f(x)-hf'(x)+\frac{h^2}{2}f''(x)\\
&\quad-\frac{h^3}{6}f'''(x)+\frac{h^4}{24}f^{(4)}(x)+O(h^5).
\end{aligned}
$$

相减后，偶数次项抵消，再除以 $$2h$$，得到：

$$
D_h f(x)
=f'(x)+\frac{h^2}{6}f'''(x)+O(h^4).
$$

这说明中心差分的截断误差通常是 $$O(h^2)$$。但是，**步长并不是越小越好**。在浮点计算中，若两次函数求值的绝对误差量级约为 $$\varepsilon S$$，其中 $$\varepsilon$$ 是机器精度、$$S$$ 是函数求值的典型尺度，差分中的误差还会被 $$h$$ 放大。总误差可以粗略估计为：

$$
\lvert D_h f-f'\rvert
\lesssim C_1h^2+\frac{C_2\varepsilon S}{h}.
$$

第一项随步长减小而减小，第二项反而增大。在这个近似模型下，使上界最小的步长满足：

$$
2C_1h-\frac{C_2\varepsilon S}{h^2}=0,
\qquad
h_{\mathrm{opt}}\sim
\left(\frac{C_2\varepsilon S}{2C_1}\right)^{1/3}.
$$

将变量与函数尺度归一到合适的量级后，常把这个结果简记为 $$h\sim\varepsilon^{1/3}$$。它只是选步长的量级参考；函数的光滑性、数值噪声和高阶导数都会影响实际结果。

对含 $$P$$ 个参数的标量损失，逐坐标中心差分通常需要约 $$2P$$ 次完整函数求值。它很适合抽查导数，却不适合每一步都为数百万参数计算完整梯度。

### 3. 自动微分：沿实际计算执行链式法则

自动微分（Automatic Differentiation，AD）的出发点是：复杂程序可以分解成加法、乘法、正弦、矩阵乘法等基本运算；只要知道每个运算的局部导数，就能沿着它们的组合应用链式法则。

它不必构造一条巨大的符号导数表达式，也不需要选择有限差分步长。在光滑处，自动微分计算的是程序所表示函数的导数，误差主要来自浮点运算及各原语的实现，而没有有限差分的步长截断误差。这仍然不意味着数值结果绝对精确：溢出、舍入、病态问题，以及近似求解器本身的误差都可能影响结果。

自动微分的优势也不只是“用空间换时间”。更关键的是**复用中间结果，并按照函数输入和输出的结构选择传播方向**。反向模式通常需要保留或重新计算中间量，确实存在内存与计算量之间的权衡；前向模式则有不同的存储特点。

| 方法 | 基本做法 | 主要特点与用途 |
| --- | --- | --- |
| 符号微分 | 对表达式应用代数求导规则 | 可得到显式导数，适合解析推导；复杂表达式需要化简和复用 |
| 数值微分 | 扰动输入，用函数值做差分 | 实现简单，适合梯度核验；存在截断与舍入误差，完整梯度成本随参数数目增长 |
| 自动微分 | 对程序中的基本运算传播导数 | 适合复杂可微程序；需要正确的局部导数规则，并受内存和浮点计算限制 |

## 四、计算图：把一个函数拆成局部运算

考虑二元函数：

$$
f(x,y)=xy+\sin x.
$$

把它拆成三个中间步骤：

$$
u=xy,\qquad v=\sin x,\qquad f=u+v.
$$

每个变量或运算结果对应一个节点，有向边表示数据依赖。只要程序的这次执行没有形成循环依赖，就可以用有向无环计算图表示；循环程序也可以按实际执行的有限步数展开。

<figure>
  <img src="{{ '/assets/img/notes/autodiff-graph.svg' | relative_url }}" alt="函数 f(x,y)=xy+sin x 的计算图：x 和 y 经乘法得到 u，x 另经正弦得到 v，u 与 v 相加得到 f；回传时 x 接收来自两条路径的梯度贡献。" loading="lazy">
  <figcaption>图 2：一个共享输入的计算图。同一个 x 进入两条路径，因此反向传播时必须累加两份贡献。</figcaption>
</figure>

局部导数都很简单：

$$
\frac{\partial u}{\partial x}=y,\quad
\frac{\partial u}{\partial y}=x,\quad
\frac{\partial v}{\partial x}=\cos x,\quad
\frac{\partial f}{\partial u}=\frac{\partial f}{\partial v}=1.
$$

于是，链式法则给出：

$$
\begin{aligned}
\frac{\partial f}{\partial x}
&=\frac{\partial f}{\partial u}\frac{\partial u}{\partial x}
+\frac{\partial f}{\partial v}\frac{\partial v}{\partial x}
=y+\cos x,\\
\frac{\partial f}{\partial y}
&=\frac{\partial f}{\partial u}\frac{\partial u}{\partial y}=x.
\end{aligned}
$$

这里最容易忽略的是加号：一个变量影响最终输出的路径可能不止一条，每条路径的贡献都要保留。计算图的作用，就是将这种依赖关系和局部求导组织成一个可执行的过程。

## 五、前向模式：让一个扰动沿计算图向前传播

令输入随一个辅助变量 $$t$$ 改变，并记：

$$
\dot x=\frac{\mathrm{d}x}{\mathrm{d}t},
\qquad
\dot y=\frac{\mathrm{d}y}{\mathrm{d}t}.
$$

对于每一个中间变量，同时计算它的数值和它沿这个方向的变化率：

$$
\begin{aligned}
u&=xy,&\dot u&=y\dot x+x\dot y,\\
v&=\sin x,&\dot v&=\cos x\,\dot x,\\
f&=u+v,&\dot f&=\dot u+\dot v.
\end{aligned}
$$

这就是前向模式自动微分。若种子取为 $$\dot x=1,\dot y=0$$，最后得到 $$\dot f=\partial f/\partial x$$；若取 $$\dot x=0,\dot y=1$$，就得到对 $$y$$ 的偏导。

但它不限于逐坐标求导。例如取 $$\dot x=1,\dot y=-1$$，便得到方向导数：

$$
\dot f=(y+\cos x)-x.
$$

更一般地，设 $$F:\mathbb{R}^{n}\to\mathbb{R}^{m}$$，其 Jacobian 矩阵为 $$J\in\mathbb{R}^{m\times n}$$，元素是 $$J_{ij}=\partial F_i/\partial x_j$$。给定输入方向 $$v\in\mathbb{R}^{n}$$，一次前向传播得到：

$$
\dot F=Jv.
$$

这叫 Jacobian–vector product（JVP）。无需先构造整个 Jacobian，就能知道指定扰动对所有输出的一阶影响。

## 六、反向模式：从输出的敏感度反推输入

对于标量输出 $$f$$，为每个节点 $$q$$ 定义伴随量：

$$
\bar q=\frac{\partial f}{\partial q}.
$$

先做一次普通的前向计算，得到中间值；再从输出设定种子 $$\bar f=1$$，按计算图的相反顺序传播：

$$
\begin{aligned}
\bar u&=\bar f\frac{\partial f}{\partial u}=1,
&\bar v&=\bar f\frac{\partial f}{\partial v}=1,\\
\bar x&=\bar u\frac{\partial u}{\partial x}
+\bar v\frac{\partial v}{\partial x}
=y+\cos x,
&\bar y&=\bar u\frac{\partial u}{\partial y}=x.
\end{aligned}
$$

在实现中，反向传播可以概括为每条边上的更新：

$$
\bar q\mathrel{+}=\bar r\frac{\partial r}{\partial q},
$$

其中 $$r$$ 是依赖 $$q$$ 的后继节点。使用累加，是为了正确处理共享节点；只有当一个节点的所有后继都处理完，才继续把它的伴随量传向前驱。

对于一般的向量输出 $$F$$，给定输出权重 $$w\in\mathbb{R}^{m}$$，反向模式求的是标量 $$w^{\mathsf T}F$$ 对输入的梯度：

$$
\nabla_x\left(w^{\mathsf T}F\right)=J^{\mathsf T}w.
$$

这通常叫 vector–Jacobian product（VJP）；若采用行向量约定，会把同一结果写成 $$w^{\mathsf T}J$$。本文始终把梯度写成列向量。

<figure>
  <img src="{{ '/assets/img/notes/autodiff-modes.svg' | relative_url }}" alt="前向模式把输入方向 v 传播成 Jv，反向模式把输出权重 w 传播成 J 转置乘 w；输入 n 维、输出 m 维时，完整 Jacobian 分别需要 n 个前向种子或 m 个反向种子。" loading="lazy">
  <figcaption>图 3：前向模式传播输入扰动，反向模式传播输出敏感度。二者都在执行链式法则，但选择了不同的传播方向。</figcaption>
</figure>

### 1. 为什么标量损失更适合反向模式？

设一次原函数计算的成本为 $$C$$，并假设基本运算的局部导数能够以与该运算相当的成本计算。一个方向的 JVP、一个种子的 VJP 通常都只需 $$O(C)$$ 量级的计算，常数取决于具体运算。

若要逐列构造完整 Jacobian，前向模式一般需要 $$n$$ 个输入基向量；若逐行构造，反向模式一般需要 $$m$$ 个输出基向量。因此：

| 目标 | 前向模式 | 反向模式 |
| --- | --- | --- |
| 一个指定输入方向的影响 | 一次 JVP | 通常不必使用反向模式完成这个任务 |
| 一个标量目标对全部输入的梯度 | 通常需要 n 个方向 | 一次前向计算与一次反向传播 |
| 完整的 m × n Jacobian | 通常 n 个种子 | 通常 m 个种子 |

多个种子可以向量化处理，但这不会让相应的计算量与存储量消失。完整 Jacobian 本身就含有 $$mn$$ 个元素；很多任务最好直接计算所需的乘积。

神经网络训练的典型结构正是“参数很多，损失只有一个标量”，因此反向模式尤其合适。若原模型的计算成本随参数规模增长，反向传播成本当然也会增长；这里说的是它与**一次模型计算的成本相比**通常只有常数倍开销，而不是与参数数目完全无关。

### 2. 内存从哪里来？

反向计算乘法节点的导数时，需要前向计算中的输入；计算激活函数的导数时，也常需要保存输入或输出。因此反向模式通常要保留计算图和部分中间量。

内存不足时，可以不保存全部激活，而是在反向阶段重新计算部分前向过程，这称为重计算或梯度检查点（Checkpointing）。它说明时间和空间确实可以交换，但这个权衡是反向模式的实现问题，不能代替自动微分本身的链式法则原理。

### 3. 在一个数值点上核验

取 $$x=2,y=3$$，角度采用弧度：

$$
\begin{aligned}
u&=6,\qquad v=\sin2\approx0.9092974268,\\
f&\approx6.9092974268,\\
\nabla f&=(3+\cos2,\ 2)^{\mathsf T}\\
&\approx(2.5838531635,\ 2)^{\mathsf T}.
\end{aligned}
$$

前向模式以 $$v=(1,-1)^{\mathsf T}$$ 为输入方向时，得到 $$Jv\approx0.5838531635$$；反向模式以输出种子 $$1$$ 回传时，得到上面的整个梯度。两者计算的对象不同，但与同一个 Jacobian 一致。

## 七、神经网络反向传播：把局部规则写成矩阵形式

神经网络中的反向传播（Backpropagation），就是反向模式自动微分在分层网络上的应用。下面明确写出维度，避免只记公式却弄不清转置的位置。

### 1. 前向计算与维度

考虑一个有 $$L$$ 层变换的全连接网络，所有向量都取列向量，参数和数据暂时都为实数：

$$
\begin{aligned}
a^{(0)}&=x\in\mathbb{R}^{d_0},\\
z^{(l)}&=W^{(l)}a^{(l-1)}+b^{(l)},\\
a^{(l)}&=\sigma_l(z^{(l)}),\qquad l=1,\ldots,L.
\end{aligned}
$$

其中：

$$
W^{(l)}\in\mathbb{R}^{d_l\times d_{l-1}},
\qquad
b^{(l)},z^{(l)},a^{(l)}\in\mathbb{R}^{d_l}.
$$

先假设激活函数逐元素作用。对单个样本，使用平方损失：

$$
\ell=\frac{1}{2}\lVert a^{(L)}-y\rVert^2,
\qquad y\in\mathbb{R}^{d_L}.
$$

### 2. 输出层的误差信号

定义每层的误差信号为：

$$
\delta^{(l)}=\nabla_{z^{(l)}}\ell\in\mathbb{R}^{d_l}.
$$

由平方损失先得到：

$$
\nabla_{a^{(L)}}\ell=a^{(L)}-y.
$$

再经过输出层激活函数，得到：

$$
\delta^{(L)}
=\left(a^{(L)}-y\right)\odot\sigma_L'(z^{(L)}),
$$

其中 $$\odot$$ 表示逐元素乘法。回归时常取输出激活为恒等函数，于是 $$\delta^{(L)}=a^{(L)}-y$$。

### 3. 从全微分推导权重、偏置和前一层的梯度

暂时省略层标，把一层写成 $$z=Wa+b$$。它的全微分是：

$$
\mathrm{d}z=(\mathrm{d}W)a+W\,\mathrm{d}a+\mathrm{d}b.
$$

若损失对 $$z$$ 的梯度是 $$\delta$$，则：

$$
\begin{aligned}
\mathrm{d}\ell
&=\delta^{\mathsf T}\mathrm{d}z\\
&=\delta^{\mathsf T}(\mathrm{d}W)a
+\delta^{\mathsf T}W\,\mathrm{d}a
+\delta^{\mathsf T}\mathrm{d}b\\
&=\operatorname{tr}\!\left[(\delta a^{\mathsf T})^{\mathsf T}\mathrm{d}W\right]\\
&\quad+(W^{\mathsf T}\delta)^{\mathsf T}\mathrm{d}a
+\delta^{\mathsf T}\mathrm{d}b.
\end{aligned}
$$

对照全微分中各个变量的系数，得到：

$$
\nabla_W\ell=\delta a^{\mathsf T},
\qquad
\nabla_b\ell=\delta,
\qquad
\nabla_a\ell=W^{\mathsf T}\delta.
$$

其中权重梯度是一个外积：$$\delta\in\mathbb{R}^{d_l}$$ 与 $$a\in\mathbb{R}^{d_{l-1}}$$ 产生 $$d_l\times d_{l-1}$$ 的矩阵，维度正好与权重一致。

恢复层标，再穿过前一层的逐元素激活函数，就有反向递推式：

$$
\boxed{
\delta^{(l)}
=\left[(W^{(l+1)})^{\mathsf T}\delta^{(l+1)}\right]
\odot\sigma_l'(z^{(l)})
}
\qquad (l=L-1,\ldots,1).
$$

对应的参数梯度为：

$$
\boxed{
\begin{aligned}
\nabla_{W^{(l)}}\ell
&=\delta^{(l)}(a^{(l-1)})^{\mathsf T}
\in\mathbb{R}^{d_l\times d_{l-1}},\\
\nabla_{b^{(l)}}\ell
&=\delta^{(l)}\in\mathbb{R}^{d_l}.
\end{aligned}
}
$$

于是整个训练步骤就清楚了：先从输入逐层算到损失，随后从输出层逐层计算误差信号和各层参数梯度，最后由优化器统一更新参数。反向计算尚未完成时，不应提前用新权重替换当前计算图所对应的旧权重。

### 4. 一个批次如何写？

把 $$B$$ 个样本沿列方向排在一起，记：

$$
A^{(l)}\in\mathbb{R}^{d_l\times B},
\qquad
\Delta^{(l)}\in\mathbb{R}^{d_l\times B}.
$$

这里 $$\Delta^{(l)}$$ 的第 $$s$$ 列定义为单样本损失 $$\ell_s$$ 对该样本 $$z_s^{(l)}$$ 的梯度，**尚未包含批次平均的因子**。若目标为 $$\mathcal{L}_{\mathcal{B}}=\frac{1}{B}\sum_s\ell_s$$，则：

$$
\begin{aligned}
\nabla_{W^{(l)}}\mathcal{L}_{\mathcal{B}}
&=\frac{1}{B}\Delta^{(l)}(A^{(l-1)})^{\mathsf T},\\
\nabla_{b^{(l)}}\mathcal{L}_{\mathcal{B}}
&=\frac{1}{B}\Delta^{(l)}\mathbf{1}_B.
\end{aligned}
$$

其中 $$\mathbf{1}_B\in\mathbb{R}^{B}$$ 是全一向量，第二式就是沿样本维度求和后取平均。若把 $$1/B$$ 提前放进输出层的误差信号，就不能在这里再次除以 $$B$$。正则项的梯度则另外加入。

### 5. 分类中为什么经常出现“预测减标签”？

对于分类的输出 logits $$z\in\mathbb{R}^{K}$$，softmax 给出：

$$
\begin{aligned}
p_i&=\frac{e^{z_i}}{\sum_{k=1}^{K}e^{z_k}},\\
\ell&=-\sum_{i=1}^{K}y_i\log p_i,
\qquad \sum_i y_i=1.
\end{aligned}
$$

softmax 不是逐元素激活，因为一个分量依赖所有 logits。先算它的 Jacobian：

$$
\frac{\partial p_i}{\partial z_j}
=p_i(\delta_{ij}-p_j).
$$

再对交叉熵应用链式法则：

$$
\begin{aligned}
\frac{\partial\ell}{\partial z_j}
&=-\sum_i\frac{y_i}{p_i}
\frac{\partial p_i}{\partial z_j}\\
&=-\sum_i y_i(\delta_{ij}-p_j)\\
&=-y_j+p_j\sum_i y_i=p_j-y_j.
\end{aligned}
$$

因此输出误差信号直接是 $$\delta^{(L)}=p-y$$。数值实现时应使用稳定的 log-softmax 或 logits 交叉熵接口，避免先计算巨大指数、再取对数带来的溢出和下溢。

## 八、一个可以直接运行的反向自动微分例子

下面只用 Python 标准库，实现标量的加法、乘法和正弦。每个节点保存数值，以及“父节点—局部导数”的边；反向时按照拓扑顺序的逆序累加梯度。它只用于展示原理，没有张量、广播和高阶求导功能。

~~~python
import math


class Value:
    def __init__(self, data, parents=()):
        self.data = float(data)
        self.parents = parents
        self.grad = 0.0

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data + other.data, ((self, 1.0), (other, 1.0)))

    __radd__ = __add__

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data * other.data,
                     ((self, other.data), (other, self.data)))

    __rmul__ = __mul__

    def sin(self):
        return Value(math.sin(self.data), ((self, math.cos(self.data)),))

    def backward(self):
        order, seen = [], set()

        def visit(node):
            if node in seen:
                return
            seen.add(node)
            for parent, _ in node.parents:
                visit(parent)
            order.append(node)

        visit(self)
        for node in order:
            node.grad = 0.0  # 本实现每次回传前清零整张图
        self.grad = 1.0
        for node in reversed(order):
            for parent, local_derivative in node.parents:
                parent.grad += node.grad * local_derivative


x, y = Value(2.0), Value(3.0)
f = x * y + x.sin()
f.backward()
print(f"f = {f.data:.10f}")
print(f"df/dx = {x.grad:.10f}, df/dy = {y.grad:.10f}")
assert math.isclose(x.grad, 3.0 + math.cos(2.0), abs_tol=1e-12)
assert math.isclose(y.grad, 2.0, abs_tol=1e-12)


# 用有限差分独立检查 x 方向的导数
def ordinary_f(a, b):
    return a * b + math.sin(a)


h = 1e-5
fd_x = (ordinary_f(2.0 + h, 3.0) - ordinary_f(2.0 - h, 3.0)) / (2 * h)
print(f"central difference = {fd_x:.10f}")
assert math.isclose(fd_x, x.grad, rel_tol=1e-8, abs_tol=1e-8)

# 同一个变量在同一次乘法中出现两次，也需要累加两条边
q = x * x
q.backward()
assert math.isclose(x.grad, 4.0, abs_tol=1e-12)
~~~

前三行输出约为：

~~~text
f = 6.9092974268
df/dx = 2.5838531635, df/dy = 2.0000000000
central difference = 2.5838531635
~~~

这段程序中有几个值得单独注意的细节。

- **每次更新后重新前向计算。** 这段代码在建图时固定了中间值和局部导数；改变输入数值后，应重新执行前向运算建立新图，不能只修改 <code>data</code> 后复用旧图。
- **必须用累加。** 在 $$x\times x$$ 中，两个输入边指向同一个节点；如果把梯度写成覆盖赋值，就会少算一份贡献。
- **清零和累加是接口约定。** 上面的教学实现每次回传前清零当前图中所有节点。PyTorch 等框架则通常将新梯度累加到叶张量的 <code>.grad</code> 中；训练时一般在每步前调用 <code>optimizer.zero_grad()</code>，再计算损失、回传和更新。刻意做跨批次梯度累积时，则需要相应地处理清零时机与损失缩放。
- **向量输出必须说明如何合成标量。** 对张量 <code>u</code>，<code>u.sum().backward()</code> 求的是各分量之和的梯度，即以全一向量为 VJP 种子；它不是完整 Jacobian。<code>u.mean()</code> 还会引入平均因子。
- **不可导点需要约定。** 例如 ReLU 在零点没有经典导数，框架通常采用约定的次梯度，PyTorch 对 ReLU 在零点取零。这里的例子全部处在光滑函数上；若用差分检验恰好跨越折点，就不能期待它与某个次梯度约定一致。
- **控制流并不自动变成光滑函数。** 自动微分通常沿实际执行的分支求导，不会对一个比较产生的离散选择直接求导。把张量转成普通数值、切断计算图或使用没有求导规则的外部运算，也会影响梯度能否正确传回。

实际检查大模型时，还可以取一个方向 $$v$$，比较 $$\nabla\mathcal{L}(\theta)^{\mathsf T}v$$ 与下面的中心差分：

$$
\frac{\mathcal{L}(\theta+hv)-\mathcal{L}(\theta-hv)}{2h}.
$$

这样只需两次损失求值，就可以抽查一个整体方向。检查时应固定随机种子与样本，使用足够的数值精度，并尝试几个合适的步长；一个方向通过也不能证明全部梯度都正确。

## 九、回到物理：归一化变分能量的梯度

机器学习中的“用梯度调整模型”，在物理中可以直接对应变分法。设参数化态为 $$\lvert\psi_\theta\rangle$$，它不必已经归一化。对于与参数无关的 Hermitian 算符 $$H$$，能量泛函是 Rayleigh 商：

$$
E(\theta)
=\frac{\langle\psi_\theta\rvert H\lvert\psi_\theta\rangle}
{\langle\psi_\theta\vert\psi_\theta\rangle}.
$$

以下假设参数 $$\theta_k$$ 为实数，态对参数可微且范数非零。记分子为 $$A$$、分母为 $$Z$$，则商的求导法则给出：

$$
\partial_k E
=\frac{\partial_k A}{Z}
-\frac{A}{Z^2}\partial_k Z
=\frac{\partial_k A-E\partial_k Z}{Z}.
$$

分别展开：

$$
\begin{aligned}
\partial_k A
&=\langle\partial_k\psi\rvert H\lvert\psi\rangle
+\langle\psi\rvert H\lvert\partial_k\psi\rangle\\
&=2\operatorname{Re}\langle\partial_k\psi\rvert H\lvert\psi\rangle,\\
\partial_k Z
&=\langle\partial_k\psi\vert\psi\rangle
+\langle\psi\vert\partial_k\psi\rangle\\
&=2\operatorname{Re}\langle\partial_k\psi\vert\psi\rangle.
\end{aligned}
$$

其中用到了 $$H=H^\dagger$$ 和能量为实数。代回即得：

$$
\boxed{
\partial_k E
=\frac{2\operatorname{Re}
\langle\partial_k\psi\rvert(H-E)\lvert\psi\rangle}
{\langle\psi\vert\psi\rangle}
}.
$$

这里的 $$-E$$ 项来自归一化分母，不能遗漏。它还给出一个直觉检验：若参数变化只把态乘以一个整体幅度，归一化能量不变，梯度应为零；若态恰好是本征态，满足 $$H\lvert\psi\rangle=E\lvert\psi\rangle$$，上式也立即为零。如果 $$H$$ 本身依赖参数，还需要另外加上 $$\langle\psi\rvert\partial_k H\lvert\psi\rangle/Z$$。

### 用采样把公式变成可计算的量

在离散正交基 $$\{\lvert s\rangle\}$$ 下，定义：

$$
\psi_\theta(s)=\langle s\vert\psi_\theta\rangle,
\qquad
p_\theta(s)=\frac{\lvert\psi_\theta(s)\rvert^2}{Z}.
$$

对于 $$\psi_\theta(s)\ne0$$ 的构型，再定义局域能量和对数导数：

$$
\begin{aligned}
E_{\mathrm{loc}}(s)
&=\frac{\sum_{s'}H_{ss'}\psi_\theta(s')}{\psi_\theta(s)},\\
O_k(s)&=\frac{\partial_k\psi_\theta(s)}{\psi_\theta(s)}.
\end{aligned}
$$

局部可选取对数分支时，$$O_k=\partial_k\log\psi_\theta$$。对于复波函数，保留这里的复数导数比值，并将参数仍看作实参数。

在求和和求导可交换、并能在相关求和项中合法使用这些比值时，利用 $$\lvert\psi\rvert^2 O_k^*=\psi\,\partial_k\psi^*$$，可把上面的内积改写为：

$$
\begin{aligned}
\frac{\langle\partial_k\psi\rvert H\lvert\psi\rangle}{Z}
&=\left\langle O_k^*E_{\mathrm{loc}}\right\rangle_{p_\theta},\\
\frac{\langle\partial_k\psi\vert\psi\rangle}{Z}
&=\left\langle O_k^*\right\rangle_{p_\theta}.
\end{aligned}
$$

从而：

$$
\boxed{
\begin{aligned}
\partial_k E=2\operatorname{Re}\Big[
&\left\langle O_k^*E_{\mathrm{loc}}\right\rangle_{p_\theta}\\
-&\left\langle O_k^*\right\rangle_{p_\theta}
\left\langle E_{\mathrm{loc}}\right\rangle_{p_\theta}
\Big].
\end{aligned}
}
$$

这就是一个协方差形式：波函数对参数的敏感度，与局域能量的涨落共同决定能量下降的方向。自动微分可以帮助计算模型给出的对数导数，Monte Carlo 采样则帮助估计期望值，二者承担不同任务。

上式最直接适用于所用有限构型空间中振幅非零的情形。若波函数有节点，除法与支撑集变化必须单独分析：零概率构型不能被采到，但其参数导数仍可能对原始内积有贡献，不能仅凭“概率为零”忽略。有限样本还会引入统计误差；对一批固定样本上的局域能量直接求导，也不会自动包含采样分布随参数变化的全部贡献，应使用正确的梯度估计式或等价的可微代理目标。

这样再看自动微分，它并不是神经网络独有的技巧。只要一个物理计算能被组织成具有明确导数规则的计算过程，我们就有机会把它变成一个可优化的模型；但如何选择表示、如何估计目标、以及优化结果是否符合物理，仍然需要各自判断。

## 参考与进一步阅读

1. D. E. Rumelhart, G. E. Hinton, R. J. Williams, [Learning representations by back-propagating errors](https://doi.org/10.1038/323533a0), *Nature* **323**, 533–536 (1986)。神经网络反向传播的经典论文。
2. A. Griewank, A. Walther, [Evaluating Derivatives: Principles and Techniques of Algorithmic Differentiation, 2nd ed.](https://doi.org/10.1137/1.9780898717761), SIAM (2008)。系统讨论前向、反向模式与复杂度。
3. PyTorch 官方文档：[Autograd mechanics](https://docs.pytorch.org/docs/stable/notes/autograd.html)；[torch.autograd.backward](https://docs.pytorch.org/docs/stable/generated/torch.autograd.backward.html)。可结合本文检查图的构造、梯度累加、非光滑函数规则与 VJP 种子。
