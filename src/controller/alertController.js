// const Alert = require("../model/Alert");
// const Meter = require("../model/Meter");

// const createAlert = async (req, res) => {
//   // console.log("=== CREATE ALERT STARTED ===");
//   // console.log("Request body:", req.body);
  
//   const { id, role } = req.user;
//   // console.log("User ID:", id, "Role:", role);

//   const {
//     alertName,
//     alertType,
//     condition,
//     value,
//     notificationModes,
//     recipients,
//     isActive,
//     meterIds,
//     isSystemAlert,
//     editable,
//   } = req.body;

//   // console.log("Alert Type:", alertType);
//   // console.log("Is System Alert:", isSystemAlert);
//   // console.log("Meter IDs:", meterIds);

//   // Validate meter IDs for non-system alerts
//   if (!isSystemAlert && (!meterIds || meterIds.length === 0)) {
//     console.log("❌ Validation failed: No meters provided for non-system alert");
//     return res.status(400).json({ message: "At least one meter is required for non-system alerts" });
//   }
//   // console.log("✅ Meter validation passed");

//   // console.log("=====isSystemAlert=====", isSystemAlert, "isActive:", isActive);

//   // For users, ensure they have access to the meters they're trying to create alerts for
//   if (role === "user" && !isSystemAlert) {
//     // console.log("🔍 Checking user meter access...");
//     const userMeters = await Meter.find({ assignedUserId: id }).select("_id");
//     // console.log("User's meters:", userMeters);
    
//     const userMeterIds = userMeters.map(m => m._id.toString());
//     // console.log("User meter IDs:", userMeterIds);
    
//     const invalidMeters = meterIds.filter(meterId => 
//       !userMeterIds.includes(meterId.toString())
//     );
//     console.log("Invalid meters (no access):", invalidMeters);
    
//     if (invalidMeters.length > 0) {
//       console.log("❌ User doesn't have access to meters:", invalidMeters);
//       return res.status(403).json({ 
//         message: "You don't have access to one or more selected meters" 
//       });
//     }
//     // console.log("✅ User has access to all meters");
//   }

//   // Determine adminId based on role
//   let finalAdminId = id;
//   // console.log("Initial adminId:", finalAdminId);

//   if (role === "user") {
//     // console.log("👤 User role detected, finding admin ID...");
//     // Get the user's admin ID from their assigned meters
//     const userMeter = await Meter.findOne({ assignedUserId: id });
//     // console.log("User meter found:", userMeter);
    
//     if (!userMeter) {
//       // console.log("❌ User has no assigned meters");
//       return res.status(400).json({ message: "User has no assigned meters" });
//     }
    
//     finalAdminId = userMeter.adminId;
//     // console.log("Final adminId (user's admin):", finalAdminId);
//   }

//   // console.log("🔍 Starting duplicate check...");

//   // Check for duplicate alerts - check BOTH system and non-system alerts
//   // but only if they are active
  
//   if (isSystemAlert) {
//     // console.log("🔎 Checking for system alert duplicates...");
    
//     const query = {
//       adminId: finalAdminId,
//       alertType,
//       isActive: true,
//       isSystemAlert: true
//     };
    
//     // console.log("System alert duplicate check query:", JSON.stringify(query, null, 2));
    
//     const existingSystemAlert = await Alert.findOne(query);
//     // console.log("Existing system alert found:", existingSystemAlert);

//     if (existingSystemAlert) {
//       // console.log("❌ Duplicate system alert found");
//       return res.status(400).json({
//         message: "An active system alert of this type already exists",
//       });
//     }
    
//     // console.log("✅ No duplicate system alert found");
//   } else {
//     // console.log("🔎 Checking for non-system alert duplicates...");
    
//     // First check if there's an active system alert that would conflict
//     const systemQuery = {
//       adminId: finalAdminId,
//       alertType,
//       isActive: true,
//       isSystemAlert: true
//     };
    
//     // console.log("System alert conflict check query:", JSON.stringify(systemQuery, null, 2));
    
//     const existingSystemAlert = await Alert.findOne(systemQuery);
//     // console.log("Existing system alert found (conflict check):", existingSystemAlert);

//     if (existingSystemAlert) {
//       // console.log("❌ Active system alert conflicts with non-system alert");
//       return res.status(400).json({
//         message: `An active system alert of type "${alertType}" already exists and conflicts with this meter`,
//       });
//     }
    
//     // Then check for non-system alerts with the same meter
//     for (const meterId of meterIds) {
//       // console.log("Checking meter:", meterId);
      
//       // Check for non-system alerts with this meter
//       const nonSystemQuery = {
//         adminId: finalAdminId,
//         alertType,
//         meterIds: { $in: [meterId] },
//         isActive: true,
//         isSystemAlert: false
//       };
      
