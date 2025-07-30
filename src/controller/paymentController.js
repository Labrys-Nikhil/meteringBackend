const paymentService = require('../service/paymentService');

const getPaymentsForMeterId = async (req, res) => {
  try {
    const { meterId } = req.params;
    const { startTime, endTime } = req.query;

    const payments = await paymentService.getPaymentsByMeterId(meterId, startTime, endTime);

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error in getPaymentsForMeterId:", error.message);
    res.status(error.message === "Meter not found" ? 404 : 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {getPaymentsForMeterId}