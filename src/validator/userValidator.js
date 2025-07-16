
const { z } = require("zod");

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"], {
    errorMap: () => ({ message: "Role must be either 'admin' or 'user'" })
  }),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must be no more than 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .optional(),
  adminId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid userId format (must be ObjectId)"),
}).check((data) => {
  const issues = [];

  if (data.role === 'user') {
    if (!data.phoneNumber) {
      issues.push({
        code: "custom",
        path: ["phone"],
        message: "Phone number is required when role is 'user'."
      });
    }
  }

  return issues.length > 0 ? issues : true;
}).strict();

module.exports = { userSchema };
