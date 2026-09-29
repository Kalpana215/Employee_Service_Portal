import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./AdminRequests.css";

function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/requests/admin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequests(response.data.requests);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to retrieve service requests"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-requests-shell">
      <header className="admin-requests-header">
        <h1>Employee Service Portal</h1>
        <div className="admin-requests-header-actions">
          <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-requests-main">
        <div className="admin-requests-title">
          <div>
            <p>Service operations</p>
            <h2>All Requests</h2>
          </div>
          <span>{requests.length} requests</span>
        </div>

        {isLoading ? (
          <p className="admin-requests-message">Loading requests...</p>
        ) : error ? (
          <p className="admin-requests-message admin-requests-error" role="alert">
            {error}
          </p>
        ) : requests.length === 0 ? (
          <p className="admin-requests-message">No service requests have been submitted.</p>
        ) : (
          <div className="admin-requests-table-wrap">
            <table className="admin-requests-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee Name</th>
                  <th>Employee Email</th>
                  <th>Request Type</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className="request-id">{request._id}</td>
                    <td>{request.employee?.name || "Employee unavailable"}</td>
                    <td>{request.employee?.email || "-"}</td>
                    <td>{request.requestType}</td>
                    <td className="request-subject">{request.subject}</td>
                    <td>{request.priority}</td>
                    <td>
                      <span
                        className={`admin-request-status status-${request.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-request-view"
                        onClick={() =>
                          navigate(`/admin/requests/${request._id}`)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminRequests;