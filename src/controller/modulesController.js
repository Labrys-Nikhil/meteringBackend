// controllers/modulesController.js  
const modulesService = require('../service/modulesService');

const getAllModules = async (req, res) => {
    try {
        const modules = await modulesService.getAllModules();
        return res.status(200).json(modules);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getModuleById = async (req, res) => {
    try {
        const module = await modulesService.getModuleById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        return res.status(200).json(module);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createModule = async (req, res) => {
    try {
        req.body.created_by = req.userID; // Set from auth middleware
        const newModule = await modulesService.createModule(req.body);
        return res.status(201).json(newModule);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const updateModule = async (req, res) => {
    try {
        req.body.updated_by = req.userID; // Set from auth middleware
        const updatedModule = await modulesService.updateModule(req.params.id, req.body);
        if (!updatedModule) {
            return res.status(404).json({ message: 'Module not found' });
        }
        return res.status(200).json(updatedModule);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteModule = async (req, res) => {
    try {
        const deleted = await modulesService.deleteModule(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Module not found' });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createModuleWithPermission = async (req, res) => {
    try {
        const { module, permission } = req.body;
        
        // Set created_by from auth middleware
        module.created_by = req.userID;
        permission.created_by = req.userID;

        const newModule = await modulesService.createOrUpdateModuleWithPermissions(module, permission);

        return res.status(201).json({
            message: 'Module created and permission handled',
            module: newModule
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
    createModuleWithPermission,
};