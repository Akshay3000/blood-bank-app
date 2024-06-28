const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    inventoryType: {
        type: String,
        require: [true, 'inventory type require'],
        enum: ["in", "out"]
    },
    bloodGroup: {
        type: String,
        require: [true, 'blood group is required'],
        enum: ['O+', 'O-', 'AB+', 'AB-', 'A+', 'A-', 'B+', 'B-']
    },
    quantity: {
        type: Number,
        required: [true, 'blood quantity is required'],
    },
    email: {
        type: String,
        required: [true, ' Email is Required'],
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'organisation is require']
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: function () {
            return this.inventoryType === "out"
        }
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: function () {
            return this.inventoryType === "in"
        },
    },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema)