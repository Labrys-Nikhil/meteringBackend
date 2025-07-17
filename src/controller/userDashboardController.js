const {getDashboardSummary,getChartData,getLatestReading } = require('../service/userDashboardService');


const init =  async (req, res) => {
  const { meterId, userId, range = "7d" } = req.query;

  try {
    const [summary, chartData, latestReading] = await Promise.all([
      getDashboardSummary(meterId, userId, range),
      getChartData(meterId, userId, range),
      getLatestReading(meterId, userId),
    ]);

    return res.json({
      summary,
      chartData,//30 days data
      latestReading,
    });
  } catch (error) {
    console.error("/api/dashboard/init error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


router.get("/chart", async (req, res) => {
  const { meterId, userId, range = "7d" } = req.query;

  try {
    const chartData = await getChartData(meterId, userId, range);
    return res.json(chartData);
  } catch (error) {
    console.error("/api/dashboard/chart error:", error);
    return res.status(500).json({ message: "Error fetching chart data" });
  }
});


router.get("/summary", async (req, res) => {
  const { meterId, userId, range = "7d" } = req.query;

  try {
    const summary = await getDashboardSummary(meterId, userId, range);
    return res.json(summary);
  } catch (error) {
    console.error("/api/dashboard/summary error:", error);
    return res.status(500).json({ message: "Error fetching summary" });
  }
});

//get the alets
router.get("/alerts", async (req, res) => {
  const { meterId, userId } = req.query;

  try {
    const alerts = await getAlerts(meterId, userId);
    return res.json(alerts);
  } catch (error) {
    console.error("/api/dashboard/alerts error:", error);
    return res.status(500).json({ message: "Error fetching alerts" });
  }
});

module.exports = {init,}