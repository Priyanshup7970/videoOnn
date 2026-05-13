import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type:Schema.Types.ObjectId, // one who is subscribing
        ref: 'User'
    },
    channel: {
        type:Schema.Types.ObjectId, // one who is being subscribed to
        ref: 'User', 
    },
    // plan: {type: String, enum: ['free', 'basic', 'premium'], default: 'free'},          
    // startDate: {type: Date, default: Date.now},
    // endDate: {type: Date},
    // isActive: {type: Boolean, default: true}
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
