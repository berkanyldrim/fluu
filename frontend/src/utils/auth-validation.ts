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

const MIN_AGE = 18;

export function isAtLeastMinAge(birthDate: Date, today: Date = new Date()): boolean {
  // Yerel takvim günleri karşılaştırılır (BirthDatePicker de tarihi yerel saatle oluşturuyor);
  // UTC getter'ları kullanmak gün sınırlarında (özellikle UTC+ dilimlerde) yanlış yaş hesaplardı.
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= MIN_AGE;
}
