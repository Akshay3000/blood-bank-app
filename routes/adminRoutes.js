const express = require('express');
const authMiddelware = require('../middlewares/authMiddelware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { getDonorsListController, getHospitalListController, getOrgListController, deleteDonorController } = require('../controllers/adminController');


// ROUTES
const router = express.Router();

//GET || DONOR LIST
router.get('/donor-list', authMiddelware, adminMiddleware, getDonorsListController);

//GET || HOSPITAL LIST
router.get('/hospital-list', authMiddelware, adminMiddleware, getHospitalListController);

//GET || ORG LIST
router.get('/org-list', authMiddelware, adminMiddleware, getOrgListController);


// ===========
// delete donor || get
router.delete('/delete-donor/:id', authMiddelware, adminMiddleware, deleteDonorController)

//EXPORTS
module.exports = router;