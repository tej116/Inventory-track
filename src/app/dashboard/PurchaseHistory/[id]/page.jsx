"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./id.css";

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/PurchaseHistory/${id}`);
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="loader-container">Loading Details...</div>;
  if (!data) return <div className="loader-container">Purchase record not found.</div>;

  const { purchase, supplierName, items } = data;

  return (
    <div className="details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => router.back()}>← Back</button>
        <div className="header-right">
          <div className="info-badge">
            <span className="label">Invoice:</span>
            <span className="value">{purchase.invoiceNumber}</span>
          </div>
          <div className="info-badge">
            <span className="label">Supplier:</span>
            <span className="value">{supplierName}</span>
          </div>
        </div>
      </div>

      <div className="details-card">
        <h3 className="card-title">Purchased Items Details</h3>
        <div className="table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Total Purchased</th>
                <th>Distributed</th>
                <th>Remaining</th>
                <th>Original Price</th>
                <th>Discount Price</th>
                <th>Final Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td className="item-name">{item.name}</td> {/* Fix: item.name */}
                  <td>{item.unit}</td>
                  <td className="stock-cell-total">{item.purchasedQuantity}</td>
                  {/* ✅ UPDATED DISTRIBUTED CELL */}
                  <td className="stock-cell-dist distribution-cell">
                    {item.totalDistributed}
                    {item.distributionDetails.length > 0 && (
                      <div className="distribution-tooltip">
                        <h4>Distribution Breakdown</h4>
                        <ul>
                          {item.distributionDetails.map((dist, i) => (
                            <li key={i}>
                              <span className="dist-place">{dist.place}:</span> 
                              <span className="dist-count">{dist.count} {item.unit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>              
                  <td className="stock-cell-rem">{item.remainingStock}</td>
                  <td>₹{item.originalPrice?.toLocaleString()}</td>
                  <td className="discount-text">₹{item.discountPrice?.toLocaleString()}</td>
                  <td className="final-price">₹{item.finalPrice?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="summary-section">
          <div className="summary-box">
            <div className="summary-row">
              <span>CGST ({purchase.cgstPercent}%)</span>
              <span>₹{purchase.cgst?.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>SGST ({purchase.sgstPercent}%)</span>
              <span>₹{purchase.sgst?.toLocaleString()}</span>
            </div>
            <div className="summary-row total-tax">
              <span>Total GST</span>
              <span>₹{purchase.totalTaxAmount?.toLocaleString()}</span>
            </div>
            <div className="summary-row total-cost">
              <span>Grand Total</span>
              <span>₹{purchase.totalAmountAfterTax?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}