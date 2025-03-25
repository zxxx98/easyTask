/*
{
  "schedule": "0 3 * * *",
  "enabled": true,
  "name": "test.js"
}
*/

// 导入sendGotifyMessage函数
import sendGotifyMessage from './common/testt';

// 异步函数来发送消息
async function main()
{
  console.log("Hello, EasyTask!");

  // 发送Gotify消息
  await sendGotifyMessage("测试消息", "这是一条来自EasyTask的测试消息");
}

// 执行主函数
main().catch(error =>
{
  console.error('执行出错:', error);
});