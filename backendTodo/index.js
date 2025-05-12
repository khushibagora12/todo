const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const {userModel, todoModel} = require("./db");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 8000;
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const app = express();
const JWT_SECRET = "raaz";

app.use(cors());
app.use(express.json());

app.post("/signup", async function (req, res) {
    const bodyContent = z.object({
        name : z.string().min(5).max(100),
        email : z.string().min(5).max(100).email(),
        password : z.string().min(8).max(20)
    });

    const check = bodyContent.safeParse(req.body);

    if(!check.success){
        res.json({
            message : "incorrect format",
            error : check.error
        });
        return;
    }
    const {name, email, password} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 5);
    await userModel.create({
        name,
        email,
        password : hashedPassword
    });

    res.json({
        message : "user created"
    })
}
catch(e){
    res.json({
        message : "user exist"
    });
}
});

app.post("/signin", async function (req, res) {
    const {email, password} = req.body;

    const user = await userModel.findOne({email}); 
    if(!user){
        res.json({
            message : "user not found"
        });
    }
    const compare = await bcrypt.compare(password, user.password);
    if(compare){
        const token = jwt.sign({
            id : user._id.toString()
        }, JWT_SECRET);
        res.json({
            message : "user signed in successfully",
            token : token
        });
    }else{
        res.status(404).send("user not found");
    }
});
app.use(auth);
app.post("/todo", async (req, res) => {
    const userId = req.userId;
    const {title, done = false} = req.body;
    await todoModel.create({
        title,
        done,
        userId
    });

    res.json({
        message : "todo created"
    });
});

app.get("/getTodo", async (req, res) => {
    const userId = req.userId;
    const user = await todoModel.find({userId});

    if(user){
        res.json({
           user    
        });
    }else{
        res.status(404).send("error");
    }
});

app.post("/delete", async (req, res) => {
    const {todoId} = req.body;
    const deletedTodo = await todoModel.findOneAndDelete({_id : todoId});

    if(deletedTodo){
        res.json({
            message : "todo deleted successfully"
        });
    }
    
});


function auth(req, res, next){
    const token = req.headers.authorization;

    if(token){
        const user = jwt.verify(token, JWT_SECRET);
        if(user){
            req.userId = user.id;
            next();
        }else{
            res.status(404).send("user not found");
        }
    }else{
        res.status(404).send("error");
    }
}
app.listen(port);