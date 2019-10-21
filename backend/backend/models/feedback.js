/**
 * 
 * Copyright HackerBay, Inc. 
 * 
 */

var mongoose = require('../config/db');

var Schema = mongoose.Schema;
var feedbackSchema = new Schema({
    projectId: { type: String, ref: 'Project' },
    createdById: { type: String, ref: 'User' },
    message: String,
    page: String,
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    deletedAt: {
        type: Date
    },

    deletedById: { type: String, ref: 'User' },
});
module.exports = mongoose.model('Feedback', feedbackSchema);