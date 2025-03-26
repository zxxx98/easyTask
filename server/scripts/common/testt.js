/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-23 17:40:07
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-25 23:02:55
 * @FilePath: \easyTask\server\scripts\common\testt.js
 */
import axios from 'axios';

export default async function sendGotifyMessage(title, content)
{
  const gotifyUrl = 'https://gotify.xxx.xxx/message'; // Gotify 服务器的 URL
  const appToken = 'xxxxx'; // 替换为你的 Gotify 应用令牌
  try {
    const response = await axios({
      method: 'post', // 指定请求方法为 POST
      url: gotifyUrl, // 请求 URL
      data: { // 请求体
        title: title,
        message: content,
        priority: 0 // 优先级，可选，默认为 0
      },
      headers: { // 请求头
        'X-Gotify-Key': appToken // 使用应用令牌进行认证
      }
    });
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Failed to send message:', error.response ? error.response.data : error.message);
  }
}