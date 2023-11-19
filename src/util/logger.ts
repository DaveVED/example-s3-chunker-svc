import winston, { format, transports } from "winston";

export const logger: winston.Logger = winston.createLogger({
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: {
    service: "chunker-svc",
  },
  transports: [new transports.Console({})],
});