//       // console.log("Non-system duplicate check query:", JSON.stringify(nonSystemQuery, null, 2));
      
//       const existingNonSystemAlert = await Alert.findOne(nonSystemQuery);
//       // console.log("Existing non-system alert found:", existingNonSystemAlert);

//       if (existingNonSystemAlert) {
//         // console.log("❌ Duplicate non-system alert found for meter:", meterId);
//         return res.status(400).json({
//           message: `An active alert of type "${alertType}" already exists for meter ${meterId}`,
//         });
//       }
      
//       // console.log("✅ No duplicate for meter:", meterId);
//     }
    
//     // console.log("✅ All meters passed duplicate check");
//   }

//   // console.log("📝 Creating new alert...");
  
//   const alertData = {
//     adminId: finalAdminId,
//     userId: role === "user" ? id : null,
//     alertName,
//     alertType,
//     condition,
//     value,
//     notificationModes,
//     recipients,
//     isActive,
//     meterIds,
//     isSystemAlert,
//     editable: role === "admin" ? editable : true,
//     createdBy: role,
//   };
  
//   // console.log("Alert data to create:", JSON.stringify(alertData, null, 2));

//   const alert = await Alert.create(alertData);
  
//   // console.log("✅ Alert created successfully:", alert);
//   // console.log("=== CREATE ALERT COMPLETED ===");
  
//   res.status(201).json({ alert });
// };
// const getAlerts = async (req, res) => {
//   try {
//     const { id, role } = req.user;
//     const { isSystemAlert, isActive, meterId } = req.query;
    
//     let query = {
//       alertType: { $nin: ["Recharge Failed", "Recharge Successful"] },
//     };

//     if (role === "admin") {
//       // Admin sees all alerts under their adminId
//       query.adminId = id;
//     } else if (role === "user") {
//       // Get user's admin ID from their assigned meters
//       const userMeters = await Meter.find({ assignedUserId: id }).select("_id adminId");
//       if (!userMeters.length) {
//         return res.status(200).json({ alerts: [] });
//       }

//       const adminId = userMeters[0].adminId;
//       const userMeterIds = userMeters.map(m => m._id);

//       // User can see:
//       query.$or = [
//         { adminId, isSystemAlert: true },          // System alerts from admin
//         { userId: id },                            // Alerts created by this user
//         { adminId, isSystemAlert: false, editable: true, meterIds: { $in: userMeterIds } } // Admin-created editable alerts for user's meters
//       ];

//       query.adminId = adminId; // Always restrict to admin scope

//       if (isSystemAlert !== undefined) {
//         if (isSystemAlert === "true") {
//           query.isSystemAlert = true;
//         } else {
//           query.isSystemAlert = false;
//         }
//       }
//     }

//     if (isActive !== undefined) {
//       query.isActive = isActive === "true";
//     }

//     if (meterId) {
//       query.meterIds = { $in: [meterId] };
//     }

//     const alerts = await Alert.find(query)
//       .populate("meterIds", "name meterSerialNumber meterId")
//       .lean();

//     res.status(200).json({ alerts });
//   } catch (error) {
//     console.error("Error fetching alerts:", error);
//     res.status(500).json({ message: "Failed to fetch alerts", error });
//   }
// };


// const getAlert = async (req, res) => {
//   const { id } = req.params;
//   const { adminId } = req.user;

//   const alert = await Alert.findOne({ _id: id, adminId }).populate(
//     "meterIds",
//     "name meterSerialNumber"
//   );

//   if (!alert) {
//     return res.status(404).json({ message: `Alert with id ${id} not found` });
//   }

//   res.status(200).json({ alert });
// };

// // Update updateAlert to handle user permissions
// const updateAlert = async (req, res) => {
//   const { id } = req.params;
//   const { id: userId, role } = req.user;
//   const updateData = req.body;

//   console.log("----",req.body)

//   // Find the alert first to check permissions
//   const alert = await Alert.findById(id);
//   if (!alert) {
//     return res.status(404).json({ message: `Alert with id ${id} not found` });
//   }

//   // Check if user has permission to edit this alert
//   if (role === "user") {
//     // Users can only edit alerts they created
//     if (alert.createdBy !== "user" || alert.userId.toString() !== userId) {
//       return res.status(403).json({ 
//         message: "You can only edit alerts you created" 
//       });
//     }
    
//     // Users cannot change certain fields
//     delete updateData.isSystemAlert;
//     delete updateData.adminId;
//     delete updateData.createdBy;
//   }

//   // For admins, prevent changing certain fields for system alerts
//   if (role === "admin" && alert.isSystemAlert) {
//     delete updateData.meterIds;
//     delete updateData.editable;
//   }

