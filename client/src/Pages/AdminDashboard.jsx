import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCounts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/requests/admin/counts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCounts(response.data.counts);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load request counts"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cards = [
    { label: "Total Requests", key: "total", className: "total" },
    { label: "Pending", key: "pending", className: "pending" },
    { label: "In Progress", key: "inProgress", className: "in-progress" },
    { label: "Completed", key: "completed", className: "completed" },
  ];

  return (
    <div className="admin-dashboard-shell">
      <header className="admin-dashboard-header">
        <div className="admin-header-content">
          <h1>Employee Service Portal</h1>
          <button className="admin-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-dashboard-main">
        <div className="admin-dashboard-heading">
          <div>
            <p className="admin-eyebrow">Service operations</p>
            <h2>Admin Dashboard</h2>
          </div>
          <button
            className="admin-primary-button"
            onClick={() => navigate("/admin/requests")}
          >
            View All Requests
          </button>
        </div>

        {isLoading ? (
          <p className="admin-dashboard-message">Loading request totals...</p>
        ) : error ? (
          <p className="admin-dashboard-message admin-dashboard-error" role="alert">
            {error}
          </p>
        ) : (
          <section className="admin-stats-grid" aria-label="Request totals">
            {cards.map((card) => (
              <article
                className={`admin-stat-card admin-stat-${card.className}`}
                key={card.key}
              >
                <h3>{card.label}</h3>
                <p>{counts[card.key]}</p>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;