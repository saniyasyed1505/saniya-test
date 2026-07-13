"use client";

import { useState } from "react";

export default function TestApiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleGetProducts = async () => {
    setLoading(true);
    setStatus("loading");
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setData(result);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setData({ error: "Failed to fetch products" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Test API Route</h1>
      
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button 
          onClick={handleGetProducts} 
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Loading..." : "GET Products"}
        </button>

        {/* Status Badge */}
        {status !== "idle" && (
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "50px",
            fontSize: "0.875rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            backgroundColor: status === "success" ? "#d4edda" : status === "error" ? "#f8d7da" : "#fff3cd",
            color: status === "success" ? "#155724" : status === "error" ? "#721c24" : "#856404"
          }}>
            {status}
          </span>
        )}
      </div>

      {/* JSON Response Display */}
      <div style={{ 
        backgroundColor: "#1e1e1e", 
        color: "#d4d4d4", 
        padding: "1rem", 
        borderRadius: "5px",
        minHeight: "150px"
      }}>
        {data ? (
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <span style={{ color: "#6e7681" }}>No data yet. Click the button to fetch.</span>
        )}
      </div>
    </div>
  );
}
