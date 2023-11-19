import express from "express";
import healthRoutes from "./routes/healthRoutes";
import errorHandler from './middleware/errorHanlder';
const app = express();

app.use(express.json());

const v1Path: string = "/api/v1/chunker";

app.use(v1Path, healthRoutes);

app.use(errorHandler);
export default app;