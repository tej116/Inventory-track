// import { NextResponse } from "next/server";
// import DistributedItems from "../../../models/DistributedItems";

// import { connectDB } from "../../../lib/db";

// export async function POST(req) {
//   try {
//     // 1. Connect to Database
//     await connectDB();

//     // 2. Parse request body
//     const body = await req.json();

//     // 3. Simple Validation (ensure itemId is present)
//     if (!body.itemId || !body.itemName) {
//         return NextResponse.json(
//             { message: "Item ID and Name are required" },
//             { status: 400 }
//         );
//     }

//     // 4. Create record in the database
//     const newDistribution = await DistributedItems.create({
//       itemId: body.itemId,
//       itemName: body.itemName,
//       unit: body.unit,
//       distributedTo: body.distributedTo,
//       receiverPerson: body.receiverPerson,
//       numberOfItems: Number(body.numberOfItems),
//       distributedDate: new Date(body.distributedDate),
//     });

//     // 5. Return success response
//     return NextResponse.json(
//       { message: "Distribution recorded successfully", data: newDistribution },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("DISTRIBUTION_ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error", error: error.message },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import DistributedItems from "../../../models/DistributedItems";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.itemId || !body.numberOfItems) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newEntry = await DistributedItems.create({
      itemId: body.itemId,
      itemName: body.itemName,
      unit: body.unit,
      distributedTo: body.distributedTo,
      receiverPerson: body.receiverPerson,
      numberOfItems: Number(body.numberOfItems),
      distributedDate: new Date(body.distributedDate),
    });

    return NextResponse.json({ message: "Success", data: newEntry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}