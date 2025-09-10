// // routes/tickets.js
// const express = require("express");

// const Ticket = require("../model/Ticket");
// const User = require("../model/User");
// // const { authenticate, authorize } = require("../middleware/auth");
// const generateTicketId = require("../utils/ticketId");


// const getAllTickets = async (req, res) => {
//   try {
//     const { status, priority, search, category } = req.query;
//     const filter = {};

//     if (req.user.role === "user") {
//       filter.customer = req.user.id;
//     } else if (req.user.role === "admin") {
//       filter.$or = [{ adminId: req.user.id }, { assignedTo: req.user.id }];
//     } else if (req.user.role === "superAdmin") {
//       // Super admin can see all tickets
//     }

//     if (status && status !== "All") filter.status = status;
//     if (priority && priority !== "All") filter.priority = priority;
//     if (category) filter.category = category;

//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { ticketId: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     const tickets = await Ticket.find(filter)
//       .populate("customer", "name email")
//       .populate("assignedTo", "name")
//       .sort({ createdAt: -1 });

//     res.json(tickets);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



// const getTicketbyID = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id)
//       .populate("customer", "name email")
//       .populate("assignedTo", "name")
//       .populate("comments.author", "name");

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // Check permissions
//     if (
//       req.user.role === "user" &&
//       ticket.customer._id.toString() !== req.user.id
//     ) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     if (
//       req.user.role === "admin" &&
//       ticket.adminId.toString() !== req.user.id &&
//       ticket.assignedTo?._id.toString() !== req.user.id
//     ) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     res.json(ticket);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // // Update ticket (status, priority, assignee, etc.)

// // const updateTicket = async (req, res) => {
// //   try {
// //     const { actionType, ...updateData } = req.body;
// //     const ticket = await Ticket.findById(req.params.id);

// //     if (!ticket) {
// //       return res.status(404).json({ message: "Ticket not found" });
// //     }
// // console.log("======+++",req.user,req.body)
// //     // Check permissions
// //     const isAdminOrSuperAdmin = ["admin", "superAdmin"].includes(req.user.role);
// //     console.log("--1")
// //     const isAssignedTo = ticket.assignedTo?.toString() === req.user.id;
// //      console.log("--2")
// //     const isCustomer = ticket.customer.toString() === req.user.id;
// //      console.log("--3")

// //     if (!isAdminOrSuperAdmin && !isAssignedTo && !isCustomer) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }
// //     console.log("--4")
// //     // Handle different action types
// //     // if (actionType === "update_status") {
// //     //   if (!isAdminOrSuperAdmin && !isAssignedTo) {
// //     //     return res
// //     //       .status(403)
// //     //       .json({ message: "Unauthorized to change status" });
// //     //   }
// //     //   ticket.status = updateData.newStatus;
// //     // } else if (actionType === "update_priority") {
// //     //   if (!isAdminOrSuperAdmin) {
// //     //     return res
// //     //       .status(403)
// //     //       .json({ message: "Unauthorized to change priority" });
// //     //   }
// //     //   ticket.priority = updateData.newPriority;
// //     // } else if (actionType === "reassign_ticket") {
// //     //   if (!isAdminOrSuperAdmin) {
// //     //     return res.status(403).json({ message: "Unauthorized to reassign" });
// //     //   }
// //     //   ticket.assignedTo = updateData.newAssignee;
// //     // } else if (actionType === "forward_to_superadmin") {
// //     //   if (req.user.role !== "admin") {
// //     //     return res
// //     //       .status(403)
// //     //       .json({ message: "Only admins can forward tickets" });
// //     //   }
// //     //   ticket.forwardedToSuperAdmin = true;
// //     //   ticket.forwardedReason = updateData.reason;
// //     // } else {
// //     //   // General update (only customer can update description/title)
// //     //   if (!isCustomer) {
// //     //     return res
// //     //       .status(403)
// //     //       .json({ message: "Unauthorized to update ticket details" });
// //     //   }
// //     //   if (updateData.title) ticket.title = updateData.title;
// //     //   if (updateData.description) ticket.description = updateData.description;
// //     // }


