// const express=require("express")
// const { createTicket, getAllTickets, getTicketbyID, updateTicket, addCommentToTicket, stats, getAvailableAssignees } = require("../controller/ticketController")

// const ticketRouter= express.Router()

// ticketRouter.post("/create-ticket", createTicket)
// ticketRouter.get("/all-ticket", getAllTickets)
// ticketRouter.get("/ticket-by-id", getTicketbyID)
// // ticketRouter.patch("/update-ticket", updateTicket)
// ticketRouter.patch("/update-ticket/:id", updateTicket);
// ticketRouter.post("/:id/comments", addCommentToTicket)
// ticketRouter.delete("/delete-ticket/:id", createTicket)
// ticketRouter.get("/users/assignees", getAvailableAssignees)

// // admin
// ticketRouter.get("/stats", stats)


// module.exports=ticketRouter










const express = require("express");
const router = express.Router();
const ticketController = require("../controller/supportAndTicketController");
const { authenticateToken } = require("../middleware/authenticateToken");

// all routes are protected
router.post("/create", authenticateToken, ticketController.createTicket);
router.get("/", authenticateToken, ticketController.getTickets);
router.get("/:id", authenticateToken, ticketController.getTicketById);
router.post("/:id/comment", authenticateToken, ticketController.addComment);
router.patch("/:id/status", authenticateToken, ticketController.changeStatus);
router.patch("/:id/escalate", authenticateToken, ticketController.escalateTicket);
router.patch("/:id/clear-escalation", authenticateToken, ticketController.clearEscalation);
router.patch("/:id/reopen", authenticateToken, ticketController.reopenTicket);
router.patch('/:id/change-priority',authenticateToken,ticketController.changePriority);
router.patch("/:id/close", authenticateToken, ticketController.closeTicket);

router.get("/admin/:adminId", authenticateToken, ticketController.getByAdminId);
router.get("/user/:userId", authenticateToken, ticketController.getByUserId);
router.get("/meter/:meterId", authenticateToken, ticketController.getByMeterId);

module.exports = router;