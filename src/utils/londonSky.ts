export type SkyColorStop = { minutes: number; color: string };

export const MINUTES_PER_DAY = 1440;

const LONDON_LAT = 51.5074;
const LONDON_LNG = -0.1278;

export const SKY_COLOR_STOPS: SkyColorStop[] = [
  { minutes: 0, color: '#152659' },    // 12:00 AM
  { minutes: 60, color: '#182C62' },    // 1:00 AM
  { minutes: 120, color: '#1A2F6A' },   // 2:00 AM
  { minutes: 180, color: '#1C3272' },   // 3:00 AM
  { minutes: 240, color: '#1F3882' },   // 4:00 AM
  { minutes: 284, color: '#3D5FA8' },   // 4:44 AM
  { minutes: 360, color: '#5B7ED4' },   // 6:00 AM
  { minutes: 420, color: '#447AE1' },   // 7:00 AM
  { minutes: 480, color: '#5B96F0' },   // 8:00 AM
  { minutes: 540, color: '#7BB8F8' },   // 9:00 AM
  { minutes: 600, color: '#96CCF9' },   // 10:00 AM
  { minutes: 660, color: '#A3D7F5' },   // 11:00 AM
  { minutes: 720, color: '#B5DFF7' },   // 12:00 PM
  { minutes: 780, color: '#A3D7F5' },   // 1:00 PM
  { minutes: 840, color: '#8DCBF0' },   // 2:00 PM
  { minutes: 900, color: '#6DB0E4' },   // 3:00 PM
  { minutes: 960, color: '#5592D0' },   // 4:00 PM
  { minutes: 1020, color: '#4472BB' },  // 5:00 PM
  { minutes: 1080, color: '#E8823A' },  // 6:00 PM
  { minutes: 1140, color: '#D4521E' },  // 7:00 PM
  { minutes: 1200, color: '#B83214' },  // 8:00 PM
  { minutes: 1273, color: '#7A2050' },  // 9:13 PM
  { minutes: 1320, color: '#3B2472' },  // 10:00 PM
  { minutes: 1380, color: '#2243AB' },  // 11:00 PM
  { minutes: 1440, color: '#152659' },  // midnight
];

export function getLondonMinutesFromMidnight(date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

export function minutesToPercent(minutes: number): number {
  return (minutes / MINUTES_PER_DAY) * 100;
}

export function percentToMinutes(percent: number): number {
  return Math.round((percent / 100) * MINUTES_PER_DAY);
}

export function formatMinutesAsMarkerTime(totalMinutes: number): string {
  const minutes = Math.max(0, Math.min(MINUTES_PER_DAY - 1, Math.round(totalMinutes)));
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'pm' : 'am';
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${mins.toString().padStart(2, '0')}${period}`;
}

export function buildSkyGradient(): string {
  const stops = SKY_COLOR_STOPS.map(
    ({ minutes, color }) => `${color} ${minutesToPercent(minutes)}%`,
  ).join(', ');

  return `linear-gradient(to bottom, ${stops})`;
}

export function formatLondonTime(date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toLowerCase();
}

export function formatMarkerTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toLowerCase()
    .replace(/\s/g, '');
}

export async function fetchLondonSunTimes(date = new Date()): Promise<{ sunrise: Date; sunset: Date }> {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  const url = `https://api.sunrise-sunset.org/json?lat=${LONDON_LAT}&lng=${LONDON_LNG}&date=${dateStr}&formatted=0`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch sunrise and sunset times');
  }

  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(data.status);
  }

  return {
    sunrise: new Date(data.results.sunrise),
    sunset: new Date(data.results.sunset),
  };
}
