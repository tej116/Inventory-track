import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import PurchaseHistory from "../../../../models/PurchaseHistory";
import Supplier from "../../../../models/SupplierDetails";
import ItemDetails from "../../../../models/ItemDetails";
import DistributedItems from "../../../../models/DistributedItems"; // Import the distribution model

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const purchase = await PurchaseHistory.findById(id);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    const supplier = await Supplier.findOne({ supplierId: purchase.supplierId });

    // Fetch the original purchased items
    const rawItems = await ItemDetails.find({ itemId: { $in: purchase.itemIds } });

    // For each item, calculate how many have been distributed
    const itemsWithStats = await Promise.all(
      rawItems.map(async (item) => {
        const distributions = await DistributedItems.find({ itemId: item.itemId });
        
        // Sum the "numberOfItems" from all distribution records for this itemId
        const totalDistributed = distributions.reduce((sum, d) => sum + d.numberOfItems, 0);

        return {
          _id: item._id,
          itemId: item.itemId,
          name: item.name, // Using 'name' from your ItemDetails Schema
          unit: item.unit,
          purchasedQuantity: item.quantity, // This is the "Total Stock"
          totalDistributed: totalDistributed, // Calculated sum
          remainingStock: item.quantity - totalDistributed,
          originalPrice: item.originalPrice,
          discountPrice: item.discountPrice,
          finalPrice: item.totalAmount, // Assuming totalAmount is the final price per item
          distributionDetails: distributions.map(d => ({
            place: d.distributedTo,
            count: d.numberOfItems,
            date: d.distributedDate
              }))        
        };
      })
    );

    return NextResponse.json({
      purchase,
      supplierName: supplier?.companyName || "Unknown Supplier",
      items: itemsWithStats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}