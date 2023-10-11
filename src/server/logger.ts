import winston, { Logger, format } from "winston";
// @ts-expect-error They don't publish types, but we also don't need them just to pass to format
import { ecsFields, ecsStringify } from "@elastic/ecs-winston-format";
import fastRedact, { redactFn, RedactOptions } from "fast-redact";
import { ExpressContextFunctionArgument } from "@apollo/server/express4";

interface WinstonRedactFormatterOptions {
  /**
   * An array of strings describe the location of keys per
   * https://github.com/davidmarkclements/fast-redact#paths--array
   */
  paths: string[];
  /**
   * The replacement value, by default "[REDACTED]"
   * Tip: use `censor: undefined` to have matching paths replaced with
   * `undefined` which, if you use a JSON log output format, will result in
   * matching paths being *removed*.
   */
  censor?: string;
}
class WinstonRedactFormatter {
  private readonly redact: redactFn;

  constructor(options: WinstonRedactFormatterOptions) {
    const fastRedactOpts: RedactOptions = {
      paths: options.paths,
      // This option tells fast-redact to just do the redactions in-place.
      // Leave serialization to a separate Winston formatter.
      serialize: false,
    };
    if ("censor" in options) {
      fastRedactOpts.censor = options.censor;
    }
    this.redact = fastRedact(fastRedactOpts);
  }

  transform(info: any) {
    this.redact(info);
    return info;
  }
}

const logger = winston.createLogger({
  exitOnError: false,
  level: process.env.LOG_LEVEL || "debug",
  // Uncomment to cause
  // { errors: [{ "message": "Converting circular structure to JSON\n    --> starting at object with constructor 'Socket'\n    |     property 'parser' -> object with constructor 'HTTPParser'\n    --- property 'socket' closes the circle", }} }
  format: format.combine(
    ecsFields({ convertReqRes: true }),
    new WinstonRedactFormatter({
      paths: ["http.request.headers.authorization"],
    }),
    // Keep uncommented to cause the error
    ecsStringify(),
    // Bypass the ecsStringify using winston standard json formatter to get success
    // format.json(),
  ),
  transports: [new winston.transports.Console()],
});
export default logger;

/** Returns a logger with default meta data overridden to enrich the ECS format */
export const getECSContextualLogger = (
  logger: Logger,
  context: {
    req?: ExpressContextFunctionArgument["req"];
    res?: ExpressContextFunctionArgument["res"];
  } & Record<string, unknown>,
): Logger => logger.child(context);
