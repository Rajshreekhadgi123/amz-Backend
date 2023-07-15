const express = require("express");
const UserRoute = new express.Router();
const Products = require("../models/productSchema");
const UserModel = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");


UserRoute.get("/", async (req, res) => {
    const data = await UserModel.find()
    return res.send({ data })
});

// Get productdata API

UserRoute.get("/getproducts", async (req, res) => {
    try {
        const productsdata = await Products.find();
        res.status(201).json(productsdata)
    } catch (error) {
        console.log("error" + error.message);
    }
});

// Get Individual Data

UserRoute.get("/getproductone/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const individualdata = await Products.findOne({ id: id })
        res.status(201).json(individualdata);

    } catch (error) {
        res.status(400).json(individualdata);
        console.log("error" + error.message);
    }
});

// user register

UserRoute.post("/register", async (req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ message: "Please fill all the fields" });
        console.log("no data avaible");
    };
    try {
        const preuser = await UserModel.findOne({ email: email });
        if (preuser) {
            res.status(422).json({ message: "Email already exists" });
        } else if (password !== cpassword) {
            res.status(422).json({ message: "Passwords do not match" });
        } else {
            const finalUser = new UserModel({
                fname, email, mobile, password, cpassword
            });
            // password hashing process
            const storeData = await finalUser.save();
            // console.log(storeData);
            res.status(201).json({ status: 201, storeData });
        }
    } catch (error) {

    }

});


// user Login

UserRoute.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "fill the all data" })
    };
    try {
        const userlogin = await UserModel.findOne({ email: email });
        console.log(userlogin + "users value");
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);

            // token genrate
            const token = await userlogin.generateAuthtoken();

            res.cookie("Amazonweb", token, {
                expires: new Date(Date.now() + 9000000),
                httpOnly: true
            });

            if (!isMatch) {
                res.status(400).json({ error: "password Not Match" })
            } else {


                res.status(201).json({ status: 201, userlogin });
            }
        } else {
            res.status(400).json({ error: "User Not Found" })
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid details" })
    }
});

// adding a data into cart

UserRoute.post("/addcart/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart value");

        const UserContact = await UserModel.findOne({ _id: req.userID });
        console.log(UserContact);

        if (UserContact) {
            const cartData = await UserContact.addcartdata(cart);
            await UserContact.save();
            console.log(cartData);
            res.status(201).json(UserContact);

        } else {
            res.status(401).json({ error: "Cart Data Not Found" });
        }

    } catch (error) {
        res.status(401).json({ error: "Invalid details" })

    }
});


// get cart details

UserRoute.get("/cartdetails", authenticate, async (req, res) => {
    try {
        const buyuser = await UserModel.findOne({ _id: req.userID });
        res.status(201).json(buyuser);
    } catch (error) {
        console.log("error" + error);

    }
})


// get valid user

UserRoute.get("/validuser", authenticate, async (req, res) => {
    try {
        const validuserone = await UserModel.findOne({ _id: req.userID });
        res.status(201).json(validuserone);
    } catch (error) {
        console.log("error" + error);

    }
})


// remove item from cart

UserRoute.delete("/remove/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        req.rootUser.carts = req.rootUser.carts.filter((cruval) => {
            return cruval.id != id;
        })
        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("item remove");
    } catch (error) {
        console.log("error" + error);
        res.status(400).json(req.rootUser);


    }
});


// for user Logout

UserRoute.get("/logout", authenticate, (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token

        });

        res.clearCookie("Amazonweb", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens)
        console.log("user logout");


    } catch (error) {
        console.log("error for user logout");

    }

})



module.exports = UserRoute