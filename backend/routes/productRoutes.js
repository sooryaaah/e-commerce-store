import express from "express";
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getRecommendedProducts, toggleFeaturedProduct, getProductsByCategory } from "../controllers/productController.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/uploadToCloudinary.js";

const router = express.Router();

router.get("/",protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts)
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts)
router.post("/", protectRoute, adminRoute,upload.single("image"), createProduct)
router.delete("/:id", protectRoute, adminRoute, deleteProduct)
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct)

export default router