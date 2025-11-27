import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js'
import { addToCart, removeAllfromCart, updateQuantity, getCartProducts } from '../controllers/cartController.js'

const router = express.Router()

router.post("/", protectRoute, addToCart )
router.delete("/", protectRoute, removeAllfromCart)
router.put("/:id", protectRoute, updateQuantity)
router.get("/", protectRoute, getCartProducts)

export default router