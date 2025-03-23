/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-23 09:42:48
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-23 11:16:04
 * @FilePath: \easyTask\client\src\config\request.js
 */
import axios from 'axios';
import { API_BASE_URL } from './api';

const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default request;