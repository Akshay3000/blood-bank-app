const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

// create inventory
const createInventoryController = async (req, res) => {
    try {
        const { email } = req.body;
        //validation
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error('User Not Found');
        }
        // if (inventoryType === "in" && user.role !== 'donor') {
        //     throw new Error('Not a donor account')
        // }
        // if (inventoryType === "out" && user.role !== 'hospital') {
        //     throw new Error('Not a hospital')
        // }
        if (req.body.inventoryType == 'out') {
            const requestedBloodGroup = req.body.bloodGroup;
            const requestedQuantityOfBlood = req.body.quantity;
            const organisation = new mongoose.Types.ObjectId(req.body.userId);


            // Calculate blood quantity(we use aggregate function to calculate)
            const totalInOfRequestedBlood = await inventoryModel.aggregate([
                {
                    $match: {
                        organisation,
                        inventoryType: 'in',
                        bloodGroup: requestedBloodGroup,
                    }
                }, {
                    $group: {
                        _id: '$bloodGroup',
                        total: { $sum: '$quantity' }
                    },
                },
            ]);
            // console.log('Total IN', totalInOfRequestedBlood);
            const totalIn = totalInOfRequestedBlood[0]?.total || 0;

            // total OUT Blood Quantity
            const totalOutOfRequestedBloodGroups = await inventoryModel.aggregate([
                {
                    $match: {
                        organisation,
                        inventoryType: 'out',
                        bloodGroup: requestedBloodGroup,
                    }
                },
                {
                    $group: {
                        _id: '$bloodGroup',
                        total: { $sum: '$quantity' }
                    }
                }
            ])
            const totalOut = totalOutOfRequestedBloodGroups[0]?.total || 0;

            // IN & OUT calculation
            const availableQuantityOfBloodGroup = totalIn - totalOut;

            // quantity validation
            if (availableQuantityOfBloodGroup < requestedQuantityOfBlood) {
                return res.status(500).send({
                    success: false,
                    message: `Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`
                })
            }
            req.body.hospital = user?._id;




        } else {
            req.body.donor = user?._id;
        }

        // save record
        const inventory = new inventoryModel(req.body);
        await inventory.save();
        return res.status(201).send({
            success: true,
            message: 'New blood record added',
        });


    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in create inventory API',
            error,
        });

    }
}

// GET ALL BLOOD RECORDS
const getInventoryController = async (req, res) => {
    try {
        const inventory = await inventoryModel
            .find({
                organisation: req.body.userId,
            })
            .populate("donor")
            .populate("hospital")
            .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            messaage: "get all records successfully",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get All Inventory",
            error,
        });
    }
};


// GET HOSPITAL BLOOD RECORS
const getInventoryHospitalController = async (req, res) => {
    try {
        const inventory = await inventoryModel
            .find(req.body.filters)
            .populate("donor")
            .populate("hospital")
            .populate("organisation")
            .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            messaage: "get hospital consumer records successfully",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Consumer Inventory",
            error,
        });
    }
};

// GET BLOOD RECORDS OF 3
const getRecentInventoryController = async (req, res) => {
    try {
        const inventory = await inventoryModel.find({
            organisation: req.body.userId
        }).limit(3).sort({ createdAt: -1 })
        return res.status(200).send({
            success: true,
            message: 'Recent Inventory Data',
            inventory,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Recent Inventory API',
            error,
        })
    }
};

// get donor record
const getDonorsController = async (req, res) => {
    try {
        const organisation = req.body.userId

        // find donor
        const donorId = await inventoryModel.distinct("donor", {
            organisation,
        });
        // console.log(donorId);
        const donors = await userModel.find({ _id: { $in: donorId } })

        return res.status(200).send({
            success: true,
            message: 'Donor Record Fetched Successfully',
            donors,
        })


    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in donor Records',
            error
        })
    }
};


// get hospital records
const getHospitalController = async (req, res) => {
    try {
        const organisation = req.body.userId;

        // Get Hospital ID
        const hospitalId = await inventoryModel.distinct('hospital', { organisation })

        // find hospital
        const hospitals = await userModel.find({
            _id: { $in: hospitalId }
        })
        return res.status(200).send({
            success: true,
            message: 'Hospital data fetched successfully',
            hospitals,

        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            messgae: 'Error in get hospital API',
            error
        })
    }

};

// GET ORG PROFILES
const getOrganisationController = async (req, res) => {
    try {
        const donor = req.body.userId;
        const orgId = await inventoryModel.distinct('organisation', { donor });


        // FIND ORG
        const organisations = await userModel.find({
            _id: { $in: orgId },
        });
        return res.status(200).send({
            success: true,
            message: 'Org Data Fetched Successfully',
            organisations
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in ORG API',
            error
        })
    }
};

// GET ORG FOR HOSPITAL
const getOrganisationForHospitalController = async (req, res) => {
    try {
        const hospital = req.body.userId;
        const orgId = await inventoryModel.distinct('organisation', { hospital });


        // FIND ORG
        const organisations = await userModel.find({
            _id: { $in: orgId },
        });
        return res.status(200).send({
            success: true,
            message: 'Hospital Org Data Fetched Successfully',
            organisations
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Hospital ORG API',
            error
        });
    }

};




module.exports = { createInventoryController, getInventoryController, getDonorsController, getHospitalController, getOrganisationController, getOrganisationForHospitalController, getInventoryHospitalController, getRecentInventoryController };