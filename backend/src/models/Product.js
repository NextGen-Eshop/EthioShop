import mongoose from "mongoose";

//
// 1. DEFINE REVIEW SCHEMA FIRST
//
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true , maxlength: 1000 },
  },
  { timestamps: true }
);


// 2. PRODUCT SCHEMA

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    category: { type: String, required: true, index: true },

    description: { type: String, required: true, maxlength: 2000 },

    price: { type: Number, required: true, min: 0 },

    originalPrice: { type: Number,  default: 0, min: 0 },

    countInStock: { type: Number, required: true, default: 0, min: 0 },

    imageUrl: { type: String, required: true },

    // UPDATED
    rating: { type: Number, default: 0, min: 0, max: 5 },

    reviewsCount: { type: Number, default: 0 },

    reviews: [reviewSchema], 

    salesCount: { type: Number, default: 0 },

    isSuperDeal: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({
  name: "text",
  description: "text",
  category: "text",
});

productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

 //ENSURE VIRTUALS SHOW IN JSON
 
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

export default Product;