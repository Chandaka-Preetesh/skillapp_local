import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';
import passport from 'passport';


import googleauthRoutes from "./routes/googleauthRoutes.js"
import emailauthRoutes from "./routes/emailauthRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import marketplaceRoutes from "./routes/marketplaceRoutes.js"
import doubtPlaceRoutes from "./routes/doubplaceRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"

import { idatabase } from "./config/idb.js";
import { configurePassport } from "./controlers/googleauthController.js";

import {verifyAuth} from "./controlers/verifyAuth.js";

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//To get environamental varibiles from .env i
dotenv.config({ path: join(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

//adding security middleware 
app.use(helmet());
//log https request
app.use(morgan("dev")); 

//cors allows frontend and backend to communicate
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//Intialising session 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

//passport releated middlewares are been added to app 
app.use(passport.initialize());
app.use(passport.session());

// Configure passport strategies
configurePassport();

app.get("/",(req,res)=>{
    res.send("hello from backend");
});

// Routes related to google autentication
app.use("/api/googleauth",googleauthRoutes);

//email related login and register
app.use("/api/emailauth",emailauthRoutes);


//to use for a particular use related data 
app.use("/api/me",userRoutes);

//market page   routes

app.use("/api/marketplace",marketplaceRoutes);

//doubts page  routes

app.use("/api/doubtplace",doubtPlaceRoutes);

//profilepage routes

app.use("/api/profileplace",profileRoutes);


// Verify token endpoint
app.get('/api/auth/verify',verifyAuth);





//Routes handles with appropriate retured responses
app.get('/auth/user', (req, res) => {
  res.json(req.user || null);
});



app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  });
});

 
idatabase();

app.listen(PORT,()=>{
    console.log("server running on port "+PORT);
});