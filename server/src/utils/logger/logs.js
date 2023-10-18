import morgan from "morgan";
import winston from "winston";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config(path.join(path.resolve(), ".env"));

const { format } = winston;
const { combine, timestamp, colorize, printf } = format;

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const getLogLevel = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? "debug" : "warn";
};

// Use a relative path for the log file
const logDir = path.join(process.cwd(), "errorLogs"); // process.cwd() returns the current working directory
const loggerFile = path.join(logDir, "error.log");

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const logFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  colorize({ all: true }),
  printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const logger = winston.createLogger({
  // >= logLevel will be logged
  level: getLogLevel(),
  levels: logLevels,
  format: logFormat,
  transports: [new winston.transports.Console()],
});

// new winston.transports.File({
//       filename: loggerFile,
//       level: "error",
//     }),

export const morganMiddleware = morgan(
  ":method :url :status - :response-time ms",
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);

export default logger;
