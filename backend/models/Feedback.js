const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500,
    trim: true
  },
  completionDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Ensure one feedback per task
feedbackSchema.index({ task: 1 }, { unique: true });

// Index for querying service provider ratings
feedbackSchema.index({ serviceProvider: 1, rating: 1 });

// Virtual for calculating average rating
feedbackSchema.statics.calculateProviderAverage = async function(serviceProviderId) {
  const result = await this.aggregate([
    { $match: { serviceProvider: new mongoose.Types.ObjectId(serviceProviderId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
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
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].ratingBreakdown.forEach(rating => {
    breakdown[rating] = (breakdown[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 100) / 100, // Round to 2 decimals
    totalReviews: result[0].totalReviews,
    ratingBreakdown: breakdown
  };
};

module.exports = mongoose.model('Feedback', feedbackSchema);