const express = require("express")
const router = express.Router();

const permisionsController = require("../controller/permisionsController");
const modulesController = require("../controller/modulesController");
const { authenticateToken,authorizeRoles } = require("../middleware/authenticateToken");
// const {authorizeRole} = '../middleware/autharizeRoles';

// correct
router.get("/get-all-roles",authenticateToken, permisionsController.getAllRoles);

router.get("/get-all-modules", modulesController.getAllModules);
//correct
router.post("/add-modules",authenticateToken, modulesController.createModule);
router.post("/add-permissions", authenticateToken, permisionsController.createPermission);
router.get("/get-all-permissions", authenticateToken, permisionsController.getAllPermissions);
//correct
router.get("/get-permissions-by-role/:role", authenticateToken, permisionsController.getPermissionsByRole);
router.post("/update-permissions-in-bulk", authenticateToken, permisionsController.bulkUpsertPermissions);
router.get("/get-permissions-by-user-id/:id", authenticateToken, permisionsController.getPermissionsByUserId);
router.get("/get-view-permissions-by-role", authenticateToken, permisionsController.getViewPermissionsByRole);
module.exports = router;