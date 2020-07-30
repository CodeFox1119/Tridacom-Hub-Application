var _ = require('lodash');
var mongoose = require('mongoose');

var COLLECTION = 'tickettypes';

// Needed for Population
require('./ticketpriority');

/**
 * TicketType Schema
 * @module models/tickettype
 * @class TicketType

 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {String} name ```Required``` ```unique``` Name of Ticket Type
 */
var ticketTypeSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  priorities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'priorities' }],
});

var autoPopulatePriorities = function (next) {
  this.populate('priorities');
  return next();
};

ticketTypeSchema.pre('find', autoPopulatePriorities);
ticketTypeSchema.pre('findOne', autoPopulatePriorities);

ticketTypeSchema.pre('save', function (next) {
  this.name = this.name.trim();

  return next();
});

/**
 * Return all Ticket Types
 *
 * @memberof TicketType
 * @static
 * @method getTypes
 *
 * @param {QueryCallback} callback MongoDB Query Callback
 */
ticketTypeSchema.statics.getTypes = function (callback) {
  var q = this.model(COLLECTION).find({});

  return q.exec(callback);
};

/**
 * Return Single Ticket Types
 *
 * @memberof TicketType
 * @static
 * @method getType
 *
 * @param {String} id Object Id of ticket type
 * @param {QueryCallback} callback MongoDB Query Callback
 */
ticketTypeSchema.statics.getType = function (id, callback) {
  var q = this.model(COLLECTION).findOne({ _id: id });

  return q.exec(callback);
};

/**
 * Return Single Ticket Type based on given type name
 *
 * @memberof TicketType
 * @static
 * @method getTypeByName
 *
 * @param {String} name Name of Ticket Type to search for
 * @param {QueryCallback} callback MongoDB Query Callback
 */
ticketTypeSchema.statics.getTypeByName = function (name, callback) {
  var q = this.model(COLLECTION).findOne({ name: name });

  return q.exec(callback);
};

ticketTypeSchema.methods.addPriority = function (priorityId, callback) {
  if (!priorityId) return callback({ message: 'Invalid Priority Id' });

  var self = this;

  if (!_.isArray(self.priorities)) {
    self.priorities = [];
  }

  self.priorities.push(priorityId);

  return callback(null, self);
};

ticketTypeSchema.methods.removePriority = function (priorityId, callback) {
  if (!priorityId) return callback({ message: 'Invalid Priority Id' });

  var self = this;

  self.priorities = _.reject(self.priorities, function (p) {
    return p._id.toString() === priorityId.toString();
  });

  return callback(null, self);
};

module.exports = mongoose.model(COLLECTION, ticketTypeSchema);
