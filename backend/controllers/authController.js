import User from "../db/model/User.js";
import jwt from "jsonwebtoken";
import { redis } from "../db/redis.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refreshToken:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); //expires in 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, //15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "user already exists" });
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "user created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user does not exist" });
    }

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);
      return res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "user logged in successfully",
      });
    } else {
      return res.status(400).json({ message: "invalid email or password" });
    }
  } catch (error) {
    console.log("error while logging in", error.message || error);
    return res
      .status(500)
      .json({ message: "error while logging in", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      console.log("decoded:", decoded);
      await redis.del(`refreshToken:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "user logged out successfully" });
  } catch (error) {
    console.log("error while logging out", error.message || error);
    return res
      .status(500)
      .json({ message: "error while logging out", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "refresh token not found",
      })
    }

    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await redis.get(`refreshToken:${decode.userId}`)

    if(refreshToken !== storedToken){
      return res.status(400).json({
        message: "invalid refresh token"
      })
    }

    const accessToken = jwt.sign({userId: decode.userId}, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m"
    })

    res.cookie("accessToken", accessToken, {
      httpOnly: true, 
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",          
      maxAge: 15 * 60 * 1000, //15 minutes
    })

    return res.status(200).json({
      message: "token refreshed successfully",
      
    })
  } catch (error) {
    console.log("error in refreshToken controller: ", error);
    return res.status(500).json({ error: error.message });
  }
};
