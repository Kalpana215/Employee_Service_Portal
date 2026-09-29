import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      navigate("/login");
      return;
    }

    setEmployee(JSON.parse(user));
    fetchRequestCounts(token);
  }, [navigate]);

  const fetchRequestCounts = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/requests/counts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCounts(response.data.counts);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching counts:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleShowRequests = async () => {
    if (showRequests) {
      setShowRequests(false);
      return;
    }

    setShowRequests(true);
    setIsLoadingRequests(true);
    setRequestsError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequestsError(
        error.response?.data?.message || "Failed to retrieve service requests"
      );
    } finally {
      setIsLoadingRequests(false);
    }
  };

  if (!employee) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Employee Service Portal</h1>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {employee.name}! 👋</h2>
          <p>Manage your service requests below</p>
        </div>

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">📊</div>
                <div className="stat-info">
                  <h3>Total Requests</h3>
                  <p className="stat-count">{counts.total}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-info">
                  <h3>Pending</h3>
                  <p className="stat-count">{counts.pending}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon progress">🔄</div>
                <div className="stat-info">
                  <h3>In Progress</h3>
                  <p className="stat-count">{counts.inProgress}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon completed">✅</div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <p className="stat-count">{counts.completed}</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/create-request")}
              >
                + Create Service Request
              </button>
              <button className="btn btn-secondary" onClick={handleShowRequests}>
                {showRequests ? "Hide My Requests" : "My Requests"}
              </button>
            </div>

            {showRequests && (
              <section className="requests-section" aria-live="polite">
                <h2>My Requests</h2>
                {isLoadingRequests ? (
                  <p className="requests-message">Loading requests...</p>
                ) : requestsError ? (
                  <p className="requests-message requests-error">{requestsError}</p>
                ) : requests.length === 0 ? (
                  <p className="requests-message">You have not submitted any requests yet.</p>
                ) : (
                  <div className="requests-list">
                    {requests.map((request) => (
                      <article className="request-item" key={request._id}>
                        <div className="request-item-heading">
                          <h3>{request.subject}</h3>
                          <span className={`request-status status-${request.status.toLowerCase().replaceAll(" ", "-")}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="request-meta">
                          {request.requestType} · {request.priority} priority ·{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        <p className="request-description">{request.description}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
