
// controllers/permissionsController.js
const permisionsService = require('../service/permisionsService');

// controllers/roleController.js
const User = require("../model/User");

// const getAllRoles = (req, res) => {
//   try {
//     const roles = User.schema.path("role").enumValues;
//     console.log("Available roles:", roles);
//     if (!roles || roles.length === 0) {
//         return res.status(404).json({ message: "No roles found" });
//     }
//     res.status(200).json({ success: true, roles });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to fetch roles", error: err.message });
//   }
// };

const getAllRoles = (req, res) => {
  try {
    // Logged-in user role (from middleware/auth)
    const loggedInUserRole = req.user.role; 

    // All possible roles from schema
    const allRoles = User.schema.path("role").enumValues;

    let roles = [];

    if (loggedInUserRole === "superAdmin") {
      roles = allRoles.filter(r => r !== "user"); // superAdmin gets everything
    } else if (loggedInUserRole === "admin") {
      roles = allRoles.filter(r => r !== "superAdmin" && r !== "admin"); // admin + user
    } 
    // else if (loggedInUserRole === "user") {
    //   roles = ["user"]; // only user
    // } 
    else {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }

    if (!roles.length) {
      return res.status(404).json({ success: false, message: "No roles found" });
    }

    res.status(200).json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch roles", error: err.message });
  }
};


const getAllPermissions = async (req, res) => {
    try {
        const permissions = await permisionsService.getAllPermissions();
        return res.status(200).json(permissions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getPermissionById = async (req, res) => {
    try {
        const permission = await permisionsService.getPermissionById(req.params.id);
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        return res.status(200).json(permission);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// const createPermission = async (req, res) => {
//     try {
//         const newPermission = await permisionsService.createPermission(req.body);
//         return res.status(201).json(newPermission);
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };

// controllers/permissionsController.js


const createPermission = async (req, res) => {
  try {
    req.body.created_by = req.userID;   // set by auth middleware

    // If user_id is passed, get role automatically
    if (req.body.user_id) {
      const user = await User.findById(req.body.user_id).select("role");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.body.role = user.role;   // 👈 auto-assign role from user
    } else {
      // fallback → role of current user
      const creator = await User.findById(req.userID).select("role");
      req.body.role = creator.role;
    }

    const newPermission = await permisionsService.createPermission(req.body);
    return res.status(201).json(newPermission);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const updatePermission = async (req, res) => {
    try {
        const updatedPermission = await permisionsService.updatePermission(req.params.id, req.body);
        if (!updatedPermission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        return res.status(200).json(updatedPermission);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deletePermission = async (req, res) => {
    try {
        const deleted = await permisionsService.deletePermission(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const bulkUpsertPermissions = async (req, res) => {
    try {
        const permissions = req.body.permissions;
        const userId = req.userID; // From auth middleware

        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({ 
                message: 'Invalid input. permissions must be a non-empty array.' 
            });
        }

        const result = await permisionsService.upsertPermissionsBulk(permissions, userId);

        return res.status(200).json({
            message: 'Permissions updated successfully',
            result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const getPermissionsByRole = async (req, res) => {
    const targetRole = req.params.role;
    const userId = req.userID; // From auth middleware

    if (!targetRole) {
        return res.status(400).json({ message: 'Role is required' });
    }

    if (!['superAdmin', 'admin', 'user'].includes(targetRole)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const result = await permisionsService.getModulesWithPermissionsByRole(targetRole, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const getViewPermissionsByRole = async (req, res) => {
    const userId = req.userID; // From auth middleware
    const userRole = req.userRole; // From auth middleware

    try {
        const result = await permisionsService.getModulesWithPermissionsByRole(userRole, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const getPermissionsByUserId = async (req, res) => {
    const { id } = req.params;
       console.log("Fetching permissions for user ID:", id);
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const result = await permisionsService.getUserModulesWithPermissions(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
    bulkUpsertPermissions,
    getPermissionsByRole,
    getPermissionsByUserId,
    getViewPermissionsByRole,
    getAllRoles
};