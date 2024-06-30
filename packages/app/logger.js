import winston from "winston";

/**
 * A logger utility class wrapping the winston logging library.
 * Configures file and console transports, and provides simplified logging methods.
 *
 * @example
 * const log = new Logger();
 * log.info('This is an info message');
 */
export default class Logger {
  /**
   * A logger utility class wrapping the winston logging library.
   * Configures file and console transports, and provides simplified logging methods.
   *
   * @example
   * const log = new Logger();
   * log.info('This is an info message');
   */
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        // - Write all logs error (and below) to `error.log`.
        new winston.transports.File({ filename: "error.log", level: "error" }),
        // - Write to all logs with specified level and below to `combined.log`
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });

    // If we're not in production environment, also log to console
    if (process.env.NODE_ENV !== "production") {
      // Add a console transport
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        })
      );
    }
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - The message to log at info level.
   */
  info(message) {
    this.logger.info(message);
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - The message to log at warn level.
   */
  warn(message) {
    this.logger.warn(message);
  }

  /**
   * Logs an error message.
   *
   * @param {string} message - The message to log at error level.
   */
  error(message) {
    this.logger.error(message);
  }
}