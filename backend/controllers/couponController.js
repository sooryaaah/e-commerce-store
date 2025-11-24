import Coupon from "../db/model/coupon.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    return res.status(200).json(coupon || null);
  } catch (error) {
    console.log("error in getCoupon controller :", error.message);
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) =>{
    try {
        const {code} = req.body;
        const coupon = await Coupon.findOne({code:code, userId: req.user._id, isActive:true})

        if(!coupon){
            return res.status(400).json({message:"coupon not found"})
        }
        if(coupon.expirationDate < Date.now()){
          coupon.isActive = false;
          await coupon.save();
          return res.status(400).json({message:"coupon expired"})
        }
        return res.status(200).json({
          message:"coupon valid",
          code: coupon.code,
          discountPercentage: coupon.discountPercentage
        })
    } catch (error) {
        console.log("error in validateCoupon controller :", error.message);
        return
    }
}
