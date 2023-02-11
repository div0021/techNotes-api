const User = require("../models/User");
const Note = require("../models/Note");
const bcrypt = require("bcrypt");

//@des Get all users
// @route Get /users
// @access private

const getAllUsers = async (req, res) => {
  const user = await User.find().select("-password").lean(); // it is important because mongoose will give us a document which also include method also like save etc.. Lean() tell that give only json data.

  if (!user?.length) {  // this is simialar to (!user || !user.length)
    return res.status(400).json({ message: "No users found" }); // THis is imp..
  }
  res.json(user);
};
 // creating new user..
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body;

  //confirm data

  if (!username || !password ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username }).collation({locale:'en',strength:2}).lean().exec(); // THis is need because it will going to happen asyc and after that happen we want to execute without any error..
 // collation used to check case sensitivity
  if (duplicate) {
    return res.status(409).json({ message: "This user already exist" });
  }

  // Hash password

  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject = (!Array.isArray(roles) || !roles.length) ? {username,"password" : hashedPwd} : {username,"password" : hashedPwd,roles}
 console.log(roles);
  // create and store the user

  const user = await User.create(userObject);
  console.log(user);
  if (user) {
    res.status(201).json({ message: `New User ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recived" });
  }
};

const updateUser = async (req, res) => {
  const { id, username, roles, active, password } = req.body;
  // confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    
    return res.status(400).json({ message: "All field are required" });
  }

  const user = await User.findById(id).exec();
  // Here we are not placing lean because we need mongoose document and the method we get with it.

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username }).collation({locale:'en',strength:2}).lean().exec();

  //Allow update to original user

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //hash password
    user.password = await bcrypt.hash(password, 10);
  }
  const updateUser = await user.save();

  res.json({ message: `${updateUser.username} updated!!` });
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ message: "User Id Required!!" });
  }
  const note=await Note.findOne({user:id}).lean().exec();
  if(note){
    return res.status(400).json({message:'User has assigned notes'});
  }

  const user = await User.findById(id).exec(); // this exec function is used because it return a promise and with callback and .exec(), querry not occur..
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const result = await user.deleteOne();
  const reply = `Username ${result.username} with ID ${result._id} deleted`;
  res.json(reply);
};

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
