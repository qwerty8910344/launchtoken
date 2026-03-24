import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
};

export type Token = {
  id: string;
  userId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  decimals: number;
  description: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  contractAddress: string | null;
  network: string | null;
  deployed: boolean | null;
  paymentStatus: string | null;
  createdAt: Date | null;
};

export type ExchangeListing = {
  id: string;
  exchangeName: string;
  rating: number | null;
  estimatedListingDays: number;
  listingFee: number;
  active: boolean | null;
};

export type ListingPayment = {
  id: string;
  userId: string;
  tokenId: string;
  exchangeListingId: string;
  amount: number;
  network: string | null;
  paymentStatus: string | null;
  createdAt: Date | null;
};

export type InsertUser = {
  username: string;
  email: string;
  password: string;
};

export type InsertToken = {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  decimals: number;
  description?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
};

export type InsertExchangeListing = {
  exchangeName: string;
  rating?: number | null;
  estimatedListingDays: number;
  listingFee: number;
};

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
