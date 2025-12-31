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

## BEC和超流

BEC是最简单的一种相变，对于自由玻色子，当温度下降时，玻色子会尽可能多地占据能量最低的能级来减少系统都能量，对于三维以上的系统，在一定有限温度下，基态能级就能呈现出宏观多的玻色子占据。而对一维和二维，则只有绝对零度，基态才能具有宏观占据。

可以将宏观占据的概念推广至相互作用的情况即所谓的非对角长程序，考虑约化密度矩阵

$$\rho(r,r')=\langle \Psi^\dagger(r)\Psi(r)\rangle$$

进行本征值分解：

$$\rho(r,r')=\sum_i N_i \psi_i^*(r)\psi_i(r')$$

BEC意味着其中有且仅有一个本征值是$N_0 \sim O(N)$，此时系统的密度矩阵可以近似为：

$$\rho(r,r')\approx N_0 \psi^*(r) \psi(r')$$

看起来就像一个状态处于“波函数”$\phi(r)=\sqrt{N_0}\psi(r)$系统的纯态密度矩阵，将其称作condensate wave function或者宏观波函数。

类比自由玻色子的情形，我们可以假设系统的波函数是一个直积态: 

$$
\Psi(r_1,...,r_N)=\prod_i^N \psi(r_i)
$$

借助变分原理，对于具有短程相互作用的玻色系统可以导出GP方程:

$$
(-\frac{\hbar^2\nable^2}{2m}+V(r))\psi + U|\psi|^2\psi = i\hbar\frac{\partial\psi}{\partial t}
$$

其静态方程为（粒子数守恒给出化学势）：

$$
(-\frac{\hbar^2\nable^2}{2m}+V(r))\psi + U|\psi|^2\psi = i\hbar\frac{\partial\psi}{\partial t}
$$

对于均匀系统$V(r)=0$，场方程的基态有$\mu=Un_0,n_0=|\psi|^2$

进一步，我们可以引入$\psi=\sqrt{n}e^{i\theta}$，并带入GP方程，约化整理后得到的是连续性方程和牛顿方程，它们统合在一起表明系统此时具有一种流体力学行为。在平均场基态$n_0$上进行小扰动展开并进行线性化，可以得到波动方程，有声子模式激发:

$$
\omega = \sqrt{Un_0/m}|k|
$$

声子模式是系统唯一的低能模式意味着系统的流体力学状态并不普通，而是所谓的超流。其重要结果是，超流的流动是无耗散的。考虑在流体中引入速度$v_i$的运动杂质，由于摩擦耗散，其速度由于碰撞会变成$v_f$，有动量$q=v_f-v_i$将传递给流体。为了处理流体的动能，我们可以考虑伽利略变换，这等效于一个在静止流体考虑对运动杂质的散射:

$$
\begin{aligned}
&m_0 v_i = m_0 v_f + q\\
&\frac{m_0 v_i^2}{2}=\frac{m_0 v_f^2}{2}+c|q|
\end{aligned}
$$

联立得到:

$$
v_i \cdot q -c|q| = \frac{q^2}{2m_0}
$$

如果$ |v_i| < c$，那么此时方程无法得到满足，杂质将不会被散射，这就是超流临界速度。更一般地，考虑低能激发模式为$\mathcal{E}(q)$，那么临界速度将变成:

$$
v_c = \textrm{min}(\frac{\mathcal{E}(|q|)}{|q|})
$$

由此我们也可以得知，自由玻色子虽然具有BEC，但是并不具有超流性质。

## 超流的Bogoliubov平均场理论

有趣的是，如果允许系统的粒子数存在涨落，相干态:

$$
|G_0\rangle \propto e^{\int d^3 r\sqrt{N_0}\psi(r)\Psi^\dagger}|0\rangle
$$

其约化密度矩阵也可以给出同样的非对角长程序。以该波函数作为拟设我们将得到超流的Bogoliubov平均场理论。引入Bogoliubov变换，我们可以对角化平均场哈密顿量并得到准粒子激发:

$$
\mathcal{E}_k = \sqrt{\epsilon_k(\epsilon_k + 2Un_0)}
$$

当$k$很小时，色散关系也是线性色散$\mathcal{E}_k\sim ck$，且声速也是$\sqrt{Un_0/m}$。而在$k$很大的情况下$\mathcal{E}_k\sim \epsilon_k+Un_0$，这恰好是Hatree-Fock带来的化学势修正。因此随着波矢的改变，系统的行为将从自由粒子变成集体声子，有转变的特征波矢：

$$
\hbar^2 k_0^2/2m=\hbar ck_0 \Rightarrow k_0 =2mc/\hbar
$$

可以据此引入healing length: $\xi=\sqrt{2}/k_0$，这一定义恰好使得有$\hbar^2/2m\xi^2=Un_0$。当$k\ll 1/\xi$时，相互作用的效果主导，系统处于集体激发模式；而反之粒子动能主导，系统则表现出粒子激发。

平均场理论的自洽性与两个前提假设相关：(1) 基态的宏观占据数很大；(2) 准粒子定义良好。

为了验证(1)，我们需要计算所谓的quantum depletion，即由于相互作用被散射到激发态的粒子数:

$$
n_{dp} =\frac{1}{V}\sum_k v_k^2 \sim \frac{1}{\xi^3}
$$

系统具有宏观占据意味着$n_{dp}/n\ll 1$，也即特征长度healing length远远大于粒子的平均间距$\xi \gg d$。

为了验证(2)，我们需要考虑集体激发准粒子是否会因为平均场处理中丢掉的高阶项而发生衰变，这给出了Beliaev-Landau damping。

## BCS超导

对于费米子系统，我们考虑在费米面的背景下引入两个粒子的相互作用。
在对称性的要求下，我们可以考虑拟设:

$$
|\Psi\rangle = \sum_{|k|>k_F}\psi_k c^\dagger_{k\uparrow}c^\dagger_{-k\downarrow}|FS\rangle
$$

带入定态薛定谔方程可以得到：

$$
\frac{m}{4\pi\hbar^2 a_s} = \frac{1}{V}\bigg[\sum_{|k|>k_F}\frac{1}{E-2(\epsilon_k-\mu)}+\sum_{k}\frac{1}{2\epsilon_k}\bigg]
$$

不同于真空中的二体问题，该方程在任何散射长度下都存在能量小于0的解，即系统的费米面具有不稳定性。粒子通过动量空间配对可以使系统能量降低，配对的费米子即库珀对作为整体就像玻色子一样，我们可以考虑库珀对的BEC。
类似的，通过Bogoliubov平均场，我们可以得到BCS波函数$|\Psi_{BCS}\rangle$及其上的准粒子激发$\mathcal{E}_k$。

考虑配对的两个动量模式，BCS配对实际上是将双占据态与真空态进行了混合（简并微扰），而单占据的态并没有任何改变。因此产生的激发态实际上将混合配对的态重新变成了单占据的态。即BCS配对是动量空间中的配对，它与实空间中配对形成束缚态存在着区别。

具体而言，我们考虑吸引相互作用强度从微弱逐渐变强：
(1)当$a_s<0,|a_s|\ll 1/k_F$，此时配对仅仅在费米面附近发生，$\mu\sim E_F,\Delta\ll E_F$，这是BCS极限

(2)当强度增强并产生散射共振，在$a_s>0,a_s\ll 1/k_F$时，此时系统中存在着深能级束缚态，且束缚态的尺寸$a_s$远远小于粒子平均间隔，束缚能远大于费米能。这时系统中存在着真正意义上的束缚态，束缚的分子是玻色的可以发生凝聚，$\mu/E_F = -1/(k_Fa_s)^2$，即BEC极限。

尽管两种情形下物理非常不一样，但是这两种极限都可以通过平均场波函数刻画:

$$
|\Psi_{BCS}\rangle \sim \exp\bigg(\sum_k \frac{v_k}{u_k}c^\dagger_{k\uparrow}c^\dagger_{-k\downarrow}\bigg)|0\rangle
$$
在从BCS极限到BEC极限的变化过程中：
- 库珀对波函数$\psi(r)\sim \int d^3k (v_k/u_k) e^{ik\cdot r}$从延展逐渐变得束缚
- 配对强度$\Delta$逐渐增强，化学势$\mu$也逐渐增加。
- 在过程中系统始终是超流的。（对于BEC极限，临界速度由配对分子的集体声子模式决定，而对于BCS极限，则是由Bogoliubov准粒子激发模式决定）



- Bose Hubbard模型和 Fermi Hubbard模型重要性质对比


# 利用同伦群进行的拓扑分类

在三维的情况中，我们讨论了BEC-BCS极限，但是在二维中我们常说BEC是无法发生的，而在Bogoliubov平均场的计算中看起来好像并没有找出什么矛盾？

虽然基态仍然是BCS平均场波函数，但是它忽略了相位激发，在二维系统的相位激发中存在着非常独特的涡旋激发。

另一方面，尽管二维没有真正的长程序，但是还存在着准长程序，在一定程度上我们可以沿用流体力学方程来进行理解。

为了讨论涡旋激发，我们考虑如下形式的波函数：

$$
\psi(r,\phi) = \sqrt{n}e^{i\phi}f(r/\xi)
$$

根据该形式，我们得到速度$v_s=\frac{\hbar}{m}\nabla \theta = \frac{\hbar}{mr}$，这将导致两个重要的后果：

(1) 在$r=0$处，速度发散，必须要求$\psi=0$。而远离涡旋中心速度逐渐下降，超流密度逐渐恢复，恢复的特征尺度恰好就是healing length，因为$\hbar/m\xi =c$，当$r<\xi$时流速超过了临界速度。

(2) 一个涡旋的能量贡献是$\sim\ln(\frac{R}{\xi})$，而其对应的熵也是$\sim \ln(\frac{R}{\xi})$，因此其自由能贡献随着温度改变将可以发生符号的改变，从而导致相变。在高温时，涡旋大量产生会破坏超流浓度，从而破坏了相干性。这一相变被称作BKT相变。

BKT相变被称作拓扑的相变，因为涡旋激发是一种拓扑激发，我们考虑一个系统边界$\partial \sim S^1$，沿着边界对相位$e^{i\phi}\in S^1$的积分给出了一类映射，它们对应同伦群$\Pi_1(S^1)=Z$，独立的涡旋激发将导致该映射的不连续变化。

## 拓扑能带论

我们可以把同伦群的想法引入能带结构，如果一些参数下的能带结构对应了某种非平凡的拓扑，那么不同拓扑结构之间的转变将带来不连续的突变，即拓扑相的相变。

我们可以将这些内容整理成表格：

|   | Semimetal | Topological insulator |
|-------|-------|-------|
| Mapping | From surface $S_{d-1}$ in BZ to BWF space| From entire BZ $T_d$ to BWF space |
| Example in 1D |  | $\Pi_1(S^1)$: SSH model(winding number) |
| Example in 2D | $\Pi_1(S^1)$: Dirac semimetal (Winding number) | $\Pi_2(S^2)$: Haldane model (Chern number)|
| Example in 3D | $\Pi_2(S^2)$: Weyl semimetal (Chern number) | |

在这些例子中，我们要求元胞中至少存在着两个格点，这样哈密顿量就可以被改写成pseudo-spin的形式：

$$
H = \sum_k B(k)\cdot \sigma
$$

由于子格点对称性，系统的能带会分成上下两支$\pm|B(k)|$，只要$|B(k)|$在任何$k$都不为零，两支能带就不会相交。在这种情况下我们就可以定义:

$$
\hat{B}(k) = B(k)/|B(k)|
$$

它对应于Bloch波函数的pseudo-spin指向，从而我们就可以借此定义映射进行拓扑分类。而对于$B(k)=0$的特殊点，它们则和涡旋激发一样是一些拓扑的对象，而它们的稳定性则来源于系统Intrinsic的对称性的约束保护。因此设计拓扑绝缘体(Haldane模型)的思路往往就是破坏这些对称性。

值得注意的是，真空是一个平凡的拓扑相，因此任何拓扑非平凡相在开边界条件下都会与真空存在交界，这一交界处产生了拓扑数的跳变，因此必然有无能隙的边界态存在，这就是体边对应。

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