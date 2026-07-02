const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleDetails: { type: String, default: 'Not specified' },
    isAvailable: { type: Boolean, default: false },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    lastLocationUpdate: { type: Date, default: Date.now },
    socketId: { type: String }
}, { timestamps: true });

driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
