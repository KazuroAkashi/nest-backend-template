import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { execSync } from "child_process";
import { io } from "socket.io-client";
import { PrismaService } from "../src/prisma.service";

describe("AuthController (e2e)", () => {
    let app: INestApplication;
    let prisma: PrismaService;

    jest.setTimeout(10000);
    beforeAll(async () => {
        execSync("sh migrate.sh");

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        prisma = app.get<PrismaService>(PrismaService);

        await app.listen(80);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("/auth/register (POST)", () => {
        let token: string;

        it("should throw BadRequest on empty request", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .expect(400);
        });

        it("should throw BadRequest on no tag", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({ email: "test@test.com", password: "123abc" })
                .expect(400);
        });

        it("should throw BadRequest on no email", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({ tag: "kazuro", password: "123abc" })
                .expect(400);
        });

        it("should throw BadRequest on empty tag", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({ tag: "", email: "test@test.com", password: "123abc" })
                .expect(400);
        });

        it("should throw BadRequest on invalid email", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({ tag: "kazuro", email: "kazuro", password: "123abc" })
                .expect(400);
        });

        it("should throw BadRequest on tag with 4 letters", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({
                    tag: "kazu",
                    email: "test@test.com",
                    password: "123abc",
                })
                .expect(400);
        });

        it("should throw BadRequest on tag with 17 letters", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({
                    tag: "kazurokazurokazur",
                    email: "test@test.com",
                    password: "123abc",
                })
                .expect(400);
        });

        it("should return jwt_token on valid data", () => {
            return request(app.getHttpServer())
                .post("/auth/register")
                .send({
                    tag: "kazuro",
                    email: "test@test.com",
                    password: "123abc",
                })
                .expect(201)
                .expect((res) => (token = res.body.jwt_token));
        });

        test("returned jwt_token should be usable in me", () => {
            return request(app.getHttpServer())
                .get("/auth/me")
                .auth(token, { type: "bearer" })
                .expect(200);
        });

        test("returned jwt_token should be usable in ws", (done) => {
            const socket = io("ws://localhost", {
                auth: {
                    jwt_token: token,
                },
            });

            socket.on("connect", () => {
                socket.emit("ping", (val: any) => {
                    socket.close();
                    try {
                        expect(val).toBe("Pong!");
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });

            socket.on("unauthorized", (data) => {
                console.log(data);
                done(data);
            });
        });
    });

    describe("/auth/login (POST)", () => {
        let token: string;

        it("should throw BadRequest on no password", () => {
            return request(app.getHttpServer())
                .post("/auth/login")
                .send({ tag: "oruzak" })
                .expect(400);
        });

        it("should throw BadRequest on invalid tag", () => {
            return request(app.getHttpServer())
                .post("/auth/login")
                .send({ tag: "oruzak", password: "123abc" })
                .expect(400);
        });

        it("should throw BadRequest on invalid password", () => {
            return request(app.getHttpServer())
                .post("/auth/login")
                .send({ tag: "kazuro", password: "123" })
                .expect(400);
        });

        it("should return jwt_token on valid data", () => {
            return request(app.getHttpServer())
                .post("/auth/login")
                .send({ tag: "kazuro", password: "123abc" })
                .expect(200)
                .expect((res) => (token = res.body.jwt_token));
        });

        test("returned jwt_token should be usable in me", () => {
            return request(app.getHttpServer())
                .get("/auth/me")
                .auth(token, { type: "bearer" })
                .expect(200);
        });

        test("returned jwt_token should be usable in ws", (done) => {
            const socket = io("ws://localhost", {
                auth: {
                    jwt_token: token,
                },
            });

            socket.on("connect", () => {
                socket.emit("ping", (val: any) => {
                    socket.close();
                    try {
                        expect(val).toBe("Pong!");
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            });

            socket.on("unauthorized", (data) => {
                console.log(data);
                done(data);
            });
        });
    });

    describe("permissions", () => {
        let token: string;
    });
});