//   const updatedAlert = await Alert.findByIdAndUpdate(
//     id,
//     updateData,
//     { new: true, runValidators: true }
//   ).populate("meterIds", "name meterSerialNumber");

//   res.status(200).json({ alert: updatedAlert });
// };

// // Update deleteAlert to handle user permissions
// const deleteAlert = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { id: userId, role } = req.user;

//     // Find the alert first to check permissions
//     const alert = await Alert.findById(id);
//     if (!alert) {
//       return res.status(404).json({ message: `Alert with id ${id} not found` });
//     }

//     // Check permissions
//     if (role === "user") {
//       // Users can only delete alerts they created
//       if (alert.createdBy !== "user" || alert.userId.toString() !== userId) {
//         return res.status(403).json({ 
//           message: "You can only delete alerts you created" 
//         });
//       }
//     } else if (role === "admin") {
//       // Admins cannot delete system alerts or alerts they didn't create
//       if (alert.isSystemAlert ) {
//         return res.status(403).json({ 
//           message: "Cannot delete this alert" 
//         });
//       }
//     }

//     await Alert.findByIdAndDelete(id);
//     res.status(200).json({ message: "Alert deleted successfully" });
//   } catch (error) {
//     console.error("Delete alert error:", error);
//     res.status(500).json({ message: "Server error deleting alert" });
//   }
// };

// const getAvailableMeters = async (req, res) => {
//   try {
//     const { id, role } = req.user;
//     const { excludeSystemAlerts } = req.query;

//     let availableMeters = [];

//     if (role === "admin") {
//       // Admin sees all their meters that are assigned
//       availableMeters = await Meter.find({
//         adminId: id,
//         isAssigned: true
//       }).select("name meterSerialNumber meterId type");

//     } else if (role === "user") {
//       // Users see only their assigned meters
//       availableMeters = await Meter.find({
//         assignedUserId: id,
//         isAssigned: true
//       }).select("name meterSerialNumber meterId type");
//     }

//     res.status(200).json({ meters: availableMeters });
//   } catch (err) {
//     console.error("Error in getAvailableMeters:", err);
//     res.status(500).json({ message: "Failed to fetch available meters" });
//   }
// };


// module.exports = {
//   createAlert,
//   getAlerts,
//   getAlert,
//   updateAlert,
//   deleteAlert,
//   getAvailableMeters,
// };


















const Alert = require("../model/Alert");
const Meter = require("../model/Meter");



const createAlert = async (req, res) => {
  try {
    const { id, role, adminId } = req.user;
    // console.log("=====req.user====", req.user);
    // console.log("✅ Incoming request user:", { id, role });

    const {
      alertName,
      alertType,
      condition,
      value,
      notificationSettings,
      isActive,
      isSystemAlert,
      meterIds,
      editable,
    } = req.body;

    // console.log("📥 Request body:", {
    //   alertName,
    //   alertType,
    //   condition,
    //   value,
    //   notificationSettings,
    //   isActive,
    //   isSystemAlert,
    //   meterIds,
    //   editable,
    // });

    // 🔎 Ensure we always know the final adminId
    let finalAdminId = role === "admin" ? id : adminId;
    if (!finalAdminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID could not be determined.",
      });
    }

      // ---- DUPLICATE CHECK ----
  // 1. Global system alert block
  const existingSystemAlert = await Alert.findOne({
    adminId: finalAdminId,
    alertType,
    isActive: true,
    isSystemAlert: true
  });
