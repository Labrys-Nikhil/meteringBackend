// const express = require("express");
// const {
//   createAlert,
//   getAlerts,
//   getAlert,
//   updateAlert,
//   deleteAlert,
//   getAvailableMeters,
// } = require("../controller/alertController");
// const { authenticateToken } = require("../middleware/authenticateToken");

// const alertRouter = express.Router();

// alertRouter.use(authenticateToken);
// // router.use(authorizeRoles("admin"));
// alertRouter.get("/available-meters", getAvailableMeters);
// alertRouter
//   .route("/")
//   .post(createAlert)
//   .get(getAlerts);

// alertRouter
//   .route("/:id")
//   .get(getAlert)
//   .patch(updateAlert)
//   .delete(deleteAlert);



// module.exports = alertRouter;







const express = require("express");
const {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  getAvailableMeters,
} = require("../controller/alertController");
const { authenticateToken } = require("../middleware/authenticateToken");

const alertRouter = express.Router();

alertRouter.use(authenticateToken);
// router.use(authorizeRoles("admin"));
alertRouter.get("/available-meters", getAvailableMeters);
alertRouter
  .route("/")
  .post(createAlert)
  .get(getAlerts);

alertRouter
  .route("/:id")
  .get(getAlert)
  .patch(updateAlert)
  .delete(deleteAlert);



module.exports = alertRouter;