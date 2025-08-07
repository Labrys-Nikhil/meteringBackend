// const Payment = require("../model/Payment");
// const Meter = require("../model/Meter")

// const getPaymentsByMeterId = async (meterId, startTime, endTime) => {
    
//   const meter = await Meter.findOne({ meterId });
//   if (!meter) {
//     throw new Error("Meter not found");
//   }

//   // Step 2: Build date filter
//   const dateFilter = {};
//   if (startTime) dateFilter.$gte = new Date(startTime);
//   if (endTime) {
//     const end = new Date(endTime);
//     end.setHours(23, 59, 59, 999); // <-- Include entire day
//     dateFilter.$lte = end;
//   }

//   const query = {
//     meterId: meter._id,
//     ...(startTime || endTime ? { createdAt: dateFilter } : {})
//   };

//   // Step 3: Fetch payments with optional date filtering
//   const payments = await Payment.find(query).sort({ createdAt: -1 });

//   return payments;
// };

// module.exports = {getPaymentsByMeterId}



const Payment = require("../model/Payment");
const Meter = require("../model/Meter")
const User = require("../model/User");
const mongoose = require('mongoose')
const getPaymentsByMeterId = async (meterId, startTime, endTime) => {
    
  const meter = await Meter.findOne({ meterId });
  if (!meter) {
    throw new Error("Meter not found");
  }

  // Step 2: Build date filter
  const dateFilter = {};
  if (startTime) dateFilter.$gte = new Date(startTime);
  if (endTime) {
    const end = new Date(endTime);
    end.setHours(23, 59, 59, 999); // <-- Include entire day
    dateFilter.$lte = end;
  }

  const query = {
    meterId: meter._id,
    ...(startTime || endTime ? { createdAt: dateFilter } : {})
  };

  // Step 3: Fetch payments with optional date filtering
  const payments = await Payment.find(query).sort({ createdAt: -1 });

  return payments;
};


const getNegativePaymentsByAdminId = async (adminId) => {
  // Validate adminId before using
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error("Invalid adminId");
  }

  // Perform aggregation to find latest negative payment per meter
  const payments = await Meter.aggregate([
    {
      $match: {
        adminId: new mongoose.Types.ObjectId(adminId) // ✅ safe usage
      }
    },
    {
      $lookup: {
        from: "payments",
        let: { meterId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$meterId", "$$meterId"] },
                  { $lt: ["$amount", 0] } // Only negative payments
                ]
              }
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 }
        ],
        as: "latestNegativePayment"
      }
    },
    {
      $match: {
        latestNegativePayment: { $ne: [] } // Only keep meters with at least one negative payment
      }
    },
    {
      $unwind: "$latestNegativePayment"
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedUserId",
        foreignField: "_id",
        as: "assignedUser"
      }
    },
    {
      $unwind: {
        path: "$assignedUser",
        preserveNullAndEmptyArrays: true // In case a meter has no assigned user
      }
    },
    {
      $project: {
        _id: 0,
        meter: {
          _id: "$_id",
          name: "$name",
          meterId: "$meterId",
          status:"$status"
        },
        assignedUser: {
          _id: "$assignedUser._id",
          name: "$assignedUser.name",
          email: "$assignedUser.email",
          phone: "$assignedUser.phonenumber"
        },
        payment: "$latestNegativePayment"
      }
    }
  ]);

  return payments;
};



module.exports = {getPaymentsByMeterId, getNegativePaymentsByAdminId}




