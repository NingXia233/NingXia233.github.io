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

**1**.考虑一维的$N$-体问题:

$$
H = -\sum_{i}^N \frac{\partial^2}{\partial x_i^2} + 2c \sum_{i<j} \delta(x_i - x_j), c>0,
$$

第一项是动能，第二项则表示了粒子在相互接触时的碰撞相互作用。边界条件考虑采用周期边界条件，即粒子的位置有界$x\in[0,L]$。

**2**.波函数$\psi(x_1,...,x_N)$在粒子交换下具有特定的对称性。我们可以用置换群$S_N$的不可约表示$R_\psi$来进行描述。作为补充，我们可以先简单地复习一下置换群最有意思的一些性质:
-  a.任何置换群元素$p=(p_1,p_2,...,p_N)$都可以分解为一系列独立的轮换操作$(q_1q_2q_3...q_k)$的乘积
-  b.一个$k$体轮换$(p_1p_2p_3...p_k)$生成一个$k$阶循环群。同时，任何轮换都可以分解为一系列对换的乘积$(p_1p_2p_3...p_k)=(p_1p_2)(p_2p_3)...(p_{k-1}p_k)$，可以将任何置换最终拆解成一系列对换的乘积，根据对换的个数我们可以定义置换宇称。

借助置换宇称，我们可以定义群同态：

$$
\begin{aligned}
\epsilon: S_n \to \mathbb{Z}_2,
\left\{\begin{aligned}
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

- c.在对换中，我们可以定义相邻对换$P_i=(i,i+1)$，任何不相邻对换可以根据递推公式$(i,i+v)=(i+1,i+v)(i,i+1)(i+1,i+v)$分解为相邻对换的乘积。相邻对换$P_i$满足重要性质$P_iP_{i+1}P_i=P_{i+1}P_iP_{i+1}$。此外，引入$n$-体轮换$W=(12...n)$，任何相邻对换$P_i$都可以通过$W,P_1$来生成：$P_i=WP_{i-1}W^{-1}=W^{i-1}P_1W^{1-i}$。
- d.群共轭操作不改变置换群的轮换结构，因此具有相同轮换结果的置换属于同一共轭类，轮换结构可以通过配分数($i_1\geq i_2...\geq i_n\geq 0, \sum_j i_j = n$)来进行标记。配分数可以通过Young图进行表示，因此置换群的共轭类可以通过Young图进行形象得刻画。根据Young图我们可以得到标准Young盘，并进一步构造标准Young算符，从而得到一组具有确定置换对称性的基底，即对应的不可约表示。

Young图$[N]$给出了交换对称的波函数(玻色子)，Young图$[1^N]$给出了交换反对称的波函数(费米子)。


**3**.波函数$\psi=\psi(x_1,x_2,...,x_N)$是定义在$[0,L]^N$上的函数，可以引入排序$0<x_{Q_1}<x_{Q_2}<...<x_{Q_N}<L$，这使得我们将$[0,L]^N$分割出$N!$个区域。我们可以想象这一分割的物理含义，即在一维的空间中，我们可以从$0$出发，在抵达$L$的过程中，我们会以一定概率遇到第一个粒子、第二个粒子、……，于是我们就给出了系统状态的一种表述。对于给定的区域$Q$上的波函数$\psi$，$\delta$函数相互作用为零，薛定谔方程变成:

$$
-\sum_{i}\frac{\partial^2 \psi}{\partial x_i^2} = E\psi
$$

方程的一个解可以由一组动量$p_1,p_2,...,p_N$来进行标记：$\exp(i\sum_k p_k x_k)$。方程的一般解是一系列满足$\sum_k p_k^2=E$的动量组所标记的解的叠加。对于全同粒子，其具有给定的置换对称性，我们考虑一组动量$p_1,...,p_N$，并选择如下的线性组合作为拟设：

$$
\psi = \sum_P A[Q,P] \exp(i\sum_{k}p_{P_k}x_{Q_k})
$$

其中$P=[P_1,P_2,..,P_N],Q=[Q_1,Q_2,...,Q_N]$是$1,2,..,N$的两组置换，$A[Q,P]$为叠加系数矩阵，并记置换$P$所对应的列向量为$\xi_P$。其中置换群的不可约表示将告诉我们：$A[Q,P]=R(Q'')A[Q',P]$，其中$R(Q'')$是置换$Q''$的不可约表示矩阵，且$Q''=Q'Q^{-1}$。因此，为了确定波函数的结构我们接下来的目标即确定$A[Q,P]$和$A[Q,P']$的关系，也即$\xi_P,\xi_{P'}$的关系。

注意到相互作用影响在边界处，我们考虑以下两个区域的波函数：$Q=[Q_1,Q_2,Q_3,Q_4,...,Q_N],Q'=[Q'_1,Q'_2,Q'_3,Q'_4,...,Q'_N]=[Q_1,Q_2,Q_4,Q_3,...,Q_N]$。于是在$x_{Q_3}=x_{Q_4}$的边界处，波函数需要满足波函数的连续性条件，即：

$$
\sum_{P}A[Q,P]\exp(i\sum_k p_{P_k}x_{Q_k}) = \sum_{P}A[Q',P]\exp(i\sum_k p_{P_k}x_{Q'_k})
$$

