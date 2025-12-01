import apiResponse from "../utils/apiResponse.js";
import { AdminModel } from '../models/adminModel.js'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

export const registerAdmin = async (req, res, next) => {
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
// Simple regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;

export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      mobile,
      age,
      DOB,
      marital_status,
      address,
      occupation,
      education,
      cast,
      Father_Number,
      current_place,
      native_place,
    } = req.body;

    // Required fields check
    const requiredFields = {
      name,
      email,
      mobile,
      age,
      DOB,
      address,
      occupation,
      education,
      cast,
      Father_Number,
      current_place,
      native_place,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === "") {
        return res
          .status(400)
          .json(apiResponse(false, `Field '${field}' is required`, [], req.rrn));
      }
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json(apiResponse(false, "Invalid email format", [], req.rrn));
    }

    // Mobile validation
    if (!mobileRegex.test(mobile)) {
      return res
        .status(400)
        .json(apiResponse(false, "Mobile number must be 10 digits", [], req.rrn));
    }

    // Father's number validation
    if (!mobileRegex.test(Father_Number)) {
      return res
        .status(400)
        .json(apiResponse(false, "Father's number must be 10 digits", [], req.rrn));
    }

    // Age validation
    const ageNumber = Number(age);
    if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 120) {
      return res
        .status(400)
        .json(apiResponse(false, "Invalid age", [], req.rrn));
    }

    // DOB validation
    const onlyDate = new Date(DOB);
    if (isNaN(onlyDate.getTime())) {
      return res
        .status(400)
        .json(apiResponse(false, "Invalid Date of Birth", [], req.rrn));
    }
    const dobDate = onlyDate.toISOString().split("T")[0];

    // Check if user already exists
    const existingUser = await UserModel.findByNumber(mobile);
    if (existingUser) {
      return res
        .status(409)
        .json(apiResponse(false, "User with this number already exists", [], req.rrn));
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(mobile + "@123", 10);

    // Register the user
    await UserModel.registerUser({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      age: ageNumber,
      DOB: dobDate,
      user_cast: cast.trim(),
      father_mobile: Father_Number.trim(),
      mobile: mobile.trim(),
      current_place: current_place.trim(),
      native_place: native_place.trim(),
      address: address.trim(),
      marital_status: marital_status,
      occupation: occupation.trim(),
      education: education.trim(),
    });

    return res.json(apiResponse(true, "User registered successfully", [], req.rrn));
  } catch (err) {
    next(err);
  }
};
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json(apiResponse(false, "Email and password are required", [], req.rrn));
    }

    const admin = await AdminModel.findByEmail(email);
    if (!admin) {
      return res
        .status(200)
        .json(apiResponse(false, "Invalid email or password", [], req.rrn));
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(200)
        .json(apiResponse(false, "Invalid email or password", [], req.rrn));
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: admin.id, role: "admin", email: admin.email }, // payload
      process.env.JWT_SECRET, // secret key
      { expiresIn: process.env.JWT_EXPIRES_IN } // expiry time
    );

    // ✅ Send response with token
    return res.json(
      apiResponse(
        true,
        "Login successful",
        {
          adminId: admin.id,
          name: admin.name,
          email: admin.email,
          token, // attach token
          role: 'admin'
        },
        req.rrn
      )
    );
  } catch (err) {
    next(err);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    // const students = await StudentModel.getAllStudents();
    return res.json(apiResponse(true, "Students fetched", {}, req.rrn));
  } catch (err) {
    next(err);
  }
};



export const usersList = async (req, res, next) => {
  try {

    const users = await UserModel.getAllUsers();

    return res.json(apiResponse(true, "Users List", { users }, req.rrn));

  } catch (err) {
    next(err);
  }
};


export const editUser = async (req, res, next) => {
  try {

    const user_id = req.params.id;

    const { name, email, mobile, cast, age, dob, marital_status, father_number, address, occupation, education, current_place, native_place } = req.body;

    // Required fields check
    const requiredFields = {
      name,
      email,
      mobile,
      age,
      dob,
      address,
      occupation,
      education,
      cast,
      father_number,
      current_place,
      native_place,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === "") {
        return res
          .status(400)
          .json(apiResponse(false, `Field '${field}' is required`, [], req.rrn));
      }
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json(apiResponse(false, "Invalid email format", [], req.rrn));
    }

    // Mobile validation
    if (!mobileRegex.test(mobile)) {
      return res
        .status(400)
        .json(apiResponse(false, "Mobile number must be 10 digits", [], req.rrn));
    }

    // Father's number validation
    if (!mobileRegex.test(father_number)) {
      return res
        .status(400)
        .json(apiResponse(false, "Father's number must be 10 digits", [], req.rrn));
    }

    // Age validation
    const ageNumber = Number(age);
    if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 120) {
      return res
        .status(400)
        .json(apiResponse(false, "Invalid age", [], req.rrn));
    }

    // dob validation
    const onlyDate = new Date(dob);
    if (isNaN(onlyDate.getTime())) {
      return res
        .status(400)
        .json(apiResponse(false, "Invalid Date of Birth", [], req.rrn));
    }
    const dobDate = onlyDate.toISOString().split("T")[0];

    await UserModel.updateUser(user_id, {
      name, email, age, DOB: dobDate, user_cast: cast, father_mobile: father_number, mobile, native_place, current_place, address, marital_status, occupation, education
    });

    return res.json(apiResponse(true, "Users updated", {}, req.rrn));

  } catch (err) {
    next(err);
  }
};




export const deleteUser = async (req, res, next) => {
  try {

    const user_id = req.params.id;

    await UserModel.deleteUser(user_id);


    return res.json(apiResponse(true, "Users Deleted", {}, req.rrn));

  } catch (err) {
    next(err);
  }
};
