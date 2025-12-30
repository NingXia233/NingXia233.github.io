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

# 两体相互作用

在冷原子系统中，相互作用通常具有以下三个重要特征：
- 短程：如果两个原子相距大于一定距离(力程$r_0$)，可以近似认为它们之间没有相互作用
- 稀薄：冷原子气体非常稀薄，平均间距远远大于相互作用力程
- 低能：冷原子处于极低温，原子动能非常低，在处理两个冷原子的相互作用时，我们总是关心低能散射极限$kr_0\ll 1$

现在考虑研究两个冷原子的相互作用，转换到质心坐标系中，二体问题总是可以约化为单粒子在势场中的散射。问题的焦点在于相互作用势场的性质。然而，势场的函数形式可能千奇百怪，我们难道对于不同的函数都要进行复杂的PDE求解才能够得到系统的信息吗？特别是在我们只关心低能散射极限的情况下。

因此，对于散射问题的处理，我们需要找到能够普适刻画相互作用行为的东西。考虑散射时两个粒子相对位置是对称的，利用旋转对称性可以对波函数进行分波法处理，低能极限下我们关注s波通道的散射。

利用短程条件，在无穷远处，波函数的渐进行为是球面波$\sim {\sin(kr+\delta_k)}/{kr}$，相互作用散射造成的效果完全由散射相移$\delta_k$描述。散射相移需要通过边界条件$\chi'/\chi$在力程位置$r=r_0$两侧的取值确定。
在低能条件下$kr_0\sim 0$，从无穷远一侧逼近给出$k/\tan\delta_k$，从相互作用的力程区域逼近的结果则可以进行展开，于是给出:
$$
\frac{k}{\tan \delta_k} = -\frac{1}{a_s} + \frac{1}{2}r_{eff}k^2 + ...
$$
散射相移可以与散射长度$a_s$进行联系。在几何上，我们可以对径向波函数进行以下展开：
$$
\chi (r)\propto \sin(kr+\delta_k)\sim 1 + \frac{k}{\tan \delta_k}r = 1 - \frac{r}{a_s}
$$
想象在一个无穷大硬核排斥相互作用下，波函数会在力程边界$r=r_0$处变成0，而对于$\chi(r)$这就是$r=a_s$处，因此在这种情况下$a_s$可以视作相互作用的等效硬核半径。然而$a_s$可正可负甚至发散。那么我们应该如何从散射长度理解相互作用的信息呢？
- 在$|ka_s|\ll 1$时，$|a_s|$的强弱在一定程度上反应了相互作用的强弱，此时散射截面正比于$|a_s|^2$，而散射长度发散时（散射共振），散射截面正比于动量$k$（幺正气体,unitary gas）
- 在势场强度$V_0$较小时，排斥相互作用的散射长度$a_s$通常是正的，而吸引相互作用的散射长度通常是负的（三维）
- 当势场强度增加时，吸引相互作用的散射长度会发散至负无穷，然后突变至正无穷，这时对应着一个束缚态的产生。(Levinson定理)

因此，我们不能单纯地从势场的表面的经典性质来理解相互作用的效果，而散射长度深刻且唯像地抓住了相互作用的效果，通过散射长度我们就可以恰当且普适地刻画描写相互作用。

其中我们还发现力程的具体数值并不会影响对相互作用的唯像刻画，从而我们可以引入简化的$\delta$-函数相互作用形式（zero-ranged）：
$$
V(r) = g\delta(r)
$$
然而$\delta$函数势场允许粒子散射至任意高能的动量态导致紫外发散，但真实的物理会在高动量时被截断导致收敛的物理结果。而这一矛盾正是我们引入散射长度来唯像刻画相互作用的关键，即重整化关系：
$$
\frac{1}{g} = \frac{m}{4\pi\hbar^2 a_s} -\frac{1}{V}\sum_k \frac{1}{\hbar^2k^2/m}
$$
通过引入散射长度和$\delta$势场相互作用，我们在描述低能有效模型的结构时无需了解完整的相互作用的高能细节。

# BEC、BCS和Hubbard模型

- 超流的流体力学方程描述讲了什么？

- 超流平均场理论？Healing Length是什么？ Vortex激发？ KT相变？


- 如何理解Bogoliubov准粒子与激发态？

- 什么是BEC-BCS Crossover？ 

- Bose Hubbard模型和 Fermi Hubbard模型重要性质对比


# 利用同伦群进行的拓扑分类

| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

- 如何理解SSH相变的参数？


# 三大动力学与开放系统

通过调整系统的参数，我们可以在不同的动力学下驱动系统，探究不同的性质。根据系统参数随时间的改变方式，有三种我们经常关心的动力学：1. Quench Dynamics; 2. Floquet Dynamics; 3. Ramping Dynamics

## Quench Dynamics

即系统的参数在一瞬间突然改变，系统的态将如何进行演化。借助这一动力学协议，我们可以研究热化的概念。

在经典统计中，我们假设系统是各态历经的，然而在量子力学中考虑任意本征态的含时演化，它们会产生Quantum Revival，正交本征态之间在封闭演化下无法互相跃迁。为了和统计系综分布联系，人为得提出了本征态热化假设(ETH)。

然而ETH仅仅是假设，它并不总是成立，以此人们发现了不同的反例：多体局域化(MBL)，量子多体疤痕(QMBS)，可积系统。ETH更像是一个分类，帮助我们区分不同的动力学行为。

