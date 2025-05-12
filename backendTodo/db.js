const mongoose = require("mongoose");

const schema = mongoose.Schema; 
const objectId = schema.ObjectId;

const user = new schema({
    name : String,
    email : String,
    password : String
});

const todo = new schema({
    title : String,
    done : Boolean,
    userId : objectId
});

const userModel = mongoose.model("users", user);
const todoModel = mongoose.model("todos", todo);

module.exports = {
    userModel : userModel,
    todoModel : todoModel
};