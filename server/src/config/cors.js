const DEFAULT_ORIGINS = "http://localhost:3000,http://localhost:5173";

const allowedOrigins = (process.env.CORS_ORIGINS || DEFAULT_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

export default corsOptions;