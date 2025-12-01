import pool from "../config/db/db_config.js";

export const UserModel = {
  /**
   * Register User
   */
  async registerUser(data) {
    // ---------------------
    // REQUIRED FIELDS
    // ---------------------
    const required = [
      "name",
      "email",
      "password",
      "age",
      "DOB",
      "user_cast",
      "father_mobile",
      "mobile",
      "native_place",
      "current_place",
      "address",
      "occupation",
      "education",
    ];

    for (const field of required) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }


    if (typeof data.name !== "string" || data.name.length > 100)
      throw new Error("Invalid name");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) throw new Error("Invalid email");

    if (data.password.length < 6)
      throw new Error("Password must be at least 6 characters");

    if (isNaN(Number(data.age))) throw new Error("Age must be a number");

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.mobile))
      throw new Error("Invalid mobile number");

    if (!phoneRegex.test(data.father_mobile))
      throw new Error("Invalid father mobile number");

    if (typeof data.marital_status !== "boolean")
      throw new Error("marital_status must be boolean");

    // ---------------------
    // INSERT FIELDS
    // ---------------------
    const allowedColumns = [
      "name",
      "email",
      "password",
      "age",
      "DOB",
      "user_cast",
      "father_mobile",
      "mobile",
      "native_place",
      "current_place",
      "address",
      "marital_status",
      "occupation",
      "education",
    ];

    const columns = Object.keys(data).filter((c) =>
      allowedColumns.includes(c)
    );
    const values = columns.map((c) => data[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO users (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find User by Email
   */
  async findByEmail(email) {
    if (!email) throw new Error("Email is required");

    const query = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },
 async findByNumber(number) {
    if (!number) throw new Error("number is required");

    const query = `SELECT * FROM users WHERE mobile = $1 LIMIT 1`;
    const result = await pool.query(query, [number]);
    return result.rows[0];
  },
  /**
   * Find User by ID
   */
  async findById(user_id) {
    if (!user_id) throw new Error("User ID is required");

    const query = `SELECT * FROM users WHERE user_id = $1 LIMIT 1`;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  },

  /**
   * Get All Users
   */
async getAllUsers() {
  const query = `
    SELECT 
    user_id,
    name,
email,
age,
DOB,
user_cast,
father_mobile,
mobile,
native_place,
current_place,
address,
marital_status,
occupation,
education,
created_at,
updated_at
    FROM users
    ORDER BY user_id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
}
,

  /**
   * Update User (Dynamic updates)
   */
  async updateUser(user_id, data) {
    if (!user_id) throw new Error("User ID is required");
    if (!data || Object.keys(data).length === 0)
      throw new Error("No fields to update");

    const allowedFields = [
      "name",
      "email",
      "age",
      "DOB",
      "user_cast",
      "father_mobile",
      "mobile",
      "native_place",
      "current_place",
      "address",
      "marital_status",
      "occupation",
      "education",
    ];

    // Filter only allowed fields
    const fields = Object.keys(data).filter((f) =>
      allowedFields.includes(f)
    );

    if (fields.length === 0)
      throw new Error("No valid fields provided for update");

    // Set updated_at automatically
    data.updated_at = new Date();
    fields.push("updated_at");

    const setQuery = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = fields.map((f) => data[f]);

    const query = `
      UPDATE users 
      SET ${setQuery}
      WHERE user_id = $${fields.length + 1}
      RETURNING *;
    `;

    values.push(user_id);

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Delete User
   */
  async deleteUser(user_id) {
    if (!user_id) throw new Error("User ID is required");

    const query = `DELETE FROM users WHERE user_id = $1 RETURNING *`;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  },
};
