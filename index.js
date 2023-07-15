const express = require("express");
require("dotenv").config();

const app = express();
const mongoose = require("mongoose");
const connection = require("./config");
const Products = require("./models/productSchema");
const DefaultData = require("./defaultdata");
const UserRoute = require("./routes/userRoute");
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/", UserRoute);


app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log("DB connected");
    } catch (error) {
        console.log(error);
    }
    console.log(`db connected at port ${process.env.PORT}`);
});
DefaultData();