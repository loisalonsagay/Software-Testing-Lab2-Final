import { prisma } from '../routes';
import createServer from '../utils/server';
import supertest from 'supertest';

const app = createServer();

describe("Pogs", () => {
    afterEach(async () => {
        await prisma.pogs.deleteMany();
    });


    //R-Read GET index '/pogs' and show '/pogs/:id'
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

    

    //C-Create POST'/pogs'
    describe("POST /api/pogs", () => {
        it("should create a new pog", async () => {
            const pogData = { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" };

            const res = await supertest(app).post("/api/pogs").send(pogData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toMatchObject(pogData);
    });

        it("should not allow creation of a pog with the same ticker symbol in database", async () => {
            await prisma.pogs.create({ data: { name: "Existing Pog", ticker_symbol: "pd", price: 15, color: "orange" } });
            const duplicatePogData = { name: "Duplicate Pog", ticker_symbol: "pd", price: 18, color: "white" };

            let res = await supertest(app).post("/api/pogs").send(duplicatePogData);

            expect(res.statusCode).toBe(422);

            const duplicateNamePogData = { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" };

            res = await supertest(app).post("/api/pogs").send(duplicateNamePogData);

            expect(res.statusCode).toBe(422);
    });
        it("should not allow creation of a pog with the same name in database", async () => {
            await prisma.pogs.create({ data: { name: "Omsim_gar", ticker_symbol: "oms", price: 20, color: "blue" } });
            const duplicateNamePogData = { name: "Omsim_gar", ticker_symbol: "sheesh", price: 18, color: "white" };

            const res = await supertest(app).post("/api/pogs").send(duplicateNamePogData);

            expect(res.statusCode).toBe(422);

         });
    });



    //U-Update PATCH OR PUT '/pogs/:id'
    describe("PATCH /api/pogs/:id", () => {
        it("should update an existing pog", async () => {
            const createdPog = await prisma.pogs.create({ data: { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" } });
            const updatedPogData = { name: "Updated Omsim", ticker_symbol: "oms", price: 300, color: "violet" };

            const res = await supertest(app).patch(`/api/pogs/${createdPog.id}`).send(updatedPogData);

            expect(res.statusCode).toBe(200);
            expect(res.body).toMatchObject(updatedPogData);
    });
        it("should not allow update of a pog with the same ticker symbol in database", async () => {
            const existingPog = await prisma.pogs.create({ data: { name: "OP", ticker_symbol: "OT", price: 9, color: "black" } });
            await prisma.pogs.create({ data: { name: "AP", ticker_symbol: "AT", price: 80, color: "yellow" } });
            const duplicateTickerPogData = { name: "DP", ticker_symbol: "AT", price: 12, color: "purple" };

            const res = await supertest(app).patch(`/api/pogs/${existingPog.id}`).send(duplicateTickerPogData);

            expect(res.statusCode).toBe(422);
    });
        it("should not allow update of a pog with the same name in database", async () => {
            const existingPog = await prisma.pogs.create({ data: { name: "OP", ticker_symbol: "EP", price: 9, color: "black" } });
            await prisma.pogs.create({ data: { name: "AP", ticker_symbol: "AP", price: 80, color: "yellow" } });
            const duplicateNamePogData = { name: "EP", ticker_symbol: "AP", price: 12, color: "purple" };

            const res = await supertest(app).patch(`/api/pogs/${existingPog.id}`).send(duplicateNamePogData);

            expect(res.statusCode).toBe(422);
        });
    });



    //D-Delete DELETE '/pogs/:id'
    describe("DELETE /api/pogs/:id", () => {
        it("should delete an existing pog", async () => {
            const createdPog = await prisma.pogs.create({ data: { name: "Omsim_gar", ticker_symbol: "pd", price: 9, color: "black" } });

            const res = await supertest(app).delete(`/api/pogs/${createdPog.id}`);

            expect(res.statusCode).toBe(204);
            expect(res.body).toEqual({});
        });
    });
});
