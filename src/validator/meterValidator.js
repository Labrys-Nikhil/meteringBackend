const { z } = require("zod");

// Utility: Ensure meterSerialNumber is numeric for hex conversion if needed
const meterValidator = z.object({

  //*
  devEUI: z
    .string()
    .length(16, "DevEUI must be a 16-character string (LoRaWAN format)"),

  //*
  name: z
    .string()
    .min(3, "Meter name must be at least 3 characters long"),

  type: z
    .string()
    .min(3, "Meter type is required").default("Smart Meter")
    .optional(),

  //*  
  meterSerialNumber: z
    .string()
    .regex(/^\d+$/, "Meter serial number must be numeric"),

  //*
  slaveId: z
    .string()
    .min(1, "Slave ID is required"),

  status: z
    .enum(["online", "offline", "faulty"])
    .default("offline")
    .optional(),

  lastSeen: z.iso
    .datetime()
    .optional(),

  //*
  userId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid userId format (must be ObjectId)").optional(),
  
  //*
  adminId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid userId format (must be ObjectId)"),
  deviceId: z
     .string()
     
});

module.exports = { meterValidator };