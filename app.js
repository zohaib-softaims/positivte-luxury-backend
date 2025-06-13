import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./utils/swagger.config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import userAuthRoutes from "./features/Authentication/routes.js";
import industryEquipmentRoutes from "./features/IndustryEquipment/routes.js";
import questionsRoutes from "./features/questions-management/routes.js";
import chatbotRoutes from "./features/Chatbot/routes.js";
import statsRoutes from "./features/Stats/routes.js";
import productRoutes from "./features/Products/routes.js";
import trainingAiSnippetsRoutes from "./features/TrainingAiSnippets/routes.js";
import connectDB from "./utils/dbConnection.js";

configDotenv();
connectDB();

export const app = express();
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome route
 *     description: Returns a welcome message
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server is running successfully!"
 */
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

app.use("/api/v0", userAuthRoutes);
app.use("/api/v0/industry-equipment", industryEquipmentRoutes);
app.use("/api/v0/questions", questionsRoutes);
app.use("/api/v0/chatbot", chatbotRoutes);
app.use("/api/v0/stats", statsRoutes);
app.use("/api/v0/products", productRoutes);
app.use("/api/v0/train-ai", trainingAiSnippetsRoutes);

app.use(errorHandler);
