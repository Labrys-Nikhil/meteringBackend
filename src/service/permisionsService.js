
// services/permissionsService.js
const Permission = require('../model/Permission');
const Module = require('../model/Module');
const User = require('../model/User');

const getAllPermissions = async () => {
    return await Permission.find()
        .populate('module_id', 'name path is_sidebar parent_id')
        .populate('admin_id', 'name email')
        .populate('user_id', 'name email')
        .populate('created_by', 'name email');
};

const getPermissionById = async (id) => {
    return await Permission.findById(id)
        .populate('module_id', 'name path is_sidebar parent_id')
        .populate('admin_id', 'name email')
        .populate('user_id', 'name email')
        .populate('created_by', 'name email');
};

const createPermission = async (data) => {
    return await Permission.create(data);
};

const updatePermission = async (id, data) => {
    return await Permission.findByIdAndUpdate(id, data, { new: true });
};

const deletePermission = async (id) => {
    return await Permission.findByIdAndDelete(id);
};

////////////////////////////////// uper wala sahi hai


////////////////////////////////////////////////////// neeche wala sahi hai today ke behalf me
const upsertPermissionsBulk = async (permissionsArray, user_id) => {
  const user = await User.findById(user_id);
  if (!user) {
    throw new Error("User not found");
  }

  // Role hierarchy rules
  const roleHierarchy = {
    superAdmin: ["superAdmin", "admin", "user"],
    admin: ["admin", "user"],
    user: ["user"]
  };

  // Determine admin_id based on user role and hierarchy
  let adminId;
  let superAdminId;

  if (user.role === 'superAdmin') {
    adminId = user._id;
    superAdminId = user._id;
  } else if (user.role === 'admin') {
    adminId = user._id;
    superAdminId = user.superAdminId || user.adminId;
  } else {
    adminId = user.adminId;
    superAdminId = user.superAdminId;
  }

  const results = [];

  for (const permission of permissionsArray) {
    const { module_id, read, create, update, delete: del, user_id: targetUserId } = permission;

    // Resolve target role
    let role;
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId).select("role");
      if (!targetUser) throw new Error("Target user not found");
      role = targetUser.role;
    } else if (permission.role) {
      role = permission.role;
    } else {
      role = user.role;
    }

    // Hierarchy check
    if (!roleHierarchy[user.role] || !roleHierarchy[user.role].includes(role)) {
      throw new Error(`You (${user.role}) are not allowed to update ${role} permissions`);
    }

    // Check if superAdmin has set permissions (blocks admin from editing)
    if (user.role === 'admin' && superAdminId && superAdminId.toString() !== adminId.toString()) {
      const superAdminPermission = await Permission.findOne({
        admin_id: superAdminId,
        role: role,
        module_id: module_id
      });

      if (superAdminPermission) {
        results.push({
          status: 'blocked',
          message: `SuperAdmin has already configured permissions for this module. You cannot modify them.`,
          module_id: module_id
        });
        continue;
      }
    }

    // Find existing permission under current admin's scope
    const existing = await Permission.findOne({
      admin_id: adminId,
      role: role,
      module_id: module_id
    });

    if (existing) {
      const updated = await Permission.findByIdAndUpdate(
        existing._id,
        {
          read,
          create,
          update,
          delete: del,
          updated_by: user._id,
          updatedAt: new Date()
        },
        { new: true }
      );
      results.push({ status: 'updated', data: updated });
    } else {
      const created = await Permission.create({
        admin_id: adminId,
        role: role,
        module_id: module_id,
        read,
        create,
        update,
        delete: del,
        created_by: user._id
      });
      results.push({ status: 'created', data: created });
    }
  }

  return results;
};

