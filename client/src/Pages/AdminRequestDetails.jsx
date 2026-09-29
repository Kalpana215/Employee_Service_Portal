import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./AdminRequestDetails.css";

function AdminRequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRequest = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/requests/admin/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequest(response.data.request);
        setSelectedStatus(response.data.request.status);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to retrieve service request"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setIsUpdating(true);
    setUpdateMessage("");
    setUpdateError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/requests/${id}/status`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequest(response.data.request);
      setSelectedStatus(response.data.request.status);
      setUpdateMessage(response.data.message);
    } catch (requestError) {
      setUpdateError(
        requestError.response?.data?.message || "Failed to update request status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (value) => new Date(value).toLocaleString();

  return (
    <div className="admin-details-shell">
      <header className="admin-details-header">
        <h1>Employee Service Portal</h1>
        <div className="admin-details-header-actions">
          <button onClick={() => navigate("/admin/requests")}>All Requests</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-details-main">
        <div className="admin-details-title">
          <p>Request record</p>
          <h2>Request Details</h2>
        </div>

        {isLoading ? (
          <p className="admin-details-message">Loading request...</p>
        ) : error ? (
          <p className="admin-details-message admin-details-error" role="alert">
            {error}
          </p>
        ) : request ? (
          <section className="admin-details-panel" aria-label="Service request details">
            <dl className="admin-details-grid">
              <div>
                <dt>Employee Name</dt>
                <dd>{request.employee?.name || "Employee unavailable"}</dd>
              </div>
              <div>
                <dt>Employee Email</dt>
                <dd>{request.employee?.email || "-"}</dd>
              </div>
              <div>
                <dt>Request Type</dt>
                <dd>{request.requestType}</dd>
              </div>
              <div>
                <dt>Subject</dt>
                <dd>{request.subject}</dd>
              </div>
              <div className="admin-details-description">
                <dt>Description</dt>
                <dd>{request.description}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{request.priority}</dd>
              </div>
              <div>
                <dt>Current Status</dt>
                <dd>
                  <span
                    className={`admin-details-status status-${request.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {request.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Created Date</dt>
                <dd>{formatDate(request.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated Date</dt>
                <dd>{formatDate(request.updatedAt)}</dd>
              </div>
            </dl>

            <form className="admin-status-editor" onSubmit={handleStatusUpdate}>
              <label htmlFor="request-status">Update Status</label>
              <select
                id="request-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={isUpdating}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                type="submit"
                disabled={isUpdating || selectedStatus === request.status}
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
              {updateMessage && (
                <p className="admin-status-feedback" role="status">
                  {updateMessage}
                </p>
              )}
              {updateError && (
                <p className="admin-status-feedback admin-details-error" role="alert">
                  {updateError}
                </p>
              )}
            </form>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default AdminRequestDetails;