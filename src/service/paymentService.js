const Payment = require("../model/Payment");
const Meter = require("../model/Meter")

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

module.exports = {getPaymentsByMeterId}