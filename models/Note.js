const mongoose=require("mongoose");
const autoIncrement=require("mongoose-sequence")(mongoose);
const noteSchema= new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps:true
    }
)
noteSchema.plugin(autoIncrement,{ // this will not visible to notes collection, instead there is another collection will formed name ticket.
    inc_field:'ticket',
    id:'ticketNums',
    start_seq:500
})

module.exports=mongoose.model('Note',noteSchema);