// //     if (actionType === "update_status") {
// //   // Only admin or superadmin can update status
// //   if (!isAdminOrSuperAdmin) {
// //     return res
// //       .status(403)
// //       .json({ message: "Unauthorized to change status" });
// //   }
// //   ticket.status = updateData.newStatus;

// // } else if (actionType === "update_priority") {
// //   // Anyone with access (customer, assigned, admin, superadmin) can update priority
// //   ticket.priority = updateData.newPriority;

// // } else if (actionType === "reassign_ticket") {
// //   // Anyone with access can reassign
// //   ticket.assignedTo = updateData.newAssignee;

// // } else if (actionType === "forward_to_superadmin") {
// //   if (req.user.role !== "admin") {
// //     return res
// //       .status(403)
// //       .json({ message: "Only admins can forward tickets" });
// //   }
// //   ticket.forwardedToSuperAdmin = true;
// //   ticket.forwardedReason = updateData.reason;

// // } else {
// //   // General update (only customer can update description/title)
// //   if (!isCustomer) {
// //     return res
// //       .status(403)
// //       .json({ message: "Unauthorized to update ticket details" });
// //   }
// //   if (updateData.title) ticket.title = updateData.title;
// //   if (updateData.description) ticket.description = updateData.description;
// // }

// // console.log("=====ticket=======",ticket)
// //     await ticket.save();
// //     res.json(ticket);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // // Add comment to ticket

// // const addCommentToTicket = async (req, res) => {
// //   try {
// //     const { content } = req.body;
// //     const ticket = await Ticket.findById(req.params.id);

// //     if (!ticket) {
// //       return res.status(404).json({ message: "Ticket not found" });
// //     }

// //     // Check permissions
// //     const isAdminOrSuperAdmin = ["admin", "superAdmin"].includes(req.user.role);
// //     const isAssignedTo = ticket.assignedTo?.toString() === req.user.id;
// //     const isCustomer = ticket.customer.toString() === req.user.id;

// //     if (!isAdminOrSuperAdmin && !isAssignedTo && !isCustomer) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }

// //     const comment = {
// //       author: req.user.id,
// //       content,
// //     };

// //     ticket.comments.push(comment);
// //     await ticket.save();

// //     res.status(201).json(ticket);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // Delete ticket

// const deleteTicket = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // Only super admins or the ticket creator can delete
//     if (
//       req.user.role !== "superAdmin" &&
//       ticket.customer.toString() !== req.user.id
//     ) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     await ticket.remove();
//     res.json({ message: "Ticket deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get ticket statistics

// const stats = async (req, res) => {
//   try {
//     const stats = {
//       total: await Ticket.countDocuments(),
//       open: await Ticket.countDocuments({ status: "Open" }),
//       inProgress: await Ticket.countDocuments({ status: "In Progress" }),
//       resolved: await Ticket.countDocuments({ status: "Resolved" }),
//       closed: await Ticket.countDocuments({ status: "Closed" }),
//     };
//     res.json(stats);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // module.exports = router;

// const createTicket = async (req, res) => {
//   try {
//     const { title, description, priority, category, tags, assignedTo } = req.body;

//     const customer = await User.findById(req.user.id);
//     if (!customer) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Validate assignedTo if provided
//     let validAssignedTo = null;
//     if (assignedTo) {
//       // Check if the assigned user exists
//       const assignee = await User.findById(assignedTo);
//       if (!assignee) {
//         return res.status(400).json({ message: "Invalid assignee" });
//       }

