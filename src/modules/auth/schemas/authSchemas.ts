import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi zorunludur")
    .email("Gecerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(1, "Sifre zorunludur")
    .min(6, "Sifre en az 6 karakter olmalidir"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ad zorunludur")
      .min(2, "Ad en az 2 karakter olmalidir"),
    lastName: z
      .string()
      .min(1, "Soyad zorunludur")
      .min(2, "Soyad en az 2 karakter olmalidir"),
    email: z
      .string()
      .min(1, "E-posta adresi zorunludur")
      .email("Gecerli bir e-posta adresi giriniz"),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\\+90|0)?[0-9]{10}$/.test(val.replace(/\\s/g, "")),
        "Gecerli bir telefon numarasi giriniz"
      ),
    password: z
      .string()
      .min(1, "Sifre zorunludur")
      .min(6, "Sifre en az 6 karakter olmalidir")
      .regex(/[A-Z]/, "Sifre en az bir buyuk harf icermelidir")
      .regex(/[a-z]/, "Sifre en az bir kucuk harf icermelidir")
      .regex(/[0-9]/, "Sifre en az bir rakam icermelidir"),
    confirmPassword: z.string().min(1, "Sifre onayi zorunludur"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Sifreler eslesmiyor",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi zorunludur")
    .email("Gecerli bir e-posta adresi giriniz"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "E-posta adresi zorunludur")
      .email("Gecerli bir e-posta adresi giriniz"),
    token: z.string().min(1, "Token zorunludur"),
    newPassword: z
      .string()
      .min(1, "Yeni sifre zorunludur")
      .min(6, "Sifre en az 6 karakter olmalidir")
      .regex(/[A-Z]/, "Sifre en az bir buyuk harf icermelidir")
      .regex(/[a-z]/, "Sifre en az bir kucuk harf icermelidir")
      .regex(/[0-9]/, "Sifre en az bir rakam icermelidir"),
    confirmNewPassword: z.string().min(1, "Sifre onayi zorunludur"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Sifreler eslesmiyor",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
