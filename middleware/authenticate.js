const jwt = require("jsonwebtoken");
const UserModel = require("../models/usermodel");
const keysecret = "gauravingolespecialkeycharactersofbackendnodeggiiu"


const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.Amazonweb;
        const verifyToken = jwt.verify(token, keysecret);
        console.log(verifyToken);

        const rootUser = await  UserModel.findOne({ _id: verifyToken._id, "tokens.token": token });
        console.log(rootUser);

        if (!rootUser) { throw new Error("user not found") };
        req.token = token
        req.rootUser = rootUser
        req.userID = rootUser._id

        next();
    } catch (error) {
        res.status(401).send("unautherized: No token provide");
        console.log(error);

    }
}
module.exports = authenticate;
