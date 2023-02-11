const Note = require("../models/Note");
const User = require("../models/User");


// Create Notes
const createNote = async (req, res) => {

  const {title, text,user} = req.body;
  
  // verifing..
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All field are required!!" });
  }
  if (title.length < 3) {
    return res.status(400).json({ message: "title is too short.." });
  }
  if (text.length < 7) {
    return res.status(400).json({ message: "text is too short.." });
  }
  // user verification..
  const suser = await User.findById(user).exec();
  if (!suser) {
    return res.status(400).json({ message: "Invalid user!!" });
  }

  // check for duplicate title
  const duplicate = await Note.findOne({title}).collation({locale:'en',strength:2}).lean().exec();

  if(duplicate){
    return res.status(409).json({message:'Duplicate note title'});
  }

  const note = await Note.create({
    // creat and store notes..
    user,
    title,
    text,
    completed: false,
  });
  if (note) {
    return res.status(201).json({ message: `${title} note is create!!` });
  } else {
    return res.status(400).json({ message: "Invalid Data entry!!" });
  }
};

// Get all the user ::  point -> /notes
const getAllNotes = async (req, res) => {
 //Get all notes

 const notes = await Note.find().lean();

 //if no notes

 if(!notes?.length){
  return res.status(400).json({message:'No notes found'});
 }

 //Add user name to each note before sending response
 const notesWithUser = await Promise.all(notes.map(async (note) => {
  const user = await User.findById(note.user).lean().exec();
  return {...note,username:user.username};
 }))
 res.json(notesWithUser);
};

// Update a user
const updateNote = async (req, res) => {

  const { title, text,completed, id,user } = req.body;

  // verify data..
  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    res.status(400).json({ message: "All field are required!!" });
  }
  if (title.length < 3) {
    return res.status(400).json({ message: "title is too short.." });
  }
  if (text.length < 7) {
    return res.status(400).json({ message: "text is too short.." });
  }

  // user verification..
  const suser = await User.findById(user).exec();
  if (!suser) {
    return res.status(400).json({ message: "Invalid user!!" });
  }
   // confirm note exits to update
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(404).json({ message: "Note is not found!!" });
  }
  // note and user verification!!
  if (note.user.toString() !== suser._id.toString()) {
    
    return res.status(400).json({ message: "id verfication failed!!" });
  }

  // checking for duplicate title
  const duplicate = await Note.findOne({title}).collation({locale:"en",strength:2}).lean().exec();

  if(duplicate && duplicate?._id.toString !== id){
    return res.status (409).json({message:'Duplicate note title'});
  }
  note.user=user;
  note.title = title;
  note.text = text;
  note.completed = completed;
  const updatedNote= await note.save();
  res.json( `note ${updatedNote.title} is updated!!`);
};

// delete a Note.
const deleteNote = async (req, res) => {
  const {id} = req.body;

  if (!id) {
    return res.status(404).json({ message: "NoteId required!!" });
  }
  // confirm note exists to delete
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(404).json({ message: "Note is not found!!" });
  }

  const result= await note.deleteOne();
   const reply=`Note ${result.title} whose Id is ${result._id} deleted`;
   res.json(reply);
};

module.exports = {
  createNote,
  getAllNotes,
  updateNote,
  deleteNote,
};
