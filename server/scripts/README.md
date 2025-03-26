<!--
 * @Description:
 * @Author: zhouxin
 * @Date: 2025-03-25 23:09:02
 * @LastEditors:
 * @LastEditTime: 2025-03-26 22:16:30
 * @FilePath: \easyTask\server\scripts\README.md
-->

## 脚本编写注意事项

1. 引入通用脚本格式
   ```
   // 不能用 ./common/test.js 和 /common/test.js
   import test from 'common/test';
   ```
2. 不用用 require 引入
3. 常用的变量可以录入到环境变量中，脚本中用 process.env.xxx 获取
4. 第三方库提前在包管理器中安装
