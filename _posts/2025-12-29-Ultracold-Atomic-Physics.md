---
layout: post
title: "Ultracold Atomic Physics"
author: "Ning Xia"
categories: notes
tags: [documentation]
image: cutting.jpg
---

冷原子物理核心概念概览：

1. 两体相互作用
2. BEC、BCS和Hubbard模型
3. 利用同伦群进行的拓扑分类
4. 三大动力学与开放系统

**两体相互作用**

- 如何理解散射长度？物理含义以及在多体相互作用中扮演的作用？


**BEC、BCS和Hubbard模型**


- 如何理解Bogoliubov准粒子与激发态？

- 什么是BEC-BCS Crossover？ 

- Bose Hubbard模型和 Fermi Hubbard模型重要性质对比


**利用同伦群进行的拓扑分类**

| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

- 如何理解SSH相变的参数？


**三大动力学与开放系统**

通过调整系统的参数，我们可以在不同的动力学下驱动系统，探究不同的性质。根据系统参数随时间的改变方式，有三种我们经常关心的动力学：1. Quench Dynamics; 2. Floquet Dynamics; 3. Ramping Dynamics

- Quench Dynamics

即系统的参数在一瞬间突然改变，系统的态将如何进行演化。借助这一动力学，我们可以研究热化的概念，即系统从初态出发如何演化为热平衡态。

- Floquet Dynamics

考虑系统的参数是周期变化的，借助这一动力学我们可以对电子能带系统进行工程调控。

- Ramping Dynamics

考虑系统的参数是线性增长的，即扫描模式。借助这一动力学我们可以研究相变过程中究竟发生了什么。

DS gen:

您的问题涉及了统计物理和量子动力学中一组深刻且相互关联的概念。我将系统地梳理这些概念及其关系。

---

### 1. 二级相变与标度率
这是理解所有后续概念的基础。

**核心思想**： 二级相变（连续相变）发生在临界点，其特点是序参量连续地从零开始增长，伴随着关联长度和弛豫时间的发散。

**标度率**： 在临界点附近，系统的热力学量和关联函数表现出普适的幂律行为，其指数称为**临界指数**。这些幂律关系就是**标度率**。它们描述了当系统接近临界点时（如 $T \to T_c$），各种物理量如何变化。

一些关键的标度率定义（以温度为例）：

*   **关联长度发散**： $\xi \sim |\epsilon|^{-\nu}$
    *   $\epsilon = (T - T_c)/T_c$ 是约化温差。
    *   $\nu$ 是关联长度临界指数。这是最重要的指数之一。
*   **弛豫时间发散（临界减速）**： $\tau \sim \xi^z \sim |\epsilon|^{-z\nu}$
    *   $z$ 是动力学临界指数。这描述了系统在临界点附近“反应”变得极其缓慢。
*   **序参量消失**： 对于对称相（$T > T_c$），序参量 $M = 0$；对于有序相（$T < T_c$），$M \sim |\epsilon|^{\beta}$。
*   其他还有磁化率、比热等的标度率。

**核心要点**： 平衡态标度率描述了系统**无限接近**临界点时的静态和动态行为。关联长度 $\xi$ 的发散是导致一切奇异行为的根源。

---

### 2. 线性扫描动力学
这是一个**非平衡过程**的驱动协议。

**定义**： 通过一个外部控制参数（如温度 $T$、磁场 $h$、相互作用强度 $g$ 等），以恒定速率驱动系统穿过临界点。
例如： $g(t) = g_c (1 - t/\tau_Q)$，其中 $g_c$ 是临界值，$\tau_Q$ 是扫描时间（或称淬火时间）。

*   **快淬火**： $\tau_Q$ 很小，系统完全无法跟上外部变化，经历强烈的非平衡过程。
*   **慢淬火**： $\tau_Q$ 很大，理想情况下系统可绝热地演化，始终保持瞬时基态。
*   **关键问题**： 当以有限速率 $\tau_Q$ 扫描时，系统会发生什么？它还能保持绝热吗？这就是 **Kibble-Zurek 机制** 要回答的问题。

---

### 3. Kibble-Zurek 机制
这是一个**半定量理论**，用于预测在有限速率下穿越连续相变点时，非平衡拓扑缺陷（如涡旋、磁畴壁）的产生密度。

**核心物理图像**： 由于前述的**临界减速**（$\tau$ 发散），系统在穿越临界点时无法保持绝热。KZ 机制将动力学过程分为三个阶段：