// console.log("====existingSystemAlert========",existingSystemAlert)
  if (existingSystemAlert) {
    return res.status(400).json({
      message: `An active system alert of type "${alertType}" already exists`,
    });
  }




    // 🚨 Prevent duplicate alerts
    let existingAlert;

    if (isSystemAlert) {
      console.log("🔍 Checking for duplicate SYSTEM alert...");
      existingAlert = await Alert.findOne({
        adminId: finalAdminId,
        alertType,
        isActive: true,
        isSystemAlert: true,
      });
    } else {
      console.log("🔍 Checking for duplicate NON-SYSTEM alerts...");

      for (const meterId of meterIds) {
        const found = await Alert.findOne({
          adminId: finalAdminId,
          userId: role === "user" ? id : null, // user-specific check
          alertType,
          meterIds: { $in: [meterId] },
          isActive: true,
          isSystemAlert: false,
        });

        if (found) {
          existingAlert = found;
          // console.log("⚠️ Duplicate alert found:", existingAlert);

          return res.status(400).json({
            success: false,
            message:
              role === "user"
                ? `You already have an active '${alertType}' alert for meter ${meterId}.`
                : `An active '${alertType}' alert already exists for meter ${meterId}.`,
          });
        }
      }
    }

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: isSystemAlert
          ? `System alert of type '${alertType}' already exists and is active.`
          : `Duplicate non-system alert detected.`,
      });
    }

    // 🆕 Create new alert
    const newAlert = new Alert({
      adminId: finalAdminId,
      userId: role === "user" ? id : null,
      alertName,
      alertType,
      condition,
      value,
      notificationSettings,
      isActive,
      isSystemAlert,
      meterIds,
      editable: role === "admin" ? editable : true,
      createdBy: role,
    });

    // console.log("📝 Saving new alert:", newAlert);
    await newAlert.save();

    // console.log("✅ Alert created successfully:", newAlert);

    return res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: newAlert,
    });
  } catch (error) {
    console.error("🔥 Error in createAlert:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};




const getAlerts = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { isSystemAlert, isActive, meterId } = req.query;
    
    let query = {
      alertType: { $nin: ["Recharge Failed", "Recharge Successful"] },
    };

    if (role === "admin") {
      // Admin sees all alerts under their adminId
      query.adminId = id;
    } else if (role === "user") {
      // Get user's admin ID from their assigned meters
      const userMeters = await Meter.find({ assignedUserId: id }).select("_id adminId");
      if (!userMeters.length) {
        return res.status(200).json({ alerts: [] });
      }

      const adminId = userMeters[0].adminId;
      const userMeterIds = userMeters.map(m => m._id);

      // User can see:
      query.$or = [
        { adminId, isSystemAlert: true },          // System alerts from admin
        { userId: id },                            // Alerts created by this user
        { adminId, isSystemAlert: false, editable: true, meterIds: { $in: userMeterIds } } // Admin-created editable alerts for user's meters
      ];

      query.adminId = adminId; // Always restrict to admin scope

      if (isSystemAlert !== undefined) {
        if (isSystemAlert === "true") {
          query.isSystemAlert = true;
        } else {
          query.isSystemAlert = false;
        }
      }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (meterId) {
      query.meterIds = { $in: [meterId] };
    }

    const alerts = await Alert.find(query)
      .populate("meterIds", "name meterSerialNumber meterId")
      .lean();

    res.status(200).json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts", error });
  }
};

const getAlert = async (req, res) => {
  const { id } = req.params;
  const { adminId } = req.user;

  const alert = await Alert.findOne({ _id: id, adminId }).populate(
    "meterIds",
    "name meterSerialNumber"
  );

  if (!alert) {
    return res.status(404).json({ message: `Alert with id ${id} not found` });
  }

  res.status(200).json({ alert });
};

const updateAlert = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const updateData = req.body;

  // Find the alert first to check permissions
  const alert = await Alert.findById(id);
  if (!alert) {
    return res.status(404).json({ message: `Alert with id ${id} not found` });
  }

  // Check if user has permission to edit this alert
  if (role === "user") {
    // Users can only edit alerts they created
    if (alert.createdBy !== "user" || alert.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "You can only edit alerts you created" 
      });
    }
    
    // Users cannot change certain fields
    delete updateData.isSystemAlert;
    delete updateData.adminId;
    delete updateData.createdBy;
  }

  // For admins, prevent changing certain fields for system alerts
  if (role === "admin" && alert.isSystemAlert) {
    delete updateData.meterIds;
    delete updateData.editable;
  }

  const updatedAlert = await Alert.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("meterIds", "name meterSerialNumber");

  res.status(200).json({ alert: updatedAlert });
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // Find the alert first to check permissions
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: `Alert with id ${id} not found` });
    }

    // Check permissions
    if (role === "user") {
      // Users can only delete alerts they created
      if (alert.createdBy !== "user" || alert.userId.toString() !== userId) {
        return res.status(403).json({ 
          message: "You can only delete alerts you created" 
        });
      }
    } else if (role === "admin") {
      // Admins cannot delete system alerts or alerts they didn't create
      if (alert.isSystemAlert ) {
        return res.status(403).json({ 
          message: "Cannot delete this alert" 
        });
      }
    }

    await Alert.findByIdAndDelete(id);
    res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Delete alert error:", error);
    res.status(500).json({ message: "Server error deleting alert" });
  }
};

const getAvailableMeters = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { excludeSystemAlerts } = req.query;

    let availableMeters = [];

    if (role === "admin") {
      // Admin sees all their meters that are assigned
      availableMeters = await Meter.find({
        adminId: id,
        isAssigned: true
      }).select("name meterSerialNumber meterId type");

    } else if (role === "user") {
      // Users see only their assigned meters
      availableMeters = await Meter.find({
        assignedUserId: id,
        isAssigned: true
      }).select("name meterSerialNumber meterId type");
    }

    res.status(200).json({ meters: availableMeters });
  } catch (err) {
    console.error("Error in getAvailableMeters:", err);
    res.status(500).json({ message: "Failed to fetch available meters" });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  getAvailableMeters,
};


