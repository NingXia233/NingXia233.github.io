---
layout: post
title: "多体物理数值计算：系统的局部空间与张量网络"
author: "Ning Xia"
categories: notes
tags: [documentation]
image: cutting.jpg
---

在单体量子力学的问题中，定态薛定谔方程可以被转换为SL问题，系统的本征态可以通过各种复杂的特殊函数表示描写。如果系统具有的是简单的离散自由度$|m\rangle$（例如自旋），那么我们可以将系统的状态通过不同的离散模式来进行描写，即单体粒子是处于什么模式状态。


从单体变成多体，系统的复杂程度将面临指数爆炸。描述每个粒子所处的状态变得困难，然而如果构成系统的微观粒子具有全同性，我们就可以转换视角，从系统模式的角度进行描述。即描述系统的状态等价于描述清楚每个模式占据的粒子数。这样的视角同样适用于可分辨粒子系统（例如自旋系统），描述清楚每个自旋的状态与描述清楚每个模式的占据状态存在着一一对应。

在多体物理的视角下，系统整体的希尔伯特空间具有以下的结构：

$$
\mathcal{H} = \mathcal{H}_1\otimes \mathcal{H}_2\otimes \mathcal{H}_3\otimes ...
$$

即它是一系列局域希尔伯特空间的张量积。系统的本征态则可以通过这些局域希尔伯特空间的直积态进行展开：

$$
|\psi\rangle = \sum_{\{s_n\}}C[s_1,s_2,s_3,...] |s_{1}, s_{2}, s_3,... \rangle
$$

其中叠加系数张量$C[s_1,s_2,s_3,...]$可以通过一系列的SVD分解来实现所谓的Tensor-Train分解，在分解后具有以下形式：

$$
|\psi\rangle = \sum_{\{s_n\}}\sum_{\alpha\beta\gamma...} A^1_{\alpha\beta}[s_1]A^2_{\beta\gamma}[s_2] A^3_{\gamma...}[s_3]...|s_1,s_2,s_3,...\rangle
$$

分解得到的具有这样形式的波函数被称作是MPS。

一个非常重要的问题是去询问：这些分解得到的张量$A^i_{\alpha\beta}[s_i]$，它们的物理含义是什么？

---

**Schmidt分解**

考虑系统可以被分成两个子系统$A,B$，子系统A可以通过基矢量$\{|a\rangle\}$完备描述，而子系统B则可以通过$\{|b\rangle\}$得到完备描述，系统的基矢量则是$\{|a\rangle_A|b\rangle_B\}$。

系统的一个一般量子态可以表达成：

$$
|\psi\rangle =\sum_{a,b}C_{a,b}|a\rangle_A|b\rangle_B
$$

可以对矩阵$C_{a,b}$进行SVD分解：

$$
C_{a,b} =\sum_{\lambda} U_{a,\lambda} S_\lambda V_{\lambda, b}
$$

从而量子态可以被表达成：

$$
|\psi\rangle = \sum_{\lambda}S_\lambda |\lambda\rangle_A |\lambda\rangle_B
$$

其中有：

$$
|\lambda\rangle_A = \sum_a U_{a,\lambda}|a\rangle_A, \ \ \  |\lambda\rangle_B = \sum_b V_{\lambda,b} |b\rangle_B
$$

这就是所谓的Schmidt分解，它告诉我们一个很重要的信息，即在原来的表象下描述系统，我们需要$\dim(A)\times \dim(B)$数量的参数，但这些参数中存在着关联，实际上独立的参数只有$\min\{\dim(A),\dim(B)\}$。这背后所反映的物理是：**通过理解两个子系统之间的纠缠，我们就可以理解系统整体的行为。**

---

**从Schmidt分解到Tensor-Train**

