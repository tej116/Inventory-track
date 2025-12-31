// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";

// import "./invoice.css";

// export default function AddPurchaseHistory() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [itemIds, setItemIds] = useState([]);

//   const [formData, setFormData] = useState({
//     invoiceNumber: "",
//     supplierId: "",
//     companyName: "",
//     cgstPercent: "",
//     sgstPercent: "",
//     cgst: "",
//     sgst: "",
//     totalBeforeTax: "",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Prefill supplier info and stored itemIds
//   useEffect(() => {
//     const supplierNameFromURL = searchParams.get("companyName");
//     const supplierNumberFromURL = searchParams.get("companyNumber");
//     const supplierIdFromURL = searchParams.get("supplierId");

//     setFormData((prev) => ({
//       ...prev,
//       supplierId: supplierIdFromURL || "",
//       companyName: supplierNameFromURL || "",
//     }));

//     const storedItems = JSON.parse(localStorage.getItem("purchase_item_ids")) || [];
//     const cleanedItemIds = storedItems.filter(
//     (id) => typeof id === "string" && id.length > 0
//       );

//   localStorage.setItem(
//     "purchase_item_ids",
//     JSON.stringify(cleanedItemIds)
//   );

//   setItemIds(cleanedItemIds);

// }, [searchParams]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

// // ✅ Submit (Add or Update)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // 1. Validate Phone Number
//     if (formData.companyNumber.length !== 10) {
//       alert("Please provide a proper 10-digit phone number");
//       return; 
//     }

//     // 2. Validate Discount
//     if (Number(formData.discountPercentage) <= 0 && Number(formData.discountPrice) <= 0) {
//       alert("Please provide discount percentage or discount amount");
//       return;
//     }

//     try {
//       const isEditMode = !!itemId; // true if editing, false if adding new
//       const method = isEditMode ? "PUT" : "POST";
//       const body = isEditMode ? { itemId, ...formData } : formData;

//       const res = await fetch("/api/AddItems", {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body)
//       });

//       if (!res.ok) throw new Error("Failed to save item");
//       const data = await res.json();

//       /* -----------------------------------------------------------
//          FIX: ONLY LOCK NAVIGATION IF ADDING A NEW ITEM
//       ----------------------------------------------------------- */
//       if (!isEditMode) {
//         // We only add to the "Pending Invoice" list if it's a NEW item
//         const existingItems = JSON.parse(localStorage.getItem("purchase_item_ids")) || [];
//         const newItemId = data?.data?.itemId;

//         if (newItemId) {
//           localStorage.setItem(
//             "purchase_item_ids",
//             JSON.stringify([...existingItems, newItemId])
//           );

//           localStorage.setItem("pending_supplier", JSON.stringify({
//             supplierId: formData.supplierId,
//             companyName: formData.companyName,
//             companyNumber: formData.companyNumber
//           }));
//         }
//       } 
//       // NOTE: If isEditMode is true, we do NOT touch localStorage at all.
//       /* ----------------------------------------------------------- */

//       alert(isEditMode ? "Item updated successfully ✅" : "Item added successfully ✅");
     
//       if (isEditMode) {
//         // After editing, go back to the list
//         router.push("/dashboard/ShowAddedItems");
//       } else {
//         // After adding new, clear form for the next item
//         setFormData(prev => ({
//           ...prev,
//           name: "",
//           quantity: "",
//           unit: "",
//           originalPrice: "",
//           discountPercentage: "",
//           discountPrice: "",
//           totalAmount: "",
//           hsnSac: "",
//           category: ""
//         }));
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving item ❌");
//     }
//   };
//   return (
//     <div className="purchase-container">
//       <h2>Add Purchase Details</h2>
//       {error && <p className="error">{error}</p>}

//       <form onSubmit={handleSubmit} className="purchase-form">
//         <input
//           type="text"
//           name="invoiceNumber"
//           placeholder="Invoice Number"
//           required
//           value={formData.invoiceNumber}
//           onChange={handleChange}
//         />