//       // Authorization rules
//       if (req.user.role === "user") {
//         // Users can only assign to their admin or superadmin
//         const validAssignees = [customer.adminId, customer.superAdminId].filter(id => id);
//         if (!validAssignees.includes(assignedTo)) {
//           return res.status(403).json({ 
//             message: "You can only assign to your admin or superadmin" 
//           });
//         }
//       } else if (req.user.role === "admin") {
//         // Admins can assign to any admin or superadmin (not just their superadmin)
//         const isValidUser = await User.exists({ 
//           _id: assignedTo,
//           role: { $in: ['admin', 'superAdmin'] }
//         });
//         if (!isValidUser) {
//           return res.status(400).json({ message: "Invalid admin user assigned" });
//         }
//       }
//       validAssignedTo = assignedTo;
//     } else {
//       // Default assignment if not provided
//       if (req.user.role === "user") {
//         validAssignedTo = customer.adminId;
//       } else if (req.user.role === "admin") {
//         validAssignedTo = customer.superAdminId;
//       }
//     }

//     const ticketData = {
//       ticketId: generateTicketId(),
//       title,
//       description,
//       customer: req.user.id,
//       email: customer.email,
//       phone: customer.phonenumber || "",
//       priority,
//       category,
//       tags,
//       adminId: customer.adminId || null,
//       superAdminId: customer.superAdminId || null,
//       assignedTo: validAssignedTo
//     };

//     const ticket = new Ticket(ticketData);
//     await ticket.save();

//     res.status(201).json(ticket);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // const createTicket = async (req, res) => {
// //   try {
// //     const { title, description, priority, category, tags, assignedTo } = req.body;

// //     const customer = await User.findById(req.user.id);
// //     if (!customer) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     // Validate assignedTo if provided
// //     let validAssignedTo = null;
// //     if (assignedTo) {
// //       // Check if the assigned user exists
// //       const assignee = await User.findById(assignedTo);
// //       if (!assignee) {
// //         return res.status(400).json({ message: "Invalid assignee" });
// //       }

// //       // Authorization rules
// //       if (req.user.role === "user") {
// //         // Users can only assign to their admin or superadmin
// //         const validAssignees = [customer.adminId, customer.superAdminId].filter(id => id);
// //         if (!validAssignees.includes(assignedTo)) {
// //           return res.status(403).json({ 
// //             message: "You can only assign to your admin or superadmin" 
// //           });
// //         }
// //       } else if (req.user.role === "admin") {
// //         // Admins can only assign to superadmin
// //         if (assignedTo !== customer.superAdminId) {
// //           return res.status(403).json({ 
// //             message: "You can only assign to superadmin" 
// //           });
// //         }
// //       }
// //       validAssignedTo = assignedTo;
// //     } else {
// //       // Default assignment if not provided
// //       if (req.user.role === "user") {
// //         validAssignedTo = customer.adminId;
// //       } else if (req.user.role === "admin") {
// //         validAssignedTo = customer.superAdminId;
// //       }
// //     }

// //     const ticketData = {
// //       ticketId: generateTicketId(),
// //       title,
// //       description,
// //       customer: req.user.id,
// //       email: customer.email,
// //       phone: customer.phonenumber || "",
// //       priority,
// //       category,
// //       tags,
// //       adminId: customer.adminId || null,
// //       superAdminId: customer.superAdminId || null,
// //       assignedTo: validAssignedTo
// //     };

// //     const ticket = new Ticket(ticketData);
// //     await ticket.save();

// //     res.status(201).json(ticket);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // const updateTicket = async (req, res) => {
// //   try {
// //     console.log("----------1")
// //     const { actionType, ...updateData } = req.body;
// // const ticket = await Ticket.findById(req.params.id)
// //   .populate("customer", "name email role")
// //   .populate("assignedTo", "name email role")
// //   .populate("adminId", "name email role")
// //   .populate("superAdminId", "name email role");
// // console.log("=====6666666666666666==========",ticket)
// //     if (!ticket) {
// //       return res.status(404).json({ message: "Ticket not found" });
// //     }
// // console.log("----",req.body,req.user)
// //     // Check permissions
// //     const isAdminOrSuperAdmin = ["admin", "superAdmin"].includes(req.user.role);
// //     const isAssignedTo = ticket.assignedTo?.toString() === req.user.id;
// //     const isCustomer = ticket.customer.toString() === req.user.id;