//////////////////////////////////////// today ke behalf me sahi hai
const getModulesWithPermissionsByRole = async (targetRole, user_id) => {
  console.log("Fetching modules with permissions for role:", targetRole, "and user_id:", user_id);
  
  // 1. Get user details
  const user = await User.findById(user_id);
  if (!user) throw new Error("User not found");

  // 2. Check role hierarchy access
  const roleHierarchy = {
    superAdmin: ["superAdmin", "admin", "user"],
    admin: ["admin", "user"], 
    user: ["user"]
  };

  if (!roleHierarchy[user.role] || !roleHierarchy[user.role].includes(targetRole)) {
    throw new Error(`You (${user.role}) are not allowed to fetch ${targetRole} permissions`);
  }

  // 3. Determine admin context
  let adminId;
  let superAdminId;

  if (user.role === "superAdmin") {
    adminId = user._id;
    superAdminId = user._id;
  } else if (user.role === "admin") {
    adminId = user._id;
    superAdminId = user.superAdminId || user.adminId;
  } else {
    adminId = user.adminId;
    superAdminId = user.superAdminId;
  }

  // 4. Get modules filtered by role
  let rolePrefix = "";
  if (targetRole === "superAdmin") rolePrefix = "/superadmin";
  else if (targetRole === "admin") rolePrefix = "/admin";  
  else if (targetRole === "user") rolePrefix = "/user";

  const modules = await Module.find({
    status: true,
    path: { $regex: `^${rolePrefix}` }
  });

  // 5. Get permissions for target role under current admin's scope
  const permissions = await Permission.find({
    admin_id: adminId,
    role: targetRole
  }).populate("module_id");

  // 6. Get superAdmin permissions for inheritance
  let superAdminPermissions = {};
  if (superAdminId && superAdminId.toString() !== adminId.toString()) {
    const superAdminPerms = await Permission.find({
      admin_id: superAdminId,
      role: targetRole
    });
    
    superAdminPerms.forEach(perm => {
      superAdminPermissions[perm.module_id.toString()] = {
        read: perm.read || false,
        create: perm.create || false,
        update: perm.update || false,
        delete: perm.delete || false
      };
    });
  }

  const permissionMap = {};
  permissions.forEach(perm => {
    if (perm.module_id) {
      permissionMap[perm.module_id._id.toString()] = {
        read: perm.read || false,
        create: perm.create || false,
        update: perm.update || false,
        delete: perm.delete || false
      };
    }
  });

  // 7. Get current user's own permissions (for permission limiting)
  let currentUserPermissions = {};
  if (user.role !== "superAdmin") {
    const userPerms = await Permission.find({
      admin_id: adminId,
      role: user.role
    });
    
    userPerms.forEach(perm => {
      currentUserPermissions[perm.module_id.toString()] = {
        read: perm.read || false,
        create: perm.create || false,
        update: perm.update || false,
        delete: perm.delete || false
      };
    });
  }

  // 8. Build module structure with proper inheritance
  const moduleMap = {};
  modules.forEach(module => {
    const moduleId = module._id.toString();
    const currentPermissions = permissionMap[moduleId] || {
      read: false, create: false, update: false, delete: false
    };

    // Get inherited permissions from superAdmin
    const inheritedPermissions = superAdminPermissions[moduleId];
    const userPerm = currentUserPermissions[moduleId] || {
      read: true, create: true, update: true, delete: true
    };

    let finalPermissions;
    let isEditable = true;
    let isSuperAdminControlled = false;

    if (user.role === "superAdmin") {
      // SuperAdmin sees their own permissions
      finalPermissions = currentPermissions;
      isEditable = true;
    } else if (inheritedPermissions) {
      // If superAdmin has set permissions, they are inherited and locked
      finalPermissions = inheritedPermissions;
      isEditable = false;
      isSuperAdminControlled = true;
    } else {
      // Normal case: combine current permissions with user's limits
      finalPermissions = {
        read: currentPermissions.read && userPerm.read,
        create: currentPermissions.create && userPerm.create,
        update: currentPermissions.update && userPerm.update,
        delete: currentPermissions.delete && userPerm.delete
      };
      isEditable = true;
    }

    moduleMap[moduleId] = {
      module_id: module._id,
      name: module.name,
      icon: module.icon,
      color: module.color,
      path: module.path,
      is_sidebar: module.is_sidebar,
      parent_id: module.parent_id ? module.parent_id.toString() : null,
      permissions: finalPermissions,
      isEditable: isEditable,
      isSuperAdminControlled: isSuperAdminControlled,
      children: []
    };
  });

  // 9. Nest children
  const rootModules = [];
  Object.values(moduleMap).forEach(mod => {
    if (mod.parent_id && moduleMap[mod.parent_id]) {
      moduleMap[mod.parent_id].children.push(mod);
    } else {
      rootModules.push(mod);
    }
  });

  return rootModules;
};


const getUserModulesWithPermissions = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let permissions = [];

    if (user.role === 'superAdmin') {
        // Try fetching by user_id first
        permissions = await Permission.find({
            user_id: user._id
        }).populate({
            path: 'module_id',
            match: { status: true }
        });
    }

    // If not found by user_id, fall back to admin-level permissions
    if (!permissions.length) {
        const adminId = user.role === 'superAdmin' ? user._id : user.adminId;
        permissions = await Permission.find({
            admin_id: adminId,
            role: user.role
        }).populate({
            path: 'module_id',
            match: { status: true }
        });
    }

    // Filter out null module_id
    const validPermissions = permissions.filter(perm => perm.module_id);

    // Build module map
    const moduleMap = {};
    validPermissions.forEach(perm => {
        const module = perm.module_id;
        const moduleId = module._id.toString();
        
        moduleMap[moduleId] = {
            module_id: module._id,
            name: module.name,
            icon: module.icon,
            color: module.color,
            path: module.path,
            is_sidebar: module.is_sidebar,
            parent_id: module.parent_id,
            permissions: {
                read: perm.read,
                create: perm.create,
                update: perm.update,
                delete: perm.delete
            },
            children: []
        };
    });

    // Build hierarchy
    const rootModules = [];
    Object.values(moduleMap).forEach(mod => {
        if (mod.parent_id && moduleMap[mod.parent_id.toString()]) {
            moduleMap[mod.parent_id.toString()].children.push(mod);
        } else {
            rootModules.push(mod);
        }
    });

    return rootModules;
};


module.exports = {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
    upsertPermissionsBulk,
    getModulesWithPermissionsByRole,
    getUserModulesWithPermissions
};
