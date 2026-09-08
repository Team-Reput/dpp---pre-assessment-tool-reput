const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db'); // keeps db connection test running
const contactRoutes = require('./routes/assessment-contact');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/assessment-contact', contactRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const identificationRoutes = require('./routes/identification');
app.use('/api/identification', identificationRoutes);

const materialCompRoutes = require('./routes/material-comp');
app.use('/api/material-comp', materialCompRoutes);

const materialOriginRoutes = require('./routes/material-origin');
const supplyChainRoutes = require('./routes/supply-chain');
const traceabilityRoutes = require('./routes/traceability');
const sustainabilityRoutes = require('./routes/sustainability');
const complianceRoutes = require('./routes/compliance');
const socialLaborRoutes = require('./routes/social-labor');

app.use('/api/material-origin', materialOriginRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/social-labor', socialLaborRoutes);

const extendedDataRoutes = require('./routes/extended-data');
app.use('/api/extended-data', extendedDataRoutes);
const structureRoutes = require('./routes/structure');
app.use('/api/structure', structureRoutes);

const scoreRoutes = require('./routes/score');
app.use('/api/score', scoreRoutes);

const emailReportRoutes = require('./routes/email-report');
app.use('/api/email-report', emailReportRoutes);