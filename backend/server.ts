import express from "express";
import dotenv from "dotenv";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", documentRoutes);
app.use("/api", chatRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
