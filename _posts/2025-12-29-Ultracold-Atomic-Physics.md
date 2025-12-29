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


**BEC、BCS和Hubbard模型**

**利用同伦群进行的拓扑分类**

**三大动力学与开放系统**

通过调整系统的参数，我们可以在不同的动力学下驱动系统，探究不同的性质。根据系统参数随时间的改变方式，有三种我们经常关心的动力学：1. Quench Dynamics; 2. Floquet Dynamics; 3. Ramping Dynamics

- Quench Dynamics

即系统的参数在一瞬间突然改变，系统的态将如何进行演化。借助这一动力学，我们可以研究热化的概念，即系统从初态出发如何演化为热平衡态。


- Floquet Dynamics

考虑系统的参数是周期变化的，借助这一动力学我们可以对电子能带系统进行工程调控。

- Ramping Dynamics

考虑系统的参数是线性增长的，即扫描模式。借助这一动力学我们可以研究相变过程中究竟发生了什么。

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