而对于符合ETH的系统，在幺正演化下，看起来初态的信息会在演化中变得混沌然后丢失，这一矛盾与黑洞信息悖论相关。通常我们拥有的是局域的信息，而在演化中信息发生扩散弥散到整个系统中。这一混沌行为被称作Information Scrambling，并且我们可以用一类特别的关联函数OTOC进行刻画：其思想类似于如何检验蝴蝶效应，即我们考虑在有蝴蝶时观测结果，并完全复原系统（反向时间演化）再移除蝴蝶重新观测结果。


## Floquet Dynamics

考虑系统的参数是周期变化的，借助这一动力学我们可以对电子能带系统进行工程调控。

居高临下，我们一般地考虑$H(t+T)=H(t)$，通常而言系统的演化由

$$
U(t) = \mathcal{T}\exp(-\frac{i}{\hbar}\int_0^t dt' H(t'))
$$

刻画， 但对于周期系统，且该周期变化非常快$\omega=T/2\pi$，此时可以为系统引入等效的周期演化算符：

$$
U(T,\alpha) = \mathcal{T}\exp(-\frac{i}{\hbar}\int_{\alpha T}^{T+\alpha T}dt H(t))=\exp(-\frac{i}{\hbar}H_{eff}T)
$$

考虑$H_{eff}$的本征值问题可以有效地描述原系统。注意到$H(t)=\sum_n e^{in\omega t} H_n$，而$\hbar\omega$作为特征能量是一个很高的值，可以对$1/\omega$进行展开导出：

$$
H_{eff}\approx H_0 +\sum_{n=1}^\infty \bigg\{\frac{[H_n,H_{-n}]}{n\hbar\omega}+...\bigg\} + ...
$$

具体而言，考虑一维运动势场：

$$
H = -\frac{\hbar^2}{2m} \frac{\partial^2}{\partial x^2} + V\cos^2(k(x+f(t)))
$$

在坐标变换下$x'=x+f(t)$，引入协变导数和规范变换，哈密顿量中将引入等效的规范场结构$A=-mf'(t)$:

$$
H = \frac{1}{2m}(-i\hbar\partial_x + mf'(t))^2 + V\cos^2(kx)
$$

如果对Wannier函数进行规范变换$e^{-i\int_{R_j}^r A(r')dr'/\hbar}w(r-R_j)$，在对应的格点模型中等效于在跃迁矩阵上乘以相位因子$e^{i\int_{R_j}^{R_i} A(r')dr'J_{ij}}$，这就是Peierls替换。于是考虑周期运动的势场，格点模型对应有：

$$
H = -J\sum_{\langle ij\rangle} (e^{if_0\cos\omega t}b^\dagger_i b_j + h.c.)
$$

对周期函数进行傅里叶展开得到贝塞尔函数：

$$
H=-J\sum_{\langle ij\rangle}\sum_n (i^n)B_n(f_0)b_i^\dagger b_j e^{in\omega t} +h.c.)
$$

从而利用$H_n$组合，我们可以实现不同的能带进行电子结构的调控。


## Ramping Dynamics

考虑系统的参数是线性增长的，即扫描模式。借助这一动力学我们可以研究相变过程中究竟发生了什么。

考虑连续相变由参数$g$控制，在临界点附近$\epsilon=g-g_c$，系统的平衡态行为可以用两个重要的物理量进行刻画：
- 关联长度$\xi$：描述了局域涨落在空间上互相关联的特征范围
- 弛豫时间$\tau$：描述了涨落衰减、系统从非平衡扰动恢复到平衡的特征时间
如果绝热地调控系统的参数$g$，关联长度和弛豫时间会呈现特征的标度率行为：
$$
\xi \sim |\epsilon|^{-\nu},  \ \ \tau \sim |\epsilon|^{-z\nu} 
$$
其中绝热意味着参数改变的速率$v$在系统特征能隙$\Delta$的参照下要足够慢(Landau-Zener转变:能级跃迁几率$P\sim \exp(-\pi\Delta^2/2\hbar|v|)$)。
而弛豫时间发散（能隙关闭）意味着我们永远无法绝热地驱动系统穿过相变点，系统穿越相变点的过程必须由非平衡动力学描述。Ramping dynamics考虑以恒定的速率驱动系统穿越临界点：
$$
g(t) = g_c (1-\frac{t}{\tau_R})
$$
其中$\tau_R$是扫描时间。由于弛豫时间发散，系统的非平衡动力学将经历不同的阶段：

(1)绝热阶段（远离临界点），此时弛豫速率足够快，系统可以跟上参数的变化速率并处于瞬时平衡态

(2)冻结阶段（接近临界点），此时弛豫时间发散，弛豫速率趋于0，系统无法跟上参数变化(临界条件$\tau\sim\epsilon/\dot{\epsilon}\Rightarrow \epsilon\sim \tau_Q^{-1/(1+z\nu)}$)，仿佛被冻结，而关联长度也对应地被冻结在相应的长度$\xi\sim\epsilon^{-\nu}\sim \tau_R^{\nu/(1+z\nu)}$

(3)解冻阶段（穿越临界点），此时弛豫速率恢复，系统解冻，但由于此前关联长度被冻结，系统被划分为一些区域，不同区域之间将可能形成畴壁缺陷，缺陷密度$n\sim\xi^{-d}\sim\tau_R^{-d\nu/(1+z\nu)}$

这就是Kibble-Zurek机制。


## Open System

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