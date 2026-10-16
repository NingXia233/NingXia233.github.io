---
layout: post
title: "多体物理数值计算：谱函数"
author: "Ning Xia"
description: "从张量网络的数值结果出发，思考谱函数与可观测物理量之间的联系。"
categories: notes
tags: [documentation]
image: /assets/img/covers/spectral-function.webp
image_width: 1672
image_height: 941
image_alt: "连续谱背景上的尖锐共振峰与平滑谱曲线"
---

尽管张量网络引入了纠缠的角度来描述多体系统，但是在面对复杂的真实的物理现象，我们还是很难直接通过这些数据来得到对物理的理解。
张量网络在传统的角度下被理解为是一个黑盒子，是一个工具，我们借助这个工具来计算来将数据转换成我们在实验上能够理解的格式，例如谱函数。