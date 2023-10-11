import { Application } from "express";
import { Logger } from "winston";
import logger from "./logger";
import { Database } from "arangojs";
import { dbConfig } from "../config/arango.config";

/** Defines the internal repos and library instances that are required during bootstrap */
export interface SystemContext {
  logger: Logger;
  db: Database;
}

export const useSystemContext = (app: Application): void => {
  app.use((req, res, next) => {
    req.locals ||= {};
    req.locals.system = getSystemContext();
    next();
  });
};

/** Provides the internal repos and library instances that are required during bootstrap */
export const getSystemContext = async (): Promise<SystemContext> => {
  const db = await getArangoDb(dbConfig);

  return {
    logger,
    db,
  };
};

export interface DBConnectionConfig {
  dbName?: string | undefined;
  username: string | undefined;
  password: string | undefined;
  host: string | undefined;
  port: string | undefined;
}

export const getArangoDb = async (
  config: DBConnectionConfig,
): Promise<Database> => {
  const { dbName = "default", username, password, host, port } = config;
  if (!host) {
    throw new Error("host is undefined");
  }

  const arangoConf = {
    url: `http://${host}:${port}`,
  };

  const db = new Database(arangoConf);
  db.useBasicAuth(username, password || "");

  const dbNames = await db.listDatabases();
  if (!dbNames.includes(dbName)) {
    await db.createDatabase(dbName);
  }
  return db;
};
