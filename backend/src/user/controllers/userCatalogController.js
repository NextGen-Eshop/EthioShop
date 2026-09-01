import Product from "../../models/Product.js";
import mongoose from "mongoose";

// GET public products catalog
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, isFeatured, isSuperDeal } = req.query;
    const pageNumber = Number(req.query.page) || 1;
    const limitNumber = Number(req.query.limit) || 100;

    let query = { isActive: true };

    if (keyword && keyword.trim()) {
      query.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
        { category: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (isSuperDeal === 'true') {
      query.isSuperDeal = true;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET related products for a product
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find products in the same category excluding the current product
    let related = await Product.find({
      _id: { $ne: id },
      category: currentProduct.category,
      isActive: true,
    }).limit(6);

    // If not enough in category, fill with other featured products
    if (related.length < 4) {
      const more = await Product.find({
        _id: { $nin: [id, ...related.map((p) => p._id)] },
        isActive: true,
      }).limit(6 - related.length);
      related = [...related, ...more];
    }

    res.status(200).json({
      success: true,
      count: related.length,
      data: related,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET product reviews
export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("reviews");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      count: product.reviews.length,
      data: product.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE product review (User only)
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user?.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = {
      user: req.user.id,
      name: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Customer",
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.reviewsCount = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