*对于这一等式，首先想到在$x_{Q_3}=x_{Q_4}=x$时，求和两边的相因子一致：$~\exp(i[...+p_{Q_3}x+p_{Q_4}x+...])$，这样我们可以根据线性独立来得到恒等式，但是需要注意，现在对$P$的求和并没有把同属于一个线性无关基的系数全部加和起来，因此不能错误地认为$A[Q,P]=A[Q',P]$,并且这与给定的置换对称性性质在非玻色子的情况下矛盾。*

在物理上我们想到在$x_{Q_3}=x_{Q_4}$的,于是散射局域地发生在这两个粒子之间，散射过程会导致两个粒子交换动量。于是我们考虑将$P$的求和分成两类，分别记作$P=[P_1,P_2,P_3,P_4,...,P_N],P'=[P_1,P_2,P_4,P_3,...,P_N]$，于是得到：

$$
\begin{aligned}
&\sum'_{P}(A[Q,P]-A[Q',P'])\exp(i[...+p_{P_3}x_{Q_3}+p_{P_4}x_{Q_4}+...])=\\
&\sum'_{P}(A[Q',P]-A[Q,P'])\exp(i[...+p_{P_4}x_{Q_3}+p_{P_4}x_{Q_4}+...])
\end{aligned}
$$

此处求和$\sum_P'$的求和数减少了一半，在$x_{Q_3}=x_{Q_4}=x$的条件下，我们可以利用线性无关的条件得到：

$$A[Q,P]+A[Q,P']=A[Q',P]+A[Q',P']$$

另一方面，波函数还需要在边界处满足导数的跳变条件，考虑对薛定谔方程在边界处积分：

$$
\int_{0^-}^{0^+}d(x_{Q_3}-x_{Q_4})\bigg[-\sum_i \frac{\partial^2\psi}{\partial x_i^2}+2c\delta(x_{Q_3}-x_{Q_4})\psi\bigg]=0
$$

进一步处理得到：

$$
\bigg(\frac{\partial\psi}{\partial x_{Q_3}}-\frac{\partial\psi}{\partial x_{Q_4}}\bigg)\bigg|_{0^-}^{0^+}=2c\psi(x_1,...,x_N|x_{Q_3}=x_{Q_4})
$$

为了方便我们标记$i=P_3,j=P_4$：

$$
\begin{aligned}
&i\sum_P A[Q,P](p_j-p_i)\exp(i[...+p_ix_{Q_3}+p_j x_{Q_4}+...])+\\
&i\sum_P A[Q',P](p_j-p_i)\exp(i[...+p_jx_{Q_3}+p_i x_{Q_4}]+...)=\\
&2c\sum_P A[Q,P] \exp(i[...+p_i x_{Q_3}+p_j x_{Q_4}+...])
\end{aligned}
$$

同样地，我们需要将同一基底的系数合并以使用线性无关的性质，进行对应的代数整理我们得到：

$$
\begin{aligned}
&i\sum_P'\bigg[A[Q,P]-A[Q',P']\bigg](p_j-p_i)\exp(i[...+p_i x_{Q_3}+p_j x_{Q_4}+...]) +\\
&i\sum_P'\bigg[A[Q',P]-A[Q,P']\bigg](p_j-p_i)\exp(i[...+p_jx_{Q_3}+p_ix_{Q_4}+...])=\\
&2c\sum_P' \bigg[A[Q,P]\exp(i[...+p_ix_{Q_3}+p_jx_{Q_4}+...])+\\
&\ \ \ \ \ \ \ \ \ \ \ \ \ A[Q,P']\exp(i[...+p_jx_{Q_3}+p_ix_{Q_4}+...])\bigg]
\end{aligned}
$$

于是在条件$x_{Q_3}=x_{Q_4}=x$的条件下，我们得到：

$$
\frac{i}{2}(p_j-p_i)\bigg(A[Q,P]-A[Q',P']+A[Q',P]-A[Q,P']\bigg)=c(A[Q,P]+A[Q,P'])
$$

注意到公式关于$Q,Q'$是对称的，我们可以引入交换算符$P_{Q,Q'}=P_{34}$，以及采用记号$\xi_P=A[Q,P]$，于是可以被简单地整理成：

$$
\frac{i}{2}(p_j-p_i)(1+P_{34})\bigg(\xi_P-\xi_{P'}\bigg)=c(\xi_P+\xi_{P'})
$$

进一步：

$$
\bigg(\frac{i}{2}(p_j-p_i)(1+P_{34})-c\bigg)\xi_P=\bigg(\frac{i}{2}(p_j-p_i)(1+P_{34})+c\bigg)\xi_{P'}
$$

方程两边同时乘以因子$\bigg(\frac{i}{2}(p_j-p_i)(-1+P_{34})+c\bigg)$:

$$
\bigg(ic(p_j-p_i)-c^2\bigg)\xi_P=\bigg(ic(p_j-p_i)P_{34}+c^2\bigg)\xi_{P'}
$$

于是得到:

$$
\xi_P = \frac{(p_j-p_i)P_{34}-ic}{(p_j-p_i)+ic}\xi_{P'}
$$

按照杨先生的记号，引入$x_{ij}=ic(p_i-p_j)^{-1}, y_{ij}=1+x_{ij}$，即有：

$$
\xi_{...ij...}=\xi_{P} = \frac{P_{34}-x_{ji}}{1+x_{ji}}\xi_{P'}=Y_{ji}^{34}\xi_{P'}=Y_{ji}^{34}\xi_{...ji...}
$$

其中

$${Y_{ji}^{34}}=({y_{ji}^{-1}}-1)+{y^{-1}_{ji}}{P_{34}}$$

至此，我们终于得到了文章中杨先生轻描淡写给出的公式(3)。

**4**.算符$Y^{ab}_{ij}$连接了不同排序$Q$中波函数之间的变换，正如散射问题中$S$矩阵将初态与末态联系起来一样，算符$Y$给出了两个粒子发生散射前后的波函数联系。总共有$N!$种排序置换，每种置换情况在不考虑边界的情况下有$N-1$中发生两体碰撞的情形，因此总共有$N!(N-1)$种方式发生两粒子散射，即有这么多种联系不同粒子状态的方式。我们需要确保这些方程之间是自洽的，即通过不同路径进行散射得到的最终结果应当是一样的。为此，我们需要验证
