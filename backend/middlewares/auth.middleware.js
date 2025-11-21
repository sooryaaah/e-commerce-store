import jwt from "jsonwebtoken";
import User from "../db/model/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "access token not found" });
    }

    try {
      const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decode.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "user not found" });
      }

      req.user = user;
      next();
    } catch (error) {
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({message: "UNAUTHORIZED - access token expired"})
        }
        throw error
    }
  } catch (error) {
    console.log("error in protectRoute :", error);
    return res.status(401).json({
      message: "invalid access token",
    });
  }
};

export const adminRoute = async (req, res, next) => {
    if(req.user && req.user.role === "admin"){
        next()
    }else {
        return res.status(403).json({message: "Access denied - admin only"})
    }
}
