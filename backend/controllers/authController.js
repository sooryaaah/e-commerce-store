import User from "../db/model/User.js";

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "user already exists" });
    }

    const user = await User.create({ name, email, password });

     return res.status(201).json({user, message: "user created successfully"});
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
};

export const login = async (req, res) => {
  try {
  } catch (error) {}
};

export const logout = async (req, res) => {
  try {
  } catch (error) {}
};
