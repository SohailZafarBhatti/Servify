const mongoose = require('mongoose');

const serviceProviderFeedbackSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The service provider giving feedback
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The customer being rated
    required: true
  },
  // Overall rating for the task experience
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Specific rating categories
  workSatisfaction: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  payment: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Written feedback
  feedback: {
    type: String,
    maxlength: 500,
    trim: true
  },
  // Task completion date
  completionDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one feedback per task per service provider
serviceProviderFeedbackSchema.index({ task: 1, serviceProvider: 1 }, { unique: true });

// Index for querying customer ratings from service providers
serviceProviderFeedbackSchema.index({ customer: 1, rating: 1 });

// Static method to calculate customer's average rating from service providers
serviceProviderFeedbackSchema.statics.calculateCustomerAverage = async function(customerId) {
  const result = await this.aggregate([
    { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        averageWorkSatisfaction: { $avg: '$workSatisfaction' },
        averageCommunication: { $avg: '$communication' },
        averagePayment: { $avg: '$payment' },
        totalReviews: { $sum: 1 },
        ratingBreakdown: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      averageWorkSatisfaction: 0,
      averageCommunication: 0,
      averagePayment: 0,
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].ratingBreakdown.forEach(rating => {
    breakdown[rating] = (breakdown[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 100) / 100,
    averageWorkSatisfaction: Math.round(result[0].averageWorkSatisfaction * 100) / 100,
    averageCommunication: Math.round(result[0].averageCommunication * 100) / 100,
    averagePayment: Math.round(result[0].averagePayment * 100) / 100,
    totalReviews: result[0].totalReviews,
    ratingBreakdown: breakdown
  };
};

// Static method to get recent feedback for a customer
serviceProviderFeedbackSchema.statics.getCustomerRecentFeedback = async function(customerId, limit = 10) {
  return this.find({ customer: customerId })
    .populate('serviceProvider', 'name avatar')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('ServiceProviderFeedback', serviceProviderFeedbackSchema);