import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";
import sequelize from "./config/db";
import { errorHandler } from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import favoriteRoutes from "./routes/favoritesRoutes"
import socialPlateformRoutes from "./routes/socialPlateformRoutes";
import galleryProfilesRoutes from "./routes/profileGalleryRoutes";
import adressessRoutes from "./routes/profileAddressRoutes";
import EmailsRoutes from "./routes/profileEmailRoutes";
import PhonesRoutes from "./routes/profilePhoneRoutes";
import CompaniesRoutes from "./routes/companyRoutes";
import socialLinksRoutes from "./routes/profileSocialLinkRoutes";
import path from "path";

import localisationRoutes from "./routes/profileLocalizationRoutes";


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:3000",  // dev
  "http://cartevv.com"      // prod
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling
app.use(errorHandler);


// Sequelize sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync all models
    await sequelize.sync();
    console.log("✅ All models were synchronized successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
})();
