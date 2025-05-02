# 点餐系统后端项目

## 项目概述
本项目是一个基于Spring Boot的餐饮管理系统后端，主要为餐饮企业提供菜品管理和订单处理功能。系统采用RESTful风格的API设计，使用JdbcTemplate与数据库进行交互，支持菜品查询、搜索、分类展示等核心功能。

## 主要功能
1. **菜品管理**
   - 获取所有菜品列表
   - 根据关键词搜索菜品
   - 按分类获取菜品列表

2. **订单管理**
   - 创建新订单
   - 获取订单详情
   - 删除订单
   - 加菜功能
   - 删除菜品
   - 支付功能
   - 获取历史订单

## 技术栈
- **后端框架**: Spring Boot
- **数据库交互**: JdbcTemplate
- **API风格**: RESTful
- **数据库**: MySQL

## 安装教程
1. 克隆项目到本地
   ```bash
   git clone https://gitee.com/litianlonga/diancan.git
   ```
