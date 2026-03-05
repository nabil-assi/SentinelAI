"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var Pool = pg_1.default.Pool;
var dotenv = require("dotenv");
dotenv.config();
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("❌ DATABASE_URL is missing from .env file!");
}
var pool = new Pool({ connectionString: connectionString });
var adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter: adapter });
exports.prisma.$connect()
    .then(function () { return console.log("✅ Prisma connected successfully!"); })
    .catch(function (err) { return console.error("❌ Connection error:", err); });
