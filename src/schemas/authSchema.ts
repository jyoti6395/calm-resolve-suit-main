import * as z from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