// //     if (!isAdminOrSuperAdmin && !isAssignedTo && !isCustomer) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }

// //     if (actionType === "update_status") {
// //       // Only assigned user or superadmin can update status
// //       if (!isAssignedTo && req.user.role !== "superAdmin") {
// //         return res.status(403).json({ message: "Unauthorized to change status" });
// //       }
// //       ticket.status = updateData.newStatus;
// //     } else if (actionType === "update_priority") {
// //       // Anyone with access can update priority
// //       ticket.priority = updateData.newPriority;
// //     } else if (actionType === "reassign_ticket") {
// //       // Handle reassignment based on user role
// //  if (req.user.role === "user") {
// //   const validAssignees = [ticket.adminId, ticket.superAdminId]
// //     .filter(id => id)
// //     .map(id => id.toString()); // convert ObjectId to string
  
// //   if (!validAssignees.includes(updateData.newAssignee.toString())) {
// //     return res.status(403).json({ 
// //       message: "You can only assign to your admin or superadmin" 
// //     });
// //   }
// //       } else if (req.user.role === "admin") {
// //         // Admins can assign to any admin or superadmin (not just their superadmin)
// //         const isValidUser = await User.exists({ 
// //           _id: updateData.newAssignee,
// //           role: { $in: ['admin', 'superAdmin'] }
// //         });
// //         if (!isValidUser) {
// //           return res.status(400).json({ message: "Invalid admin user assigned" });
// //         }
// //       } else if (req.user.role === "superAdmin") {
// //         // Superadmins can assign to any admin
// //         const isValidUser = await User.exists({ 
// //           _id: updateData.newAssignee,
// //           role: { $in: ['admin', 'superAdmin'] }
// //         });
// //         if (!isValidUser) {
// //           return res.status(400).json({ message: "Invalid admin user assigned" });
// //         }
// //       }
// //       ticket.assignedTo = updateData.newAssignee;
// //     } else if (actionType === "forward_to_superadmin") {
// //       if (req.user.role !== "admin") {
// //         return res.status(403).json({ message: "Only admins can forward tickets" });
// //       }
// //       ticket.forwardedToSuperAdmin = true;
// //       ticket.forwardedReason = updateData.reason;
// //     } else {
// //       // General update (only customer can update description/title)
// //       if (!isCustomer) {
// //         return res.status(403).json({ message: "Unauthorized to update ticket details" });
// //       }
// //       if (updateData.title) ticket.title = updateData.title;
// //       if (updateData.description) ticket.description = updateData.description;
// //     }

// //     await ticket.save();
// //     res.json(ticket);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// const updateTicket = async (req, res) => {
//   try {
//     const { actionType, ...updateData } = req.body;

//     const ticket = await Ticket.findById(req.params.id)
//       .populate("customer", "name email role")
//       .populate("assignedTo", "name email role")
//       .populate("adminId", "name email role")
//       .populate("superAdminId", "name email role");

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     const isAdminOrSuperAdmin = ["admin", "superAdmin"].includes(req.user.role);
//     const isAssignedTo = ticket.assignedTo?._id?.toString() === req.user.id;
//     const isCustomer = ticket.customer?._id?.toString() === req.user.id;

//     // Permissions
//     if (!isAdminOrSuperAdmin && !isAssignedTo && !isCustomer) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     // Handle actions
//     if (actionType === "update_status") {
//       // Only admin or superadmin can change status
//       if (!isAdminOrSuperAdmin) {
//         return res.status(403).json({ message: "Only admin or superAdmin can change status" });
//       }
//       ticket.status = updateData.newStatus;

//     } else if (actionType === "update_priority") {
//       // Anyone with access can change priority
//       ticket.priority = updateData.newPriority;

//     } else if (actionType === "reassign_ticket") {
//       if (req.user.role === "user") {
//         const validAssignees = [ticket.adminId?._id, ticket.superAdminId?._id]
//           .filter(Boolean)
//           .map(id => id.toString());

