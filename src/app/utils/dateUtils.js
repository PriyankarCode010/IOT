// Utility function to calculate time left until target date
export function calculateTimeLeft(targetDate) {
  const difference = targetDate - new Date();
  let timeLeft = {};
  
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  
  return timeLeft;
}

// Returns the next July 10 (this year if not passed, next year if passed)
export function getNextJuly10() {
  const now = new Date();
  const year = now.getMonth() > 6 || (now.getMonth() === 6 && now.getDate() > 10) ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 6, 10); // July is month 6 (0-indexed)
} 