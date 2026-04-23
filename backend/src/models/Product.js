<<<<<<< HEAD
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
=======
import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number }, // For slashed pricing
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    isSuperDeal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
>>>>>>> 53413c49f1034c42c7b057a5fc8a3cc414ccd848
