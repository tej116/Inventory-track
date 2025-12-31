"use client";

import { useState, useEffect, Suspense } from "react"; // Added Suspense
import { useSearchParams, useRouter } from "next/navigation";

// --- START OF YOUR LOGIC COMPONENT ---
function AddItemForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");

  const companyNameFromSupplier = searchParams.get("companyName");
  const companyNumberFromSupplier = searchParams.get("companyNumber");
  const SupplierId = searchParams.get("supplierId");

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
    originalPrice: "",
    discountPercentage: "",
    discountPrice: "",
    totalAmount: "",
    companyName: companyNameFromSupplier || "",
    companyNumber: companyNumberFromSupplier || "",
    hsnSac: "",
    supplierId: SupplierId || "",
    category: "",
  });

  // ✅ Prefill form if editing
  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/AddItems?itemId=${itemId}`);
        const data = await res.json();
        setFormData({
          name: data.name || "",
          quantity: data.quantity || "",
          unit: data.unit || "",
          originalPrice: data.originalPrice || "",
          discountPercentage: data.discountPercentage || "",
          discountPrice: data.discountPrice || "",
          totalAmount: data.totalAmount || "",
          companyName: data.companyName || "",
          companyNumber: data.companyNumber || "",
          supplierId: data.supplierId || "",
          hsnSac: data.hsnSac || "",
          category: data.category || "",
        });
      } catch (err) {
        console.error("Failed to fetch item:", err);
      }
    };

    fetchItem();
  }, [itemId]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedData = { ...prev, [name]: value };

      // ✅ Calculate discount in frontend
      if (name === "discountPercentage" && prev.originalPrice) {
        const discountAmount =
          (Number(prev.originalPrice) * Number(value)) / 100;

        updatedData.discountPrice = discountAmount.toFixed(2);
        updatedData.totalAmount = Number(prev.originalPrice) - discountAmount;
      }

      return updatedData;
    });
  };

  // ✅ Submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.companyNumber.length !== 10) {
      alert("give the proper phone number");
      return; // Stop form submission
    }
    try {
      const method = itemId ? "PUT" : "POST";
      const body = itemId ? { itemId, ...formData } : formData;
      const isEditMode = !!itemId;

      if (
        Number(formData.discountPercentage) <= 0 &&
        Number(formData.discountPrice) <= 0
      ) {
        alert("Please provide discount percentage or discount amount");
        return;
      }
      const res = await fetch("/api/AddItems", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save item");

      const data = await res.json();

      // // ✅ STORE ITEM ID IN LOCAL STORAGE  /* -----------------------------------------------------------
      //    CRITICAL FIX: LOCK NAVIGATION ONLY IF ADDING A NEW ITEM
      // ----------------------------------------------------------- */
      if (!isEditMode) {
        // ONLY run this when creating a NEW item
        const existingItems =
          JSON.parse(localStorage.getItem("purchase_item_ids")) || [];
        const newItemId = data?.data?.itemId;

        if (newItemId) {
          localStorage.setItem(
            "purchase_item_ids",
            JSON.stringify([...existingItems, newItemId])
          );

          localStorage.setItem(
            "pending_supplier",
            JSON.stringify({
              supplierId: formData.supplierId,
              companyName: formData.companyName,
              companyNumber: formData.companyNumber,
            })
          );
        }
      }
      /* If it IS an edit mode, we skip the storage logic above, 
         so 'purchase_item_ids' stays empty, and layout stays unlocked. */
      /* ----------------------------------------------------------- */

      alert(
        isEditMode ? "Item updated successfully ✅" : "Item added successfully ✅"
      );

      if (isEditMode) {
        // If editing, go back to the items list immediately
        router.push("/dashboard/ShowAddedItems");
      } else {
        // If adding new, clear form for next item
        setFormData((prev) => ({
          ...prev,
          name: "",
          quantity: "",
          unit: "",
          originalPrice: "",
          discountPercentage: "",
          discountPrice: "",
          totalAmount: "",
          hsnSac: "",
          category: "",
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving item ❌");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center">
      <div
        className="bg-white w-100 p-2 rounded-4 shadow-lg"
        style={{ maxWidth: "1400px" }}
      >
        <div className="mb-4">
          <h2 className="fw-semibold">
            {itemId ? "✏️ Edit Item" : "📦 Add New Item"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4 px-2">
            <div className="col-md-4">
              <label className="form-label fw-medium">Item Name</label>
              <input
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Quantity</label>
              <input
                className="form-control"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Unit</label>
              <select
                className="form-select"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select Unit</option>
                <option>pcs</option>
                <option>kg</option>
                <option>g</option>
                <option>liter</option>
                <option>ml</option>
                <option>box</option>
              </select>
            </div>
          </div>

          <div className="row g-4 mt-1 px-2">
            <div className="col-md-4">
              <label className="form-label fw-medium">Original Amount</label>
              <input
                className="form-control"
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Discount %</label>
              <input
                className="form-control"
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Discount Amount</label>
              <input
                className="form-control"
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-4 mt-1 px-2">
            <div className="col-md-4">
              <label className="form-label fw-medium">Total Amount</label>
              <input
                className="form-control"
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Company Name</label>
              <input
                className="form-control"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                readOnly
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Company Phone No</label>
              <input
                className="form-control"
                name="companyNumber"
                value={formData.companyNumber}
                onChange={handleChange}
                readOnly
                required
              />
            </div>
          </div>

          <div className="row g-4 mt-1 px-2">
            <div className="col-md-4">
              <label className="form-label fw-medium">HSN / SAC</label>
              <input
                type="number"
                className="form-control"
                name="hsnSac"
                value={formData.hsnSac}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Item Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Hardware</option>
                <option>Consumables</option>
                <option>Service</option>
                <option>Others</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 mt-5 pt-4 mb-2 me-5 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3"
              onClick={() => {
                const params = new URLSearchParams({
                  companyName: formData.companyName,
                  companyNumber: formData.companyNumber,
                  supplierId: formData.supplierId,
                });

                router.push(`/dashboard/Invoice?${params.toString()}`);
              }}
            >
              Discard
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 fw-semibold rounded-3"
            >
              {itemId ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- END OF YOUR LOGIC COMPONENT ---

// ✅ MAIN EXPORT WRAPPED IN SUSPENSE TO CLEAR VERCEL ERROR
export default function Additem() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading Form...</div>}>
      <AddItemForm />
    </Suspense>
  );
}