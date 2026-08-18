// Dev-mode e-posta gönderimi — gerçek bir sağlayıcı (Resend/SES/SMTP) henüz seçilmedi, o yüzden
// kodu konsola yazıyoruz. Gerçek entegrasyon eklenene kadar bu tek fonksiyon değişecek, çağıran
// route kodu (routes/auth.ts) etkilenmeyecek.
export async function sendOtpEmail(email: string, code: string, purpose: 'register' | 'reset'): Promise<void> {
  console.log(`[dev-mailer] ${purpose} OTP for ${email}: ${code}`);
}
