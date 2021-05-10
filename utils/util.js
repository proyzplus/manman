const formatTime = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatTimes = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join('.');
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const dateLater = (dates) => {
  let dateObj = {};
  let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
  let date = new Date(dates);
  date.setDate(date.getDate());
  let day = date.getDay();
  dateObj.week = show_day[day];
  return dateObj;
};



module.exports = {
  formatTime: formatTime,
  formatTimes: formatTimes,
  dateLater: dateLater
};