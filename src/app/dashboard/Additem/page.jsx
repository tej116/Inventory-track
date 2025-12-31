'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Additem() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedData = { ...prev, [name]: value };

      if (name === "discountPercentage" && prev.originalPrice) {
        const discountAmount =
          (Number(prev.originalPrice) * Number(value)) / 100;

        updatedData.discountPrice = discountAmount.toFixed(2);
        updatedData.totalAmount = Number(prev.originalPrice) - discountAmount;
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.companyNumber.length !== 10) {
      alert("give the proper phone number");
      return;
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

      if (!isEditMode) {
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

      alert(isEditMode ? "Item updated successfully ✅" : "Item added successfully ✅");

      if (isEditMode) {
        router.push("/dashboard/ShowAddedItems");
      } else {
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
      {/* All your JSX remains unchanged here */}
    </div>
  );
}

export default Additem;
