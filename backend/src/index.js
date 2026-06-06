const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const rfqRoutes = require('./routes/rfq.routes');
const quotationRoutes = require('./routes/quotation.routes');
const approvalRoutes = require('./routes/approval.routes');
const poRoutes = require('./routes/po.routes');
const activityRoutes = require('./routes/activity.routes');
const reportRoutes = require('./routes/report.routes');
const usersRoutes = require('./routes/users.routes');
const authMiddleware = require('./middlewares/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/vendors', authMiddleware, vendorRoutes);
app.use('/api/rfqs', authMiddleware, rfqRoutes);
app.use('/api/quotations', authMiddleware, quotationRoutes);
app.use('/api/approvals', authMiddleware, approvalRoutes);
app.use('/api/pos', authMiddleware, poRoutes);
app.use('/api/activity', authMiddleware, activityRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/users', authMiddleware, usersRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
