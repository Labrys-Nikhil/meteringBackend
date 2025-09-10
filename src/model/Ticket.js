





// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// const TICKET_STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED", "CLOSED"];
// const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// // Status History
// const statusHistorySchema = new mongoose.Schema({
//     from: String,
//     to: { type: String, required: true },
//     by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     at: { type: Date, default: Date.now },
//     note: String
// }, { _id: false });

// // Comments
// const commentSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     message: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// }, { _id: false });

// // Main Ticket Schema
// const ticketSchema = new mongoose.Schema({
//     ticketId: {
//         type: String,
//         unique: true,
//         default: () => `TICKET-${uuidv4()}`,
//     },
//     title: {
//         type: String,
//         required: true,
//         trim: true,
//         maxlength: 200
//     },
//     description: {
//         type: String,
//         trim: true,
//         maxlength: 2000
//     },
//     status: {
//         type: String,
//         enum: TICKET_STATUSES,
//         default: "OPEN"
//     },
//     priority: {
//         type: String,
//         enum: PRIORITIES,
//         default: "MEDIUM"
//     },
//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     assignedTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     },
//     category: {
//         type: String,
//     },
//     dueDate: Date,
//     escalated: { type: Boolean, default: false },
//     escalatedTo:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
//     escalatedAt: Date,
//     escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     escalationReason: String,
//     escalationLevel: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 1  // 0 = no escalation, 1 = escalated to superAdmin
//     },
//     comments: [commentSchema],
//     statusHistory: [statusHistorySchema],
//     archived: { type: Boolean, default: false }
// }, { timestamps: true });

// // Basic indexes
// ticketSchema.index({ createdBy: 1 });
// ticketSchema.index({ assignedTo: 1 });
// ticketSchema.index({ escalated: 1 });
// ticketSchema.index({ escalationLevel: 1 });

// // Helper method to change status
// ticketSchema.methods.changeStatus = function (newStatus, userId, note) {
//     const oldStatus = this.status;
//     this.status = newStatus;

//     this.statusHistory.push({
//         from: oldStatus,
//         to: newStatus,
//         by: userId,
//         note: note
//     });

//     return this.save();
// };

// // Helper method to add comment
// ticketSchema.methods.addComment = function (userId, message) {
//     this.comments.push({
//         user: userId,
//         message: message
//     });

//     return this.save();
// };

// // Helper method to escalate ticket (only admin can escalate to superAdmin)
// ticketSchema.methods.escalate = function (userId, userRole, reason) {
//     // Only admin can escalate
//     if (userRole !== 'admin') {
//         throw new Error('Only admin users can escalate tickets');
//     }

//     this.escalated = true;
//     this.escalatedAt = new Date();
//     this.escalatedBy = userId;
//     this.escalationReason = reason;
//     this.escalationLevel = 1; // Escalated to superAdmin
//     this.escalatedTo = process.env.SUPER_ADMIN_ID; // Assuming superAdmin ID is stored in environment variable

//     // Auto change status to IN_PROGRESS if still OPEN
//     if (this.status === 'OPEN') {
//         return this.changeStatus('IN_PROGRESS', userId, `Escalated to SuperAdmin: ${reason}`);
//     }


//     return this.save();
// };

// // Helper method to clear escalation (admin or superAdmin can clear)
// ticketSchema.methods.clearEscalation = function (userId, userRole, note) {
//     // Only admin or superAdmin can clear escalation
//     if (!['admin', 'superAdmin'].includes(userRole)) {
//         throw new Error('Only admin or superAdmin can clear escalations');
//     }

//     this.escalated = false;
//     this.escalationLevel = 0;

//     // Add to status history
//     this.statusHistory.push({
//         from: this.status,
//         to: this.status,
//         by: userId,
//         note: `Escalation cleared by ${userRole}: ${note}`
//     });

//     return this.save();
// };

// module.exports = mongoose.model("Ticket", ticketSchema);
// module.exports.TICKET_STATUSES = TICKET_STATUSES;
// module.exports.PRIORITIES = PRIORITIES;












const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TICKET_STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Status History
const statusHistorySchema = new mongoose.Schema({
    from: String,
    to: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: Date.now },
    note: String
}, { _id: false });

// Comments
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Main Ticket Schema
const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        default: () => `TICKET-${uuidv4()}`,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: TICKET_STATUSES,
        default: "OPEN"
    },
    priority: {
        type: String,
        enum: PRIORITIES,
        default: "MEDIUM"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
    },
    dueDate: Date,
    escalated: { type: Boolean, default: false },
    escalatedTo:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
    escalatedAt: Date,
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    escalationReason: String,
    escalationLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 1  // 0 = no escalation, 1 = escalated to superAdmin
    },
    comments: [commentSchema],
    statusHistory: [statusHistorySchema],
    archived: { type: Boolean, default: false }
}, { timestamps: true });

// Basic indexes
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ escalated: 1 });
ticketSchema.index({ escalationLevel: 1 });

// Helper method to change status
ticketSchema.methods.changeStatus = function (newStatus, userId, note) {
    const oldStatus = this.status;
    this.status = newStatus;

    this.statusHistory.push({
        from: oldStatus,
        to: newStatus,
        by: userId,
        note: note
    });

    return this.save();
};

// Helper method to add comment
ticketSchema.methods.addComment = function (userId, message) {
    this.comments.push({
        user: userId,
        message: message
    });

    return this.save();
};

// Helper method to escalate ticket (only admin can escalate to superAdmin)
ticketSchema.methods.escalate = function (userId, userRole, reason) {
    // Only admin can escalate
    if (userRole !== 'admin') {
        throw new Error('Only admin users can escalate tickets');
    }

    this.escalated = true;
    this.escalatedAt = new Date();
    this.escalatedBy = userId;
    this.escalationReason = reason;
    this.escalationLevel = 1; // Escalated to superAdmin
    this.escalatedTo = process.env.SUPER_ADMIN_ID; // Assuming superAdmin ID is stored in environment variable

    // Auto change status to IN_PROGRESS if still OPEN
    if (this.status === 'OPEN') {
        return this.changeStatus('IN_PROGRESS', userId, `Escalated to SuperAdmin: ${reason}`);
    }


    return this.save();
};

// Helper method to clear escalation (admin or superAdmin can clear)
ticketSchema.methods.clearEscalation = function (userId, userRole, note) {
    // Only admin or superAdmin can clear escalation
    if (!['admin', 'superAdmin'].includes(userRole)) {
        throw new Error('Only admin or superAdmin can clear escalations');
    }

    this.escalated = false;
    this.escalationLevel = 0;

    // Add to status history
    this.statusHistory.push({
        from: this.status,
        to: this.status,
        by: userId,
        note: `Escalation cleared by ${userRole}: ${note}`
    });

    return this.save();
};

module.exports = mongoose.model("Ticket", ticketSchema);
module.exports.TICKET_STATUSES = TICKET_STATUSES;
module.exports.PRIORITIES = PRIORITIES;