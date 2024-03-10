import express, { Express, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

function routes(app: Express) {
    // Create - POST /pogs
    app.post("/api/pogs", async (req: Request, res: Response) => {
        try {
            const { name, ticker_symbol, price, color } = req.body;

            const existingPog = await prisma.pogs.findFirst({
                where: {
                    OR: [
                        { name },
                        { ticker_symbol }
                    ]
                }
            });

            if (existingPog) {
                return res.status(422).json({ error: "Name or ticker symbol already exists" });
            }

            const createdPog = await prisma.pogs.create({
                data: {
                    name,
                    ticker_symbol,
                    price,
                    color
                }
            });
            res.status(201).json(createdPog);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create pog" });
        }
    });

    // Read - GET /pogs or GET /pogs/:id
    app.get("/api/pogs", async (req: Request, res: Response) => {
        try {
            const pogs = await prisma.pogs.findMany();
            res.json(pogs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Update - PATCH /pogs/:id
    app.patch("/api/pogs/:id", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, ticker_symbol, price, color } = req.body;

            // Check if the updated ticker symbol already exists
            const existingPog = await prisma.pogs.findFirst({
                where: {
                    NOT: { id: parseInt(id) },
                    ticker_symbol
                }
            });

            if (existingPog) {
                return res.status(422).json({ error: "Ticker symbol already exists" });
            }

            const updatedPog = await prisma.pogs.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    ticker_symbol,
                    price,
                    color
                }
            });
            res.json(updatedPog);
        } catch (error) {
            console.error(error);
            res.status(404).json({ error: "Pog not found" });
        }
    });

    // Delete - DELETE /pogs/:id
    app.delete("/api/pogs/:id", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await prisma.pogs.delete({
                where: { id: parseInt(id) }
            });
            res.sendStatus(204);
        } catch (error) {
            console.error(error);
            res.status(404).json({ error: "Pog not found" });
        }
    });
}

export default routes;
