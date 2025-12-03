import Product from "../db/model/Products.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    return res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("error in addToCart controller", error.message);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const removeAllfromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "product removed successfuly fron cart" });
  } catch (error) {
    console.log("error in removeAllfromCart controller", error.message);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(item => item.id === id)

    if(existingItem){
        if(quantity === 0){
            user.cartItems.filter(item => item.id !== id)
            await user.save()
            return res.status(200).json(user.cartItems)
        }

        existingItem.quantity = quantity;
        await user.save()
        return res.status(200).json(user.cartItems)
    }else {
        return res.status(404).json({message:"item not found in cart"})
    }
  } catch (error) {
    console.log("error in updateQuantity controller", error.message);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getCartProducts = async (req, res) =>{
    try {
        const products = await Product.find({_id: { $in: req.user.cartItems}})

        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id.toString() === product._id.toString())
            
            return {...product.toJSON() , quantity:item.quantity}
        })
        return res.json(cartItems)
    } catch (error) {
        console.log("error in getCartProducts controller", error.message);
        return res.status(500).json({message:"server error", error:error.message})
    }
}
