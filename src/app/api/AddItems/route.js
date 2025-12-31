export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import AddItems from "../../../models/ItemDetails";
import { connectDB } from "../../../lib/db";
import PurchaseHistory from "../../../models/PurchaseHistory";

/* =========================
   POST : ADD ITEM (UNCHANGED)
   ========================= */
export async function POST(request) {
  try {
    const body = await request.json();
console.log("ADD ITEM BODY 👉", body);
    const {
      supplierId,
      name,
      quantity,
      unit,
      originalPrice,
      discountPercentage,
      discountPrice,
      companyName,
      companyNumber,
      hsnSac,
      category
    } = body;


    if (!name || !quantity || !unit || !originalPrice) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    const op = Number(originalPrice);
    const dp = Number(discountPrice || 0);
    const dperc = Number(discountPercentage || 0);


    let finalDiscountPrice = dp;
    let finalDiscountPercentage = dperc;

    if (finalDiscountPercentage > 0 && finalDiscountPrice === 0) {
      finalDiscountPrice = (op * finalDiscountPercentage) / 100;
    }

    if (finalDiscountPrice > 0 && finalDiscountPercentage === 0) {
      finalDiscountPercentage = (finalDiscountPrice / op) * 100;
    }

    const totalAmount = op - finalDiscountPrice;

    if (totalAmount < 0) {
      return NextResponse.json(
        { message: "Invalid discount values" },
        { status: 400 }
      );
    }

    const itemId = randomUUID();

    const itemData = {
      itemId,
      supplierId,
      name,
      quantity: Number(quantity),
      unit,
      originalPrice: op,
      discountPercentage: Number(finalDiscountPercentage.toFixed(2)),
      discountPrice: Number(finalDiscountPrice.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      companyName,
      companyNumber,
      hsnSac,
      category,
    };
console.log(itemData.supplierId);
    await connectDB();
    await AddItems.create(itemData);

    return NextResponse.json(
      { message: "Item added successfully", data: itemData },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   GET : ALL ITEMS / SINGLE ITEM
   ========================= */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      const item = await AddItems.findOne({ itemId });
      return NextResponse.json(item, { status: 200 });
    }

    const items = await AddItems.find().sort({ createdAt: -1 });
    return NextResponse.json(items, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT : UPDATE ITEM
   ========================= */
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
    }

    // Recalculate prices to ensure data integrity
    const op = Number(updateData.originalPrice);
    const dperc = Number(updateData.discountPercentage || 0);
    const finalDiscountPrice = (op * dperc) / 100;
    const totalAmount = op - finalDiscountPrice;

    // Prepare cleaned data
    const cleanedData = {
      ...updateData,
      quantity: Number(updateData.quantity),
      originalPrice: op,
      discountPercentage: dperc,
      discountPrice: Number(finalDiscountPrice.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      hsnSac: Number(updateData.hsnSac),
      // Ensure strings are trimmed
      companyName: updateData.companyName.trim(),
      companyNumber: updateData.companyNumber.trim(),
    };

    const updatedItem = await AddItems.findOneAndUpdate(
      { itemId },
      { $set: cleanedData },
      { new: true, runValidators: true } // runValidators ensures the phone number regex is checked
    );

    if (!updatedItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    
    /* ------------------------------------------------------------------
       NEW: RECALCULATE ALL INVOICES (PurchaseHistory) LINKED TO THIS ITEM
    ------------------------------------------------------------------ */
    // Find all invoices that include this itemId in their itemIds array
    const relatedInvoices = await PurchaseHistory.find({ itemIds: itemId });

    for (const invoice of relatedInvoices) {
      // Fetch all items currently in this specific invoice to get their updated prices
      const allItemsInThisInvoice = await AddItems.find({
        itemId: { $in: invoice.itemIds },
      });

      // Recalculate Total Before Tax for the entire invoice
      const newInvoiceTotalBeforeTax = allItemsInThisInvoice.reduce(
        (sum, item) => sum + Number(item.totalAmount),
        0
      );

      // Recalculate GST based on the percentages already saved in the invoice
      const newCgst = (newInvoiceTotalBeforeTax * (invoice.cgstPercent || 0)) / 100;
      const newSgst = (newInvoiceTotalBeforeTax * (invoice.sgstPercent || 0)) / 100;
      const newTotalTax = newCgst + newSgst;
      const newTotalAfterTax = newInvoiceTotalBeforeTax + newTotalTax;

      // Update the Invoice record with new calculated values
      await PurchaseHistory.updateOne(
        { _id: invoice._id },
        {
          $set: {
            totalAmountBeforeTax: Number(newInvoiceTotalBeforeTax.toFixed(2)),
            cgst: Number(newCgst.toFixed(2)),
            sgst: Number(newSgst.toFixed(2)),
            totalTaxAmount: Number(newTotalTax.toFixed(2)),
            totalAmountAfterTax: Number(newTotalAfterTax.toFixed(2)),
          },
        }
      );
    }
    /* ------------------------------------------------------------------ */

    return NextResponse.json({ message: "Item updated successfully", data: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("PUT ERROR:", error);
    return NextResponse.json({ message: error.message || "Failed to update item" }, { status: 500 });
  }
}
