const mongoose = require("mongoose")

const adSchema = mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    link: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    createdBy: { type: String, trim: true, default: '' }, // mentor email or id
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
})

adSchema.pre('save', function(next){ this.updatedAt = new Date(); next(); })

const AdSchema = mongoose.model('AdSchema', adSchema)

module.exports = AdSchema


