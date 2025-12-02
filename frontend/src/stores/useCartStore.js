import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,

  getCartItems: async() =>{
    try {
        const res = await axios.get("/cart")
        set({cart:res.data})
        get().calculateTotals()
    } catch (error) {
        set({cart:[]})
        toast.error(error.response.data.message || "Something went wrong");
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", {productId:product._id});
      toast.success("Product added to cart");

      set(prevState => {
        const existingItem = prevState.cart.find(item => item._id === product._id)

        if(existingItem){
          return {
            cart: prevState.cart.map(item => item._id === product._id ? {...item, quantity: item.quantity + 1} : item)
          
          }
        }

        return{
          cart: [...prevState.cart, {...product, quantity: 1}]
        }
      })
      get().calculateTotals()
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong");
    }
  },

  calculateTotals: () => {
    const {cart, coupon} = get();
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = coupon ? subtotal - (subtotal * (coupon.discount / 100)) : subtotal;
    set({subtotal, total});
  }
}));
