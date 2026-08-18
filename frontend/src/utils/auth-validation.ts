export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] ?? ''}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

const BIRTH_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const MIN_AGE = 18;

export function parseBirthDate(input: string): Date | null {
  const match = input.match(BIRTH_DATE_PATTERN);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isValidCalendarDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return isValidCalendarDate ? date : null;
}

export function isAtLeastMinAge(birthDate: Date, today: Date = new Date()): boolean {
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasHadBirthdayThisYear =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() >= birthDate.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= MIN_AGE;
}
