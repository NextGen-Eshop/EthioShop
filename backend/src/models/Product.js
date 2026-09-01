import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

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
    originalPrice: { type: Number, default: 0, min: 0 },
    countInStock: { type: Number, required: true, default: 0, min: 0 },
    
    // Media
    image: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    images: [{ type: String }],
    
    // Short video/animation (approx <= 0.7s looping animation)
    shortVideoUrl: { type: String, default: "" },
    animationUrl: { type: String, default: "" },
    
    // Badges & deals
    badge: { type: String, default: "" }, // e.g. "Best Seller", "New Arrival", "20% OFF"
    isSuperDeal: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    
    // Ratings & Reviews
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // Product Specifications & Features
    features: [{ type: String }],
    specs: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],

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

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;