//         if (!validAssignees.includes(updateData.newAssignee.toString())) {
//           return res.status(403).json({ message: "You can only assign to your admin or superAdmin" });
//         }

//       } else if (req.user.role === "admin") {
//         // Admin can assign only to their own superAdmin
//         if (ticket.superAdminId?._id?.toString() !== updateData.newAssignee.toString()) {
//           return res.status(403).json({ message: "Admins can only assign to their own superAdmin" });
//         }

//       } else if (req.user.role === "superAdmin") {
//         // SuperAdmin can assign to any admin
//         const isValidUser = await User.exists({
//           _id: updateData.newAssignee,
//           role: "admin"
//         });
//         if (!isValidUser) {
//           return res.status(400).json({ message: "Invalid admin user assigned" });
//         }
//       }

//       ticket.assignedTo = updateData.newAssignee;

//     } else if (actionType === "forward_to_superadmin") {
//       if (req.user.role !== "admin") {
//         return res.status(403).json({ message: "Only admins can forward tickets" });
//       }
//       ticket.forwardedToSuperAdmin = true;
//       ticket.forwardedReason = updateData.reason;

//     } else {
//       // Only customer can update description/title
//       if (!isCustomer) {
//         return res.status(403).json({ message: "Unauthorized to update ticket details" });
//       }
//       if (updateData.title) ticket.title = updateData.title;
//       if (updateData.description) ticket.description = updateData.description;
//     }

//     await ticket.save();
//     res.json(ticket);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // const updateTicket = async (req, res) => {
// //   try {
// //     const { actionType, ...updateData } = req.body;
// //     const ticket = await Ticket.findById(req.params.id);

// //     if (!ticket) {
// //       return res.status(404).json({ message: "Ticket not found" });
// //     }

// //     // Check permissions
// //     const isAdminOrSuperAdmin = ["admin", "superAdmin"].includes(req.user.role);
// //     const isAssignedTo = ticket.assignedTo?.toString() === req.user.id;
// //     const isCustomer = ticket.customer.toString() === req.user.id;

// //     if (!isAdminOrSuperAdmin && !isAssignedTo && !isCustomer) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }

// //     if (actionType === "update_status") {
// //       // Only assigned user or superadmin can update status
// //       if (!isAssignedTo && req.user.role !== "superAdmin") {
// //         return res.status(403).json({ message: "Unauthorized to change status" });
// //       }
// //       ticket.status = updateData.newStatus;
// //     } else if (actionType === "update_priority") {
// //       // Anyone with access can update priority
// //       ticket.priority = updateData.newPriority;
// //     } else if (actionType === "reassign_ticket") {
// //       // Handle reassignment based on user role
// //       if (req.user.role === "user") {
// //         // Users can only assign to their admin or superadmin
// //         const validAssignees = [ticket.adminId, ticket.superAdminId].filter(id => id);
// //         if (!validAssignees.includes(updateData.newAssignee)) {
// //           return res.status(403).json({ 
// //             message: "You can only assign to your admin or superadmin" 
// //           });
// //         }
// //       } else if (req.user.role === "admin") {
// //         // Admins can only assign to superadmin
// //         if (updateData.newAssignee !== ticket.superAdminId) {
// //           return res.status(403).json({ 
// //             message: "You can only assign to superadmin" 
// //           });
// //         }
// //       } else if (req.user.role === "superAdmin") {
// //         // Superadmins can assign to any admin
// //         const isValidUser = await User.exists({ 
// //           _id: updateData.newAssignee,
// //           role: { $in: ['admin', 'superAdmin'] }
// //         });
// //         if (!isValidUser) {
// //           return res.status(400).json({ message: "Invalid admin user assigned" });
// //         }
// //       }
// //       ticket.assignedTo = updateData.newAssignee;
// //     } else if (actionType === "forward_to_superadmin") {
// //       if (req.user.role !== "admin") {
// //         return res.status(403).json({ message: "Only admins can forward tickets" });
// //       }
// //       ticket.forwardedToSuperAdmin = true;
// //       ticket.forwardedReason = updateData.reason;
// //     } else {
// //       // General update (only customer can update description/title)
// //       if (!isCustomer) {
// //         return res.status(403).json({ message: "Unauthorized to update ticket details" });
// //       }
// //       if (updateData.title) ticket.title = updateData.title;
// //       if (updateData.description) ticket.description = updateData.description;
// //     }

