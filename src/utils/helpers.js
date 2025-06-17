// This file contains helper functions that assist with various tasks in the application.

export function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = ((milliseconds % 60000) / 1000).toFixed(1);
  return `${minutes}:${seconds.padStart(4, '0')}`;
}

export function resetSectorTimes(sectorElements) {
  sectorElements.forEach(el => {
    el.textContent = '--:--';
  });
}

export function updateSectorTime(sector, time, sectorElements) {
  const formattedTime = formatTime(time);
  sectorElements[sector - 1].querySelector('.sector-time').textContent = formattedTime;
}