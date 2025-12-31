"use client";
import { useState, useEffect } from "react";
import "./issuedItems.css";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to trigger email via backend
  const sendLowStockAlert = async (lowStockItems) => {
    try {
      await fetch("/api/sendAlertMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lowStockItems }),
      });
    } catch (err) {
      console.error("Failed to trigger email alert", err);
    }
  };

  // Fetch data from API based on search
  const fetchItems = async (search = "") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/IssuedItems?search=${search}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setItems(data);

      // Check for low stock items (less than 5) and trigger mail
      const lowStock = data.filter((item) => item.remaining < 5);
      if (lowStock.length > 0) {
        sendLowStockAlert(lowStock);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems(searchTerm);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="items-container">
      <div className="items-card">
        <div className="items-header-flex">
          <h5 className="items-title">📦 Item Distribution</h5>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Total Stock</th>
                <th>Distributed</th>
                <th>Remaining</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center" }}>Loading...</td></tr>
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td className="item-name">{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td className="distributed" style={{ color: "orange", fontWeight: "bold" }}>
                        {item.distributed}
                    </td>
                    <td className="remaining" style={{ color: item.remaining < 5 ? "red" : "green", fontWeight: "bold" }}>
                        {item.remaining}
                    </td>
                    <td>
                      <button 
                        className="distribute-btn" 
                        onClick={() => router.push(`/dashboard/DistributeItems?id=${item.itemId}&name=${item.name}&unit=${item.unit}&remaining=${item.remaining}`)}
                      >
                        Distribute
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}