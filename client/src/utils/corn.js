export const formatSchedule = (schedule) =>
{
    if (!schedule) return '未设置';

    try {
        // 解析cron表达式
        const parts = schedule.split(' ');
        if (parts.length !== 5) return schedule;

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        // 简单的cron表达式解析
        if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return '每分钟执行';
        }

        if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return '每小时整点执行';
        }

        if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return '每天午夜执行';
        }

        if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return `每天 ${hour} 点整执行`;
        }

        if (minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return `每天 ${hour}:${minute.padStart(2, '0')} 执行`;
        }

        if (dayOfWeek !== '*' && dayOfMonth === '*') {
            const weekdays = {
                '0': '周日', '1': '周一', '2': '周二', '3': '周三',
                '4': '周四', '5': '周五', '6': '周六'
            };

            if (dayOfWeek.includes(',')) {
                const days = dayOfWeek.split(',').map(d => weekdays[d]).join('、');
                return `每${days} ${hour}:${minute.padStart(2, '0')} 执行`;
            } else {
                return `每${weekdays[dayOfWeek]} ${hour}:${minute.padStart(2, '0')} 执行`;
            }
        }

        // 更多复杂情况可以继续添加...

        return schedule; // 如果无法解析，返回原始表达式
    } catch (error) {
        console.error('解析cron表达式出错:', error);
        return schedule;
    }
}

// 获取cron表达式的详细描述
export const getCronDescription = (schedule) =>
{
    if (!schedule) return '未设置执行计划';

    try {
        const parts = schedule.split(' ');
        if (parts.length !== 5) return `无效的cron表达式: ${schedule}`;

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        // 解析各部分
        const minuteDesc = parseMinute(minute);
        const hourDesc = parseHour(hour);
        const domDesc = parseDayOfMonth(dayOfMonth);
        const monthDesc = parseMonth(month);
        const dowDesc = parseDayOfWeek(dayOfWeek);

        return `执行时间: ${minuteDesc}${hourDesc}${domDesc}${monthDesc}${dowDesc}`;
    } catch (error) {
        console.error('生成cron描述出错:', error);
        return `原始表达式: ${schedule}`;
    }
}

// 解析分钟部分
const parseMinute = (minute) =>
{
    if (minute === '*') return '每分钟';
    if (minute === '0') return '整点';
    if (minute.includes('/')) {
        const [_, interval] = minute.split('/');
        return `每${interval}分钟`;
    }
    return `在第${minute}分钟`;
}

// 解析小时部分
const parseHour = (hour) =>
{
    if (hour === '*') return '';
    if (hour.includes('/')) {
        const [_, interval] = hour.split('/');
        return `，每${interval}小时`;
    }
    if (hour.includes(',')) {
        return `，在${hour.split(',').join('、')}点`;
    }
    return `，在${hour}点`;
}

// 解析日期部分
const parseDayOfMonth = (dom) =>
{
    if (dom === '*') return '';
    if (dom.includes('/')) {
        const [_, interval] = dom.split('/');
        return `，每${interval}天`;
    }
    return `，每月${dom}日`;
}

// 解析月份部分
const parseMonth = (month) =>
{
    if (month === '*') return '';
    const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    if (month.includes(',')) {
        const months = month.split(',').map(m => monthNames[parseInt(m)]).join('、');
        return `，在${months}`;
    }
    return `，在${monthNames[parseInt(month)]}`;
}

// 解析星期部分
const parseDayOfWeek = (dow) =>
{
    if (dow === '*') return '';
    const weekdays = {
        '0': '周日', '1': '周一', '2': '周二', '3': '周三',
        '4': '周四', '5': '周五', '6': '周六'
    };
    if (dow.includes(',')) {
        const days = dow.split(',').map(d => weekdays[d]).join('、');
        return `，在${days}`;
    }
    return `，在${weekdays[dow]}`;
}