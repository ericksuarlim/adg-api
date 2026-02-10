import express from 'express';
const router = express.Router();

router.use('/attendances', require('./attendance.routes'));
// router.use('/users', require('./user.routes'));
// ...

module.exports = router;
