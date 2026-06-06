const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const rfqRoutes = require('./routes/rfq.routes');
const quotationRoutes = require('./routes/quotation.routes');
const approvalRoutes = require('./routes/approval.routes');
const poRoutes = require('./routes/po.routes');
const authMiddleware = require('./middlewares/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vendors', authMiddleware, vendorRoutes);
app.use('/api/rfqs', authMiddleware, rfqRoutes);
app.use('/api/quotations', authMiddleware, quotationRoutes);
app.use('/api/approvals', authMiddleware, approvalRoutes);
app.use('/api/pos', authMiddleware, poRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
