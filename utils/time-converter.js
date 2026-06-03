export function timeConverter(isoTime) {
  const currentTime = new Date().getTime();
  const pastTime = new Date(isoTime).getTime();
  const timeDifference = currentTime - pastTime;

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 0) {
    return "刚刚更新";
  } else if (seconds < 60) {
    return `${seconds} 秒前`;
  } else if (minutes < 60) {
    return `${minutes} 分钟前`;
  } else if (hours < 24) {
    return `${hours} 小时前`;
  } else if (days < 30) {
    return `${days} 天前`;
  } else if (months < 12) {
    return `${months} 个月前`;
  } else {
    return `${years} 年前`;
  }
}
