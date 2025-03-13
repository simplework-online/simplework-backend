const { ref } = require('joi')
const mongoose=require('mongoose')
const AppliedJobSchema=new mongoose.Schema({
    Applier:{type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    Applied_to:{type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    Job_id:{type:mongoose.Schema.Types.ObjectId,
        ref:'Job'
    }
})