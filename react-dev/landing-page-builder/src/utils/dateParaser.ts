export function parseCustomDate(dateStr:string) {
  // Input: "30-Oct-2026T4:00 AM"
  // Output: ISO string like "2026-10-30T16:00:00Z"
  
  const match = dateStr.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})T(\d{1,2}):(\d{2})\s(AM|PM)/i);
  if (!match) return null;

  const [, day, month, year, hour, minute, period] = match;
  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  
  let h = parseInt(hour, 10);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  
  const date = new Date(Number(year as unknown as number), (months[(month.toLowerCase())] ), (day  as unknown  as number  ), h, (minute  as unknown  as number), 0);
  return date.toISOString(); // "2026-10-30T16:00:00.000Z"
}