const mongoose = require('mongoose');
const { DeviceSecretContextImpl } = require('twilio/lib/rest/microvisor/v1/device/deviceSecret');
const itemSchema = new mongoose.Schema({
    description:{type:String},
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    size: {type: String,required:true}
  });
  
  // Define the schema for the main document
  const mainSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    email: { type: String, required: true },
    mobile:{ type: Number, required: true },
    data: [itemSchema],
    status:{type:String,required:true},
    totalItems: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    timestamp:{type:String,required:true}
  });
  
  
// Create a model based on the schema
const MainModel = mongoose.model('Requests', mainSchema);

module.exports = MainModel;