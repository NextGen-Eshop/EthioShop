import Product from "../models/Product.js";
import mongoose from "mongoose";


//   GET ALL PRODUCTS (SEARCH + FILTER + PAGINATION)

export const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const pageNumber = Number(req.query.page) || 1;
    const limitNumber = Number(req.query.limit) || 10;

    let query = { isActive: true };

    // Search (text index)
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Filter
    if (category) {
      query.category = category;
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



//   GET SINGLE PRODUCT

export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//   CREATE PRODUCT (ADMIN ONLY)

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      imageUrl,
      countInStock,
      originalPrice,
    } = req.body;

    // Validation
    if (!name || !price || !description || !category || !imageUrl) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      imageUrl,
      countInStock: countInStock || 0,
      originalPrice: originalPrice || 0,
      createdBy: req.user.id,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      data: savedProduct,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE PRODUCT (ADMIN ONLY)
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatableFields = [
      "name",
      "price",
      "description",
      "category",
      "imageUrl",
      "countInStock",
      "originalPrice",
      "isSuperDeal",
      "isActive",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//   DELETE PRODUCT (SOFT DELETE)

export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//   CREATE REVIEW (USER ONLY)

export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prevent duplicate reviews
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this product",
      });
    }

    const review = {
      user: req.user.id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    // Update rating
    product.reviewsCount = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//   GET PRODUCT REVIEWS

export const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

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