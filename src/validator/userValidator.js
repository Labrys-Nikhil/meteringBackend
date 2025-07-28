
const { z } = require("zod");

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user","superadmin"], {
    errorMap: () => ({ message: "Role must be either 'admin' or 'user' or 'superadmin'" })
  }),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must be no more than 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .optional(),
  adminId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid userId format (must be ObjectId)"),
  superAdminId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid userId format (must be ObjectId)").optional(),
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


const actionHistorySchema = z.object({
 
  userId: z.string().nullable().optional(), 
  userName: z.string().optional(),
  actionType: z.string().optional(),
  details: z.any().optional(),
  timestamp: z.union([
    z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date string"
    }),
    z.date()
  ]).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
  performedBy: z.string().optional(),
});


const phoneValidation = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(10, "Phone number must be no more than 10 digits")
  .regex(/^\d+$/, "Phone number must contain only digits");

const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    // password: z.string().min(6, "Password must be at least 6 characters").optional(),
    password: z.union([
      z.string().min(6, "Password must be at least 6 characters").nonempty("Password cannot be empty"),
      z.literal(''),
      z.undefined()
    ]),
    role: z.enum(["superadmin", "admin", "user"], {
      errorMap: () => ({ message: "Role must be 'super admin', 'admin', or 'user'" }),
    }).default("user"),
    phonenumber: phoneValidation.optional(),
    adminId: z.string().optional(),
    superAdminId: z.string().optional(),
    status: z.string().optional(),  // <-- Added optional status field
    actionHistory: z.array(actionHistorySchema).optional(),
  })
  .check((data) => {
    const issues = [];

    if (data.role === "user") {
      if (!data.phonenumber) {
        issues.push({
          code: "custom",
          path: ["phonenumber"],
          message: "Phone number is required when role is 'user'",
        });
      }
      if (!data.adminId) {
        issues.push({
          code: "custom",
          path: ["adminId"],
          message: "adminId is required when role is 'user'",
        });
      }
      if (!data.superAdminId) {
        issues.push({
          code: "custom",
          path: ["superAdminId"],
          message: "superAdminId is required when role is 'user'",
        });
      }
    }

    if (data.role === "admin") {
      if (!data.phonenumber) {
        issues.push({
          code: "custom",
          path: ["phonenumber"],
          message: "Phone number is required when role is 'user'",
        });
      }
      if (!data.superAdminId) {
        issues.push({
          code: "custom",
          path: ["superAdminId"],
          message: "superAdminId is required when role is 'admin'",
        });
      }
    }

    return issues.length > 0 ? issues : true;
  });

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["superadmin", "admin", "user", "SuperAdmin", "Admin", "User"], {
    errorMap: () => ({ message: "Role must be 'super admin', 'admin', or 'user'" }),
  }).optional(),
  phonenumber: phoneValidation.optional(),
  adminId: z.string().optional(),
  superAdminId: z.string().optional(),
  status: z.string().optional(),  
  actionHistory: z.array(actionHistorySchema).optional(),
});

module.exports = {
  userSchema, createUserSchema,
  updateUserSchema,
};
