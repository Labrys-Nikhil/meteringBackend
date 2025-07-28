const adminService = require("../service/adminDashboardService");


const getLatestDashboardStat = async (req, res) => {
    try {
        const { adminId } = req.params;

        if (!adminId) {
            return res.status(400).json({ success: false, message: "adminId is required" });
        }

        const data = await adminService.getLatestAdminDashboardStat(adminId);

        if (!data) {
            return res.status(404).json({ success: false, message: "No dashboard data found" });
        }

        return res.json({
            success: true,
            data,
            message: "Latest admin dashboard stat fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching admin dashboard stat:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const fetchAdminDailyConsumption = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { from, to } = req.query;

        // Validation
        if (!adminId) {
            return res.status(400).json({ success: false, message: "adminId required" });
        }

        const data = await adminService.getAdminConsumptionByDate(adminId, from, to);

        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};



const getUserDataByAdminId = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { startDate, endDate } = req.query;

        const data = await adminService.getUserDataByAdminId(adminId, startDate, endDate);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching user data by adminId:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const getMeterDataByAdminId = async (req, res) => {
    try {
        const { adminId } = req.params;
        const data = await adminService.getMeterDataByAdminId(adminId);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching meter data by adminId:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}; 
const addAdminDashboardStats = async (req, res) => {
  try {
    const adminData = await adminService.addAdminDashboardStat(); 
    res.status(200).json({ data: adminData, message: "Admin dashboard stats updated successfully" });
  } catch (error) {
    console.error("Error updating dashboard stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
    getLatestDashboardStat,
    fetchAdminDailyConsumption,
    getUserDataByAdminId,
    getMeterDataByAdminId,
    addAdminDashboardStats
};