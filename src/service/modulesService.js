
// services/modulesService.js
const Module = require("../model/Module"); // ✅ correct

const Permission = require('../model/Permission');

const getAllModules = async () => {
    const modules = await Module.find({ status: true })
        .populate('created_by', 'name email')
        .populate('updated_by', 'name email')
        .sort({ _id: 1 });

    // Build hierarchical structure
    const moduleMap = {};
    modules.forEach(mod => {
        moduleMap[mod._id.toString()] = {
            ...mod.toObject(),
            children: []
        };
    });

    const rootModules = [];
    modules.forEach(mod => {
        const moduleId = mod._id.toString();
        const parentId = mod.parent_id ? mod.parent_id.toString() : null;
        
        if (parentId && moduleMap[parentId]) {
            moduleMap[parentId].children.push(moduleMap[moduleId]);
        } else {
            rootModules.push(moduleMap[moduleId]);
        }
    });

    return rootModules;
};

const getModuleById = async (id) => {
    return await Module.findById(id)
        .populate('created_by', 'name email')
        .populate('updated_by', 'name email');
};

const createModule = async (data) => {
    return await Module.create({
        name: data.name,
        path: data.path,
        created_by: data.created_by,
        is_sidebar: data.is_sidebar || false,
        parent_id: data.parent_id || null,
        icon: data.icon || null,
        color: data.color || null,
    });
};

const updateModule = async (id, data) => {
    return await Module.findByIdAndUpdate(
        id,
        {
            title: data.name,
            path: data.path,
            updated_by: data.updated_by,
            is_sidebar: data.is_sidebar || false,
            parent_id: data.parent_id || null,
        },
        { new: true }
    );
};

const deleteModule = async (id) => {
    // Also delete related permissions
    await Permission.deleteMany({ module_id: id });
    return await Module.findByIdAndDelete(id);
};

const createOrUpdateModuleWithPermissions = async (moduleData, permissionData) => {
    // Create module
    const createdModule = await Module.create({
        title: moduleData.name,
        path: moduleData.path,
        created_by: moduleData.created_by,
        is_sidebar: moduleData.is_sidebar || false,
        parent_id: moduleData.parent_id || null,
    });

    // Prepare permission data
    const fullPermissionData = {
        ...permissionData,
        module_id: createdModule._id
    };

    // Check if permission already exists
    const existingPermission = await Permission.findOne({
        admin_id: fullPermissionData.admin_id,
        user_id: fullPermissionData.user_id,
        role: fullPermissionData.role,
        module_id: fullPermissionData.module_id,
    });

    if (existingPermission) {
        // Update existing permission
        await Permission.findByIdAndUpdate(
            existingPermission._id,
            fullPermissionData,
            { new: true }
        );
    } else {
        // Create new permission
        await Permission.create(fullPermissionData);
    }

    return createdModule;
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
    createOrUpdateModuleWithPermissions,
};