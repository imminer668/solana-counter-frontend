# Solana 计数器 DApp 前端

这是一个基于 Solana 区块链的去中心化计数器应用的前端部分。用户可以通过连接钱包来增加计数器的值, 并实时更新计数器状态，仅限个人学习使用。

1.部署solana程序
2.部署前端
3.运行前端
4.连接钱包
5.初始化数据帐户（如果需要的话，这个步骤只需要一次就好了，然后记录下这个数据帐户，然后修改前端代码；如不需要则直接修改前端代码中的数据帐户【src/app/page.tsx line 20】）
6.增加计数器值
7.查看更新后的计数器值


## 技术栈

- **前端框架**: Next.js 14.1.0
- **区块链**: Solana
- **钱包适配器**: 
  - @solana/wallet-adapter-base
  - @solana/wallet-adapter-react
  - @solana/wallet-adapter-react-ui
  - @solana/wallet-adapter-wallets
- **样式**: Tailwind CSS
- **开发语言**: TypeScript

## 功能特性

- 连接 Solana 钱包
- 显示计数器当前值
- 增加计数器值
- 自动刷新计数器状态
- 交易状态实时反馈

## 本地开发

### 环境要求

- Node.js 16.x 或更高版本
- npm 或 yarn
- Solana 钱包（如 Phantom）

### 安装步骤

1. 克隆仓库
bash
git clone [仓库地址]
cd solana-counter-frontend

2. 安装依赖
bash
npm install

3. 启动开发服务器
bash
npm run dev

4. 访问应用
浏览器访问 http://localhost:3000

### Solana 程序

计数器程序 ID: `这个根据自己创建的程序ID填写`

## 使用说明

1. 确保已安装 Solana 钱包（如 Phantom）
2. 连接钱包到应用
3. 点击 "+1" 按钮增加计数器值
4. 等待交易确认
5. 查看更新后的计数器值

## 注意事项

- 确保钱包连接到 Solana Devnet 网络
- 钱包中需要有足够的 SOL 支付交易费用
- 每次交易都需要等待区块确认

## 常见问题

1. **钱包连接失败**
   - 检查钱包是否安装
   - 确认网络设置是否正确

2. **交易失败**
   - 检查钱包余额
   - 确认网络连接状态

## 贡献指南

欢迎提交 Pull Request 或提出 Issue。

## 许可证

MIT License

## 联系方式

0xF1

如有问题，请提交 Issue 或发起 Pull Request。



