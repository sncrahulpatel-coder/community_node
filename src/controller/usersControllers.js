import apiResponse from "../utils/apiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

export const userRegister = async (req, res, next) => {
  try {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json(apiResponse(false, "Name, email, and password are required", [], req.rrn));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await AdminModel.findByEmail(email);
    if (existingAdmin) {
      return res.status(409).json(apiResponse(false, "Admin with this email already exists", [], req.rrn));
    }

    await AdminModel.registerAdmin({ name, email, password: hashedPassword });

    return res.json(apiResponse(true, "Admin Registered", [], req.rrn));

  } catch (err) {
    next(err);
  }
}

export const userLogin = async (req, res, next) => {
  try {
    const { number, password } = req.body;
    if (!number || !password) {
      return res
        .status(400)
        .json(apiResponse(false, "number and password are required", [], req.rrn));
    }

    const user = await UserModel.findByNumber(number);
    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, "Invalid Number or password", [], req.rrn));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(404)
        .json(apiResponse(false, "Invalid Number or password", [], req.rrn));
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, role: "user", email: user.email }, // payload
      process.env.JWT_SECRET, // secret key
      { expiresIn: process.env.JWT_EXPIRES_IN } // expiry time
    );

    // ✅ Send response with token
    return res.json(
      apiResponse(
        true,
        "Login successful",
        {
          name: user.name,
          email: user.email,
          number: user.number,
          token, // attach token
          role: 'user'
        },
        req.rrn
      )
    );
  } catch (err) {
    next(err);
  }
};