// //     await ticket.save();
// //     res.json(ticket);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// const addCommentToTicket = async (req, res) => {
//   try {
//     const { content } = req.body;
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // Check permissions
//     const isAdminOrSuperAdmin = ["admin", "superAdmin"].includes(req.user.role);
//     const isAssignedTo = ticket.assignedTo?.toString() === req.user.id;
//     const isCustomer = ticket.customer.toString() === req.user.id;

//     if (!isAdminOrSuperAdmin && !isAssignedTo && !isCustomer) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const comment = {
//       author: req.user.id,
//       content,
//     };

//     ticket.comments.push(comment);
//     await ticket.save();

//     res.status(201).json(ticket);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// const getAvailableAssignees = async (req, res) => {
//   try {
//     let query = {};
//     console.log("=====query====",req.query)
    
//     if (req.query.adminId && req.query.superAdminId) {
//       // For regular users
//       query = { 
//         _id: { $in: [req.query.adminId, req.query.superAdminId] },
//         role: { $in: ['admin', 'superAdmin'] }
//       };
//     } else if (req.query.superAdminId) {
//       // For admins
//       query = { 
//         _id: req.query.superAdminId,
//         role: 'superAdmin'
//       };
//     } else {
//       // For superadmins
//       query = { role: { $in: ['admin', 'superAdmin'] } };
//     }

//     const assignees = await User.find(query).select('name email role');
//     res.json(assignees);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }; 
// module.exports = {
//   createTicket,
//   getAllTickets,
//   getTicketbyID,
//   updateTicket,
//   addCommentToTicket,
//   deleteTicket,
//   stats,
//   getAvailableAssignees
// };






















const { ca } = require("zod/v4/locales");
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
            priority:pri,
            category:cata,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "OPEN",
            createdBy: userId,
            assignedTo: user.adminId
        });
        const ticket = await Ticket.create({
            title,
            description,
            priority:pri,
            catagory:cata,
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
      .populate("comments.user", "name email role");

    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Change status
const changeStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        await ticket.changeStatus(status, req.user._id, note);
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
// const reopenTicket = async (req, res) => {
//     try {
//         const ticket = await Ticket.findById(req.params.id);
//         if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//         if (["RESOLVED", "CLOSED"].includes(ticket.status)) {
//             await ticket.changeStatus("OPEN", req.user._id, "Ticket reopened");
//         }

//         res.json(ticket);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


const reopenTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
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

// Get tickets by User ID
// const getByUserId = async (req, res) => {
//     try {
//         const {role} = req.user;
//         const { userId } = req.params;
//         if(role === 'admin' ){
//             //here we will find all the tickets created by admin or escalted by admin.

//             const tickets = await Ticket.find({ assignedTo: userId || { escalatedBy: userId } })
//             .populate("createdBy", "name email role").populate("assignedTo", "name email role");
//             res.status(200).json(tickets);

//         }else if(role === 'user'){
//             const tickets = await Ticket.find({ createdBy: userId })
//             .populate("createdBy", "name email role")
//             .populate("assignedTo", "name email role");

//         }else if(role === 'superAdmin'){
//             const tickets = await Ticket.find({ escalatedTo: userId }).populate('escalatedBy', 'name email role');
//             res.status(200).json(tickets);  
//         }else{
//             return res.status(403).json({ message: "Access denied" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching tickets by User ID", error });
//     }
// };

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

const changePriority = async (req, res) => {
  try {
    const { priority,notes } = req.body;  
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);
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
const closeTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
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
    changePriority,
    closeTicket
};





