import Product from "../models/Product.js";
import mongoose from "mongoose";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      isSuperDeal,
      sort,
    } = req.query;

    const filters = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filters.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (minPrice != null || maxPrice != null) {
      filters.price = {};

      if (minPrice != null && !Number.isNaN(Number(minPrice))) {
        filters.price.$gte = Number(minPrice);
      }

      if (maxPrice != null && !Number.isNaN(Number(maxPrice))) {
        filters.price.$lte = Number(maxPrice);
      }

      if (Object.keys(filters.price).length === 0) {
        delete filters.price;
      }
    }

    if (isSuperDeal != null) {
      filters.isSuperDeal = String(isSuperDeal).toLowerCase() === "true";
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };

    const products = await Product.find(filters).sort(
      sortOptions[sort] || { createdAt: -1 }
    );

    res.status(200).json({
      success: true,
      count: products.length,
      filters: {
        search: search || null,
        category: category || null,
        minPrice: minPrice ?? null,
        maxPrice: maxPrice ?? null,
        isSuperDeal: isSuperDeal ?? null,
        sort: sort || "newest",
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET one product
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      originalPrice,
      stock,
      imageUrl,
      rating,
      reviewsCount,
      salesCount,
      isSuperDeal,
    } = req.body;

    if (!name || !category || !description || price == null || stock == null || !imageUrl) {
      return res.status(400).json({
        message:
          "name, category, description, price, stock, and imageUrl are required",
      });
    }

    const product = new Product({
      name,
      category,
      description,
      price,
      originalPrice,
      stock,
      imageUrl,
      rating,
      reviewsCount,
      salesCount,
      isSuperDeal,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name ?? product.name;
    product.category = req.body.category ?? product.category;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.originalPrice = req.body.originalPrice ?? product.originalPrice;
    product.stock = req.body.stock ?? product.stock;
    product.imageUrl = req.body.imageUrl ?? product.imageUrl;
    product.rating = req.body.rating ?? product.rating;
    product.reviewsCount = req.body.reviewsCount ?? product.reviewsCount;
    product.salesCount = req.body.salesCount ?? product.salesCount;
    product.isSuperDeal = req.body.isSuperDeal ?? product.isSuperDeal;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