1.  **绝热阶段（远离临界点）**： 当系统离临界点足够远时，弛豫时间 $\tau$ 很短，系统能轻松跟上参数的变化，保持瞬时平衡态。
2.  **冻结阶段（靠近临界点）**： 当接近临界点时，$\tau$ 急剧增长。存在一个 **“冻结时间” $\hat{t}$**，此时系统的**反应时间 $\tau(t)$** 开始超过**参数剩余的变化时间**（$|\epsilon/\dot{\epsilon}|$）。从这一刻起，系统的动力学“冻结”，其关联长度 $\hat{\xi}$ 停止增长，序参量涨落被“锁定”。
3.  **解冻后阶段（穿过临界点后）**： 离开临界区域后，弛豫时间再次变短，系统“解冻”。此时，在冻结阶段形成的、具有特征尺度 $\hat{\xi}$ 的局域有序区域（因果斑）开始相互匹配。由于这些区域的序参量相位是独立随机的，在它们的边界处会形成拓扑缺陷。

**KZ 标度律的推导**：
冻结条件为： $\tau(t) = |\epsilon / \dot{\epsilon}|$。
假设线性扫描： $\epsilon(t) = t / \tau_Q$ （设 $t=0$ 为临界点），则 $\dot{\epsilon} = 1/\tau_Q$。
利用平衡标度率： $\tau \sim |\epsilon|^{-z\nu}$， $\xi \sim |\epsilon|^{-\nu}$。

*   由冻结条件 $|\epsilon|^{-z\nu} \sim |\epsilon| \tau_Q$，解得**冻结时的约化温差**： $|\hat{\epsilon}| \sim \tau_Q^{-1/(1+z\nu)}$。
*   代入关联长度标度率，得到**冻结关联长度（即缺陷平均间距）**： $\hat{\xi} \sim |\hat{\epsilon}|^{-\nu} \sim \tau_Q^{\nu/(1+z\nu)}$。
*   因此，在 $d$ 维空间中，**拓扑缺陷的密度**标度为： $n_{defect} \sim \hat{\xi}^{-d} \sim \tau_Q^{-d\nu/(1+z\nu)}$。

**核心要点**： KZ 机制将**非平衡动力学**的后果（缺陷密度）与**平衡临界指数** ($\nu, z$) 和**驱动速率** ($\tau_Q$) 联系了起来，形成了一个可检验的标度预言。它是连接平衡标度率与非平衡动力学的桥梁。

---

### 4. 与 Landau-Zener 转变的关系
LZ 转变是量子力学中一个**两能级系统**的精确可解模型。

**场景**： 一个二能级系统的能隙 $\Delta$ 随时间线性变化，例如：$H(t) = (\Delta t/2) \sigma_z + V \sigma_x$。初始时刻 ($t \to -\infty$) 系统处于一个本征态，当 $t$ 扫过 Avoided Crossing（最小能隙处）时，有一定概率跃迁到另一个能级。

**跃迁概率**： $P_{LZ} \sim \exp(-\pi \Delta^2 / (2\hbar |v|))$，其中 $v = d(\epsilon_1 - \epsilon_2)/dt$ 是能级差的变化率。

**与 KZ 机制的联系**：
1.  **类比**： 一个连续相变在均值场层面（或对于一个单一集体模式），可以看作是一个**软模**（能隙 $\Delta \sim |\epsilon|^{z\nu}$）的关闭与 reopening。穿越临界点的过程，类似于一个**多体版本的 Avoided Crossing**。
2.  **关键区别**：
    *   **LZ 模型**： 适用于**有限能隙**的**两能级**系统。跃迁概率在慢速极限下趋于零（指数小）。
    *   **KZ 机制**： 适用于**能隙闭合**（关联长度发散）的**多体**系统。在慢速极限下，激发（缺陷）概率以幂律趋于零，而非指数。这是因为临界点附近的低能激发是连续的、无穷多的。
3.  **统一视角**： 如果将 LZ 公式中的能隙 $\Delta$ 用临界标度 $\Delta \sim |\epsilon|^{z\nu}$ 替换，并将线性扫描代入，经过适当推导（在冻结时间 $\hat{t}$ 处“截断”绝热动力学），可以得到幂律形式的 **“LZ 型” 激发密度标度**，其结果与 KZ 标度律一致。因此，KZ 机制可以被视为**在临界点附近，适用于多体系统的 LZ 转变的推广**。远离临界点时，系统行为会回归到标准的 LZ 图像。

