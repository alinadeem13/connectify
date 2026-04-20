import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address.").transform((value) => value.trim().toLowerCase()),
  role: z.enum(["creator", "consumer"]),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or fewer.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only use letters, numbers, underscores, and dashes."),
});

export const createPhotoSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  caption: z.string().trim().min(1, "Caption is required."),
  location: z.string().trim().min(1, "Location is required."),
  imageUrl: z.url("Image URL is invalid."),
  storagePath: z.string().trim().min(1, "Storage path is required."),
  peoplePresent: z.array(z.string().trim()).default([]),
});

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, "Comment text is required."),
});

export const createRatingSchema = z.object({
  value: z.number().int().min(1).max(5),
});