//         {/* Supplier Name Read-only */}
//         <input
//           type="text"
//           name="companyName"
//           value={formData.companyName}
//           readOnly
//           placeholder="Supplier Name"
//         />

//         <input
//           type="number"
//           name="cgstPercent"
//           placeholder="CGST %"
//           value={formData.cgstPercent}
//           onChange={handleChange}
//         />

//         <input
//           type="number"
//           name="sgstPercent"
//           placeholder="SGST %"
//           value={formData.sgstPercent}
//           onChange={handleChange}
//         />

//         <input
//           type="number"
//           name="cgst"
//           placeholder="CGST Amount"
//           value={formData.cgst}
//           onChange={handleChange}
//         />

//         <input
//           type="number"
//           name="sgst"
//           placeholder="SGST Amount"
//           value={formData.sgst}
//           onChange={handleChange}
//         />

//         <button type="submit" disabled={loading}>
//           {loading ? "Saving..." : "Save Purchase"}
//         </button>
//       </form>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./invoice.css";

export default function AddPurchaseHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [itemIds, setItemIds] = useState([]);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    supplierId: "",
    companyName: "",
    companyNumber: "",     // ✅ FIX
    cgstPercent: "",
    sgstPercent: "",
    cgst: "",
    sgst: "",
    totalBeforeTax: "",
  });

  const [loading, setLoading] = useState(false);

  /* ===============================
     PREFILL SUPPLIER + ITEMS
  =============================== */
  useEffect(() => {
    const supplierIdFromURL = searchParams.get("supplierId");
    const supplierNameFromURL = searchParams.get("companyName");
    const supplierNumberFromURL = searchParams.get("companyNumber");

    setFormData((prev) => ({
      ...prev,
      supplierId: supplierIdFromURL || "",
      companyName: supplierNameFromURL || "",
      companyNumber: supplierNumberFromURL || "",
    }));

    try {
      const stored = localStorage.getItem("purchase_item_ids");
      const parsed = stored ? JSON.parse(stored) : [];
      const cleaned = Array.isArray(parsed)
        ? parsed.filter((id) => typeof id === "string" && id.length > 0)
        : [];

      localStorage.setItem("purchase_item_ids", JSON.stringify(cleaned));
      setItemIds(cleaned);
    } catch {
      setItemIds([]);
    }
  }, [searchParams]);

  /* ===============================
     INPUT HANDLER
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Safe validation
    if (!formData.companyNumber || formData.companyNumber.length !== 10) {
      alert("Please provide a valid 10-digit phone number");
      return;
    }

    if (itemIds.length === 0) {
      alert("No items found for invoice");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/Invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          itemIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create invoice");
        return;
      }

      localStorage.removeItem("purchase_item_ids");
      localStorage.removeItem("pending_supplier");

      alert("Invoice created successfully ✅");
      router.push("/dashboard/PurchaseHistory");
    } catch (err) {
      console.error(err);
      alert("Error saving invoice ❌");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     JSX (MUST RETURN)
  =============================== */
  return (
    <div className="purchase-container">
      <h2>Add Purchase Details</h2>

      <form onSubmit={handleSubmit} className="purchase-form">
        <input
          type="text"
          name="invoiceNumber"
          placeholder="Invoice Number"
          required
          value={formData.invoiceNumber}
          onChange={handleChange}
        />

        <input
          type="text"
          value={formData.companyName}
          readOnly
          placeholder="Supplier Name"
        />

        <input
          type="number"
          name="cgstPercent"
          placeholder="CGST %"
          value={formData.cgstPercent}
          onChange={handleChange}
        />

        <input
          type="number"
          name="sgstPercent"
          placeholder="SGST %"
          value={formData.sgstPercent}
          onChange={handleChange}
        />

        <input
          type="number"
          name="cgst"
          placeholder="CGST Amount"
          value={formData.cgst}
          onChange={handleChange}
        />

        <input
          type="number"
          name="sgst"
          placeholder="SGST Amount"
          value={formData.sgst}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Purchase"}
        </button>
      </form>
    </div>
  );
}
