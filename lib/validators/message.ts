import { z } from "zod";

export const messageSchema = z.object({
  message: z.string(),
});

export type TMessageSchema = z.infer<typeof messageSchema>;
