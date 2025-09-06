const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/dbConfig');
const mainRoutes = require('./src/routes/index');
const { scheduleMidnightJob } = require('./src/jobs/scheduleMidnightJob');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
// scheduleMidnightJob();

app.use('/api/v1', mainRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
