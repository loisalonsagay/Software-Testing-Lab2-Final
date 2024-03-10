import { prisma } from '../routes';
import createServer from '../utils/server';
import supertest from 'supertest';

const app = createServer();

describe("Pogs", () => {
    afterEach(async () => {
        await prisma.pogs.deleteMany();
    });


    describe("GET /api/pogs", () => {
        it("should return all pogs", async () => {
            //setup
            await prisma.pogs.createMany({
                data: [
                    { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" }, 
                    { name: "Acm_gar", ticker_symbol: "pn", price: 20, color: "white" } 
                ]
            });

            //invocation
            const res = await supertest(app).get("/api/pogs");

            //assessment
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe("POST /api/pogs", () => {
        it("should create a new pog", async () => {
            //setup
            const pogData = { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" };

            //invocation
            const res = await supertest(app).post("/api/pogs").send(pogData);

            //assessment
            expect(res.statusCode).toBe(201);
            expect(res.body).toMatchObject(pogData);
        });

        it("should not allow creation of a pog with duplicate ticker symbol", async () => {
            //setup
            await prisma.pogs.create({ data: { name: "Existing Pog", ticker_symbol: "pd", price: 15, color: "orange" } });
            const duplicatePogData = { name: "Duplicate Pog", ticker_symbol: "pd", price: 18, color: "white" };

            //invocation
            const res = await supertest(app).post("/api/pogs").send(duplicatePogData);

            //assessment
            expect(res.statusCode).toBe(422);
        });
    });

    describe("PATCH /api/pogs/:id", () => {
        it("should update an existing pog", async () => {
            //setup
            const createdPog = await prisma.pogs.create({ data: { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" } });
            const updatedPogData = { name: "Updated Omsim", ticker_symbol: "oms", price: 300, color: "violet" };

            //invocation
            const res = await supertest(app).patch(`/api/pogs/${createdPog.id}`).send(updatedPogData);

            //assessment
            expect(res.statusCode).toBe(200);
            expect(res.body).toMatchObject(updatedPogData);
        });

        it("should not allow update of a pog with duplicate ticker symbol", async () => {
            //setup
            const existingPog = await prisma.pogs.create({ data: { name: "Existing Pog", ticker_symbol: "ExistingTicker", price: 9, color: "black" } });
            await prisma.pogs.create({ data: { name: "Another Pog", ticker_symbol: "AnotherTicker", price: 90, color: "yellow" } });
            const duplicateTickerPogData = { name: "Duplicate Pog", ticker_symbol: "AnotherTicker", price: 11, color: "purple" };

            //invocation
            const res = await supertest(app).patch(`/api/pogs/${existingPog.id}`).send(duplicateTickerPogData);

            //assessment
            expect(res.statusCode).toBe(422);
        });
    });

    describe("DELETE /api/pogs/:id", () => {
        it("should delete an existing pog", async () => {
            //setup
            const createdPog = await prisma.pogs.create({ data: { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" } });

            //invocation
            const res = await supertest(app).delete(`/api/pogs/${createdPog.id}`);

            //assessment
            expect(res.statusCode).toBe(204);
            expect(res.body).toEqual({});
        });
    });
});
