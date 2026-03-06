import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.dashboard.get.path, async (req, res) => {
    const data = await storage.getDashboardData();
    res.json(data);
  });

  app.get(api.members.list.path, async (req, res) => {
    const members = await storage.getMembers();
    res.json(members);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const tx = await storage.createTransaction(input);
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
