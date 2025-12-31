import mongoose from "mongoose";

const ItemDetailsSchema = new mongoose.Schema(
  {
    itemId: {
    type: String,
    unique: true,
    required: true,
    },

    supplierId: {
    type: String,
    required: true,
    },

    
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

  companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],

    },

    unit: {
    type: String,
    required: true,
    enum: [
        "pcs",
        "kg",
        "g",
        "liter",
        "ml",
        "m",
        "cm",
        "mm",
        "box",
        "packet",
        "dozen",
    ],

        },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    discountPrice: {
      type: Number,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    hsnSac: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Furniture","Hardware", "Electronics", "Consumables", "Service", "Other"],
    },

    Date: {
    type: Date,
    required: true,
    default: Date.now, // automatically stores the entry time
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ItemDetails ||
  mongoose.model("ItemDetails", ItemDetailsSchema);
