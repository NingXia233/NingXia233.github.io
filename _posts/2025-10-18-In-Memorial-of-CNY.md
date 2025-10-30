---
layout: post
title: "1967年12月4日"
author: "Ning Xia"
categories: notes
tags: [documentation]
image: cutting.jpg
---

在1967年12月4日，杨振宁先生发表了文章“SOME EXACT RESULTS FOR THE MANY-BODY PROBLEM IN ONE DIMENSION WITH REPULSIVE DELTA-FUNCTION INTERACTION”

这篇文章很适合吾辈作为出发点，去真正尝试学习理解什么是量子多体问题。

**1**.考虑一维的N-体问题:

$$
H = -\sum_{i}^N \frac{\partial^2}{\partial x_i^2} + 2c \sum_{i<j} \delta(x_i - x_j), c>0,
$$

第一项是动能，第二项则表示了粒子在相互接触时的碰撞相互作用。边界条件考虑采用周期边界条件，即粒子的位置有界$x\in[0,L]$。

**2**.波函数$\psi(x_1,...,x_N)$在粒子交换下具有特定的对称性。我们可以用置换群$S_N$的不可约表示$R_\psi$来进行描述。作为补充，我们可以先简单地复习一下置换群最有意思的一些性质:
-  a.任何置换群元素$p=(p_1,p_2,...,p_N)$都可以分解为一系列独立的轮换操作的乘积
-  b.一个$k$体轮换$(p_1p_2p_3...p_k)$生成一个$k$阶循环群。同时，任何轮换都可以分解为一系列对换的乘积$(p_1p_2p_3...p_k)=(p_1p_2)(p_2p_3)...(p_{k-1}p_k)$，可以将任何置换最终拆解成一系列对换的乘积，根据对换的个数我们可以定义置换宇称。

借助置换宇称，我们可以定义群同态：
$$
\begin{aligned}
&\epsilon: S_n \to \mathbb{Z}_2\\
&\left\{\begin{aligned}
&\sigma \to +1 \mathrm{,\ \ if \ \ \sigma \ \ is \ \ even}, \\
&\sigma \to -1 \mathrm{,\ \ if \ \ \sigma \ \ is \ \ odd.}
\end{aligned}
\right.
\end{aligned}
$$
此即全反对称张量:$\epsilon(\sigma)=\epsilon_{\sigma_1,\sigma_2,...,\sigma_n}$。对于任意$\sigma_i\sigma_j=\sigma_k$，我们有$j_{\sigma_k(1)}=i_1,...\ ...,j_{\sigma_k(n)}=i_n$。于是，我们立刻得到：
$$
\epsilon_{i_1,...,i_n}\epsilon_{j_1,...,j_n}=\epsilon(\sigma_i)\epsilon(\sigma_j)=\epsilon(\sigma_k)=\sum_{\sigma\in S_n}\epsilon(\sigma)\delta_{i_1,j_{\sigma(1)}}...\delta_{i_n,j_{\sigma(n)}}
$$
对于$S_3$，我们任取$\sigma_i=(i,j,k),\sigma_j=(i,l,m)$，为了使得$i_1=i=j_{\sigma(1)}$，我们只需要考虑后两位的所有置换$(2)(3),(23)$，于是得到：$\epsilon_{ijk}\epsilon_{ilm}=\delta_{jl}\delta_{km}-\delta_{jm}\delta_{kl}$。

- c.在对换中，我们可以定义相邻对换$P_i=(i,i+1)$，任何不相邻对换可以根据递推公式$(i,i+v)=(i+1,i+v)(i,i+1)(i+1,i+v)$分解为相邻对换的乘积。相邻对换$P_i$满足重要性质$P_iP_{i+1}P_i=P_{i+1}P_iP_{i+1}$。此外，引入n-体轮换$W=(12...n)$，任何相邻对换$P_i$都可以通过$W,P_1$来生成：$P_i=WP_{i-1}W^{-1}=W^{i-1}P_1W^{1-i}$。
- d.群共轭操作不改变置换群的轮换结构，因此具有相同轮换结果的置换属于同一共轭类，轮换结构可以通过配分数($i_1\geq i_2\geq i_3..\geq i_n\geq 0, \sum_j i_j = n$)来进行标记。配分数可以通过Young图进行表示，因此置换群的共轭类可以通过Young图进行形象得刻画。根据Young图我们可以得到标准Young盘，并进一步构造标准Young算符，从而得到一组具有确定置换对称性的基底，即对应的不可约表示。

Young图$[N]$给出了交换对称的波函数(玻色子)，Young图$[1^N]$给出了交换反对称的波函数(费米子)。


**3**.波函数$\psi=\psi(x_1,x_2,...,x_N)$是定义在$[0,L]^N$上的函数，可以引入排序$0<x_{Q_1}<x_{Q_2}<...<x_{Q_N}<L$，这使得我们将$[0,L]^N$分割出$N!$个区域，对于给定的区域$Q$上的波函数$\psi$，$\delta$函数相互作用为零，薛定谔方程变成:
$$
-\sum_{i}\frac{\partial^2 \psi}{\partial x_i^2} = E\psi
$$
