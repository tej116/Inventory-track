import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import ItemDetails from "../../../models/ItemDetails";
import DistributedItems from "../../../models/DistributedItems";

export async function GET(req) {
  try {
    await connectDB();

    // Get the search query from the URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search");

    // Build filter for searching by name
    let filter = {};
    if (query) {
      filter.name = { $regex: query, $options: "i" }; // Case-insensitive search
    }

    // 1. Fetch all matching items from ItemDetails
    const items = await ItemDetails.find(filter).lean();

    // 2. Fetch all distributions to calculate sums
    const distributions = await DistributedItems.find({}).lean();

    // 3. Combine the data
    const dynamicData = items.map((item) => {
      // Calculate total quantity distributed for THIS specific itemId
      const totalDistributed = distributions
        .filter((d) => d.itemId === item.itemId)
        .reduce((sum, d) => sum + d.numberOfItems, 0);

      return {
        id: item._id,
        itemId: item.itemId,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity, // Original stock
        distributed: totalDistributed, // Sum from DistributedItems
        remaining: item.quantity - totalDistributed, // Math: Total - Distributed
      };
    });

    return NextResponse.json(dynamicData, { status: 200 });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}