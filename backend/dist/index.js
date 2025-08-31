"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const announcementstore_1 = require("./announcementstore");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://interview-gamma-six.vercel.app"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true, // if you need cookies/auth
}));
app.use(express_1.default.json());
app.get("/all", announcementstore_1.getAll);
app.post("/add", announcementstore_1.addAnn);
app.patch("/change/:id", announcementstore_1.changeStatus);
app.listen(PORT, () => {
    console.log(`Listening on the port ${PORT}`);
});