---

### 总结与关系图

**逻辑链条**：

1.  **基础**： **二级相变**的平衡态特性由其**标度率**（临界指数 $\nu, z, \beta...$）描述，核心是关联长度 $\xi$ 和弛豫时间 $\tau$ 的发散。
2.  **驱动**： **线性扫描动力学**是以有限速率 $\tau_Q$ 驱动系统穿过临界点的具体协议。
3.  **非平衡响应**： **Kibble-Zurek 机制**利用平衡标度率，分析了在临界减速下系统动力学的“冻结”，并预言了非平衡拓扑缺陷的产生密度服从 $\tau_Q$ 的幂律标度。`Ramping Dynamics` 是其输入，`Scaling Laws of 2nd-order Phase Transition` 是其理论工具。
4.  **简化模型**： **Landau-Zener 转变**是一个精确可解的两能级非平衡模型。KZ 机制可以看作是在临界点（能隙闭合）附近，对多体系统 LZ 型行为的标度理论描述。

**关系图**：
```
平衡态标度理论 (标度率：ξ∼|ε|^{-ν}, τ∼|ε|^{-zν})
         ↓ (提供理论基础)
线性扫描动力学 (驱动协议：ε(t)=t/τ_Q)
         ↓ (产生非平衡过程)
Kibble-Zurek 机制 (预测：n_defect ∼ τ_Q^{-dν/(1+zν)})
         ↑ (概念推广与标度类比)
Landau-Zener 转变 (两能级模型：P_LZ ∼ exp(-常数/|v|))
```

简而言之，**KZ 机制是使用平衡态二级相变的标度率，来预测在特定线性扫描动力学下，系统非平衡行为（如缺陷生成）的一个普适理论框架，而 LZ 转变是其在简单两能级系统中的对应物和前身。**



- Open System

开放系统的观点来自于对封闭系统的不完备描述。环境的耦合与相互作用将耗散系统的能量引入非厄米的哈密顿量。

通常我们假设环境没有任何特征，它将为系统带来随机的Langevin力$\xi$，我们要求Langevin力的关联函数满足特定的关系，例如最重要的一项
$\langle \xi(t)\xi^\dagger(t')\rangle = 2\nu\delta(t-t')$，这些关系恰好使得系统在时间演化中能够保持(i)对易关系和(ii)密度矩阵的条件。

开放系统的描述来自于和封闭系统的对比，我们列出以下表格：

| System  | Closed System | Open System |
|-------|-------|-------|
| Hamiltonian | Herimitian $H^\dagger = H$ | Non-Hermitian with Langevin Force $H=H_0 - i\nu O^\dagger O + O^\dagger \xi + O \xi^\dagger$ |
| Heisenberg Picture | $W(t) = U^\dagger(t) W U(t)$ | $W(t)=\langle U^\dagger(t) W U(t)\rangle_\xi$ |
| Schrodinger Picture| Schrodinger equation: $i\hbar\frac{\partial \psi}{\partial t}=H\psi$ | Lindbladian equation: $\frac{d\rho}{dt}=-i[H_0,\rho]-\nu\{\rho,O^\dagger O \}+2\nu O \rho O^\dagger$|
|Spectrum | Eigenvalues of $H$: lowest $E_0$ for ground state | Lindblad spectrum $L$: $\alpha_l-i\beta_l$, $\beta_l=0$ for steady state
|Symmetry| $U\psi=e^{i\theta}\psi$ | Strong symmetry $U\rho = e^{i\theta}\rho$, Weak symmetry $U\rho U^\dagger = \rho$ |

借助类比，在封闭系统中我们研究系统的薛定谔方程和哈密顿量$H$的本征值问题，而在开放系统中我们研究Lindbladian方程。其中由于密度矩阵方程的求解并不方便，我们可以通过Operator-to-State关系:
$$
\rho = \sum_{ij}\rho_{ij}|i\rangle \langle j|\to |\rho\rangle\rangle = \sum_{ij}\rho_{ij}|i\rangle |j\rangle
$$
于是可以将Lindbladian方程中的算子提取成Lindbladian矩阵$L$，它作用在double的态空间中$|\rho\rangle\rangle$，因此Lindbladian算符$L$成为了开放系统中的能谱问题的研究对象。