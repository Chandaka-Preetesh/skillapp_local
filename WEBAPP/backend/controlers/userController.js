import jwt from "jsonwebtoken";
import { getUserById } from "../config/loginAndRegisterQueries.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRecentActivity } from "../config/recentActivityQueries.js";

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Reusable function to extract user from request using JWT token
export const getUserDetailsFromReq = async (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await getUserById(decoded.userid);
    if (!user) {
      throw new Error("User not found");
    }

    return user; // Return user data for reuse
  } catch (error) {
    console.error("Token verification error:", error.message);
    throw error;
  }
};


//Route function to return recent user activity
export const recentActivity = async (req, res) => {
  try {
    const user = await getUserDetailsFromReq(req);
    const recent = await getRecentActivity(user.userid);
    res.json({ recentActivity: recent });
  } catch (error) {
    console.error("Error while fetching recent activity:", error.message);
    res.status(401).json({ error: error.message });
  }
};
