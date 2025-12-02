import cloudinary from "../db/cloudinary.js";
import Product from "../db/model/Products.js";
import { redis } from "../db/redis.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json({
      message: "products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.log("error in get all products controller");
    return res.status(500).json({
      success: false,
      message: "Server error: ",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(400).json({ message: "no featured products found" });
    }
    // store in redis for future access
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res.status(200).json(featuredProducts);
  } catch (error) {
    console.log("error in getFeaturedProducts");
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "all fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "image is required" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "image");

    const newProduct = await Product.create({
      name,
      description,
      price,
      image: {
        secure_url: result.secure_url,
        publicId: result.public_id,
      },
      category,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.log("error in createProduct :", error);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    if (product.image) {
      const publicId = product.image.publicId;
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.log("error in deleting image from cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    console.log("error in deleteProduct", error);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    return res.status(200).json(products);
  } catch (error) {
    console.log("error in getRecommendedProducts", error.message);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      return res.status(200).json(updatedProduct)
    }else{
      return res.status(404).json({message:"product not found"})
    }
  } catch (error) {
    console.log("error in toggleFeaturedProduct controller", error.message);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({isFeatured:true})
    await redis.set("featured_products", JSON.stringify(featuredProducts))
  } catch (error) {
    console.log("error in updateFeaturedProductsCache controller :", error.message);
    
  }
}