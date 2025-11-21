const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  // Review categories
  categories: {
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  // Review status
  isVerified: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ task: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewedUser: 1 });
reviewSchema.index({ rating: -1 });

// Ensure one review per task per reviewer
reviewSchema.index({ task: 1, reviewer: 1 }, { unique: true });

// Method to calculate average rating
reviewSchema.methods.getAverageRating = function() {
  const categories = Object.values(this.categories);
  return categories.reduce((sum, rating) => sum + rating, 0) / categories.length;
};

// Static method to get average rating for a user
reviewSchema.statics.getAverageRatingForUser = async function(userId) {
  const reviews = await this.find({ reviewedUser: userId, isVerified: true });
  
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

// Static method to get review statistics for a user
reviewSchema.statics.getReviewStats = async function(userId) {
  const reviews = await this.find({ reviewedUser: userId, isVerified: true });
  
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {
        professionalism: 0,
        quality: 0,
        punctuality: 0,
        communication: 0
      }
    };
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const categoryTotals = {
    professionalism: 0,
    quality: 0,
    punctuality: 0,
    communication: 0
  };

  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
    Object.keys(categoryTotals).forEach(category => {
      categoryTotals[category] += review.categories[category];
    });
  });

  const categoryAverages = {};
  Object.keys(categoryTotals).forEach(category => {
    categoryAverages[category] = categoryTotals[category] / reviews.length;
  });

  return {
    totalReviews: reviews.length,
    averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    ratingDistribution,
    categoryAverages
  };
};

module.exports = mongoose.model('Review', reviewSchema);
