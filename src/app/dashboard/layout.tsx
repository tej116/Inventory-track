"use client";

import { useRouter, usePathname } from "next/navigation";
import "./DashBoard1/layout.css";
import { useEffect,useState } from "react";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();


    const [hasPendingItems, setHasPendingItems] = useState(false);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("purchase_item_ids") || "[]");
    setHasPendingItems(items.length > 0);
  }, [pathname]);

  // THIS IS THE LOCK FUNCTION
const safeNavigate = (targetPath: string) => {
    const items = JSON.parse(localStorage.getItem("purchase_item_ids") || "[]");
    
    // 1. Check if the user is currently on an EDIT page
    // (Search for itemId in the current browser URL)
    const isCurrentlyEditing = typeof window !== "undefined" && window.location.search.includes("itemId=");

    // 2. If we are editing, DO NOT lock the navigation.
    if (isCurrentlyEditing) {
      router.push(targetPath);
      return;
    }

    // 3. Normal Lock Logic: If user has NEW items and tries to leave AddItem/Invoice
    if (items.length > 0 && !targetPath.includes("Invoice") && !targetPath.includes("AddItem")) {
      const supplier = JSON.parse(localStorage.getItem("pending_supplier") || "{}");
      
      alert("⚠️ Access Blocked: You must complete the invoice details for the NEW items you just added.");
      
      const params = new URLSearchParams(supplier);
      router.push(`/dashboard/Invoice?${params.toString()}`);
      return;
    }

    // Otherwise, allow normal navigation
    router.push(targetPath);
  };
  
  const isActive = (path: string) => pathname === path ? "nav-item active" : "nav-item";

  
  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="app-sidebar">
        <div className="brand">
          <img
            src="/inventory.jpg"
            style={{ width: "25%" }}
            alt="Inventory"
          />
          <h2 className="logo-text">InvTrack</h2>
        </div>

        <nav className="nav-menu">
          <div className={isActive("/dashboard")}  onClick={() => safeNavigate("/dashboard/DashBoard1")}>
            🏠 Dashboard
          </div>

          <div className={isActive("/distribute")} onClick={() => safeNavigate("/dashboard/IssuedItems")}>
          📦 IssuedItems
          </div>

          <div className={isActive("/suppliers")}onClick={() => safeNavigate("/dashboard/Supplier")}>
            🚚 Suppliers
          </div>

          <div className={isActive("/ShowAddedItems")} onClick={() => safeNavigate("/dashboard/ShowAddedItems")}>
            🏠 ShowAddedItems
          </div>

          <div className={isActive("/PurchaseHistory")} onClick={() => safeNavigate("/dashboard/PurchaseHistory")}>🕘 Purchase History</div>
        </nav>

        <button className="logout-button" onClick={()=>window.location.href="/"}>↩ Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-container">
        {/* <header className="main-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search inventory..." />
          </div>

          <div className="user-section">
            <span>🔔</span>
            <span>Admin User</span>
            <div className="user-avatar">JD</div>
          </div>
        </header> */}

        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
