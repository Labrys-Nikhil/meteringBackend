
const Ticket = require("../model/Ticket");
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");


// Create a new ticket
const createTicket = async (req, res) => {
    try {

        console.log("Creating ticket with data:", req.body);

        if (!req.body.title || !req.body.description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        const { title, description, priority, category } = req.body;
        const cata = category?.toUpperCase();
        const pri = priority?.toUpperCase();
        const userId = req.user.id; // middleware 
        const user = await User.findById(userId);

        console.log("Creating ticket with data:", {
            title,
            description,
            priority: pri,
            category: cata,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "OPEN",
            createdBy: userId,
            assignedTo: user.adminId
        });
        const ticket = await Ticket.create({
            title,
            description,
            priority: pri,
            catagory: cata,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "OPEN",
            createdBy: userId,
            assignedTo: user.adminId
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all tickets (admin/superAdmin can view all, user can view own)
const getTickets = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === "user") {
            query = { createdBy: req.user._id };
        }

        const tickets = await Ticket.find(query)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role");

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const closeTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .populate("escalatedBy", "name email role")
            .populate("escalatedTo", "name email role")
            .populate('comments.user', 'name role createdAt');
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "CLOSED") {
            return res.status(400).json({ error: "Ticket is already closed" });
        }
        await ticket.changeStatus("CLOSED", req.user.id, "Ticket closed by user");
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PATCH /api/tickets/:id/priority
const changePriority = async (req, res) => {
    try {
        const { priority, notes } = req.body;
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .populate("escalatedBy", "name email role")
            .populate("escalatedTo", "name email role")
            .populate('comments.user', 'name role createdAt');;
        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        if (ticket.status === "CLOSED") {
            return res.status(400).json({ error: "Ticket is already closed" });
        }

        if (priority) {
            ticket.priority = priority.toUpperCase();
        }

        await ticket.save();

        res.status(200).json({
            message: "Priority updated successfully",
            ticket
        });
    } catch (err) {
        console.error("Error changing priority:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Get single ticket
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .populate("comments.user", "name email role ");

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// // Add comment
// const addComment = async (req, res) => {
//     try {
//         const  data  = req.body;
//         console.log("Adding comment to ticket:", data?.comment);
//         const ticket = await Ticket.findById(req.params.id);
//         if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//         await ticket.addComment(data, req.user._id);
//         await ticket.save();

//         // Re-populate the ticket to return updated comments
//         const updatedTicket = await Ticket.findById(req.params.id)
//             .populate("createdBy", "name email role")
//             .populate("assignedTo", "name email role")
//             .populate("comments.user", "name email role");

//         res.json(upadatedTicket);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };
// Add comment
// Add comment
const addComment = async (req, res) => {
    try {
        const { comment } = req.body; // expecting { comment: "some text" }
        console.log("Adding comment to ticket:", comment, req.user);

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        // Use helper method defined in schema
        await ticket.addComment(req.user.id, comment);

        // Re-fetch with population
        const updatedTicket = await Ticket.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .populate("escalatedBy", "name email role")
            .populate("escalatedTo", "name email role")
            .populate('comments.user', 'name role createdAt');

        res.json(updatedTicket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Change status
const changeStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        console.log("Changing status for ticket:", req.params.id, "to", status, "with notes:", notes,);
        const ticket = await Ticket.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .populate("escalatedBy", "name email role")
            .populate("escalatedTo", "name email role")
            .populate('comments.user', 'name role createdAt');
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        await ticket.changeStatus(status?.toUpperCase(), req.user?.id, notes);
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Escalate ticket (admin → superAdmin)
const escalateTicket = async (req, res) => {
    try {
        const { reason } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        await ticket.escalate(req.user._id, req.user.role, reason);
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Clear escalation
const clearEscalation = async (req, res) => {
    try {
        const { note } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        await ticket.clearEscalation(req.user._id, req.user.role, note);
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Reopen ticket
const reopenTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .populate("escalatedBy", "name email role")
            .populate("escalatedTo", "name email role")
            .populate('comments.user', 'name role createdAt');
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        if (["RESOLVED", "CLOSED"].includes(ticket.status)) {
            await ticket.changeStatus("OPEN", req.user.id, "Ticket reopened");
        }

        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getByAdminId = async (req, res) => {
    try {
        const { adminId } = req.params;

        const tickets = await Ticket.find({ assignedTo: adminId })
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role");

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets by Admin ID", error });
    }
};

const getByUserId = async (req, res) => {
    try {
        const { role } = req.user;
        const { userId } = req.params;

        let tickets;

        if (role === 'admin') {
            // Tickets assigned to admin OR escalated by admin
            tickets = await Ticket.find({
                $or: [{ assignedTo: userId }, { escalatedBy: userId }]
            })
                .populate("createdBy", "name email role")
                .populate("assignedTo", "name email role")
                .populate("escalatedBy", "name email role")
                .populate("escalatedTo", "name email role")
                .populate('comments.user', 'name role createdAt');
        }
        else if (role === 'user') {
            // Tickets created by user
            tickets = await Ticket.find({ createdBy: userId })
                .populate("createdBy", "name email role")
                .populate("assignedTo", "name email role")
                .populate("escalatedBy", "name email role")
                .populate("escalatedTo", "name email role")
                .populate('comments.user', 'name role createdAt');
        }
        else if (role === 'superAdmin') {
            // Tickets escalated to superAdmin
            tickets = await Ticket.find({ escalatedTo: userId })
                .populate("createdBy", "name email role")
                .populate("assignedTo", "name email role")
                .populate("escalatedBy", "name email role")
                .populate("escalatedTo", "name email role")
                .populate('comments.user', 'name role createdAt');
        }
        else {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets by User ID", error });
    }
};


// Get tickets by Meter ID
const getByMeterId = async (req, res) => {
    try {
        const { meterId } = req.params;

        const tickets = await Ticket.find({ meterId })
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role");

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets by Meter ID", error });
    }
};
module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    addComment,
    changeStatus,
    escalateTicket,
    clearEscalation,
    reopenTicket,
    getByAdminId,
    getByUserId,
    getByMeterId,
    closeTicket,
    changePriority
};
