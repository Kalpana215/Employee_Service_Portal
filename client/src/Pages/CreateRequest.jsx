import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./CreateRequest.css";

function CreateRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requestType: "",
    subject: "",
    description: "",
    priority: "Medium",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestTypes = [
    "IT Support",
    "Access Request",
    "Hardware",
    "Software",
    "HR",
    "Other",
  ];

  const priorities = ["Low", "Medium", "High"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/api/requests`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageType("success");
      setMessage("Service request created successfully! Redirecting to dashboard...");

      setFormData({
        requestType: "",
        subject: "",
        description: "",
        priority: "Medium",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.response?.data?.message || "Failed to create service request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.requestType.trim() &&
    formData.subject.trim() &&
    formData.description.trim() &&
    formData.priority.trim();

  return (
    <div className="create-request-container">
      <div className="create-request-card">
        <div className="request-header">
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
          <div className="header-title">
            <h1>Create Service Request</h1>
            <p>Submit a new service request</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label htmlFor="requestType" className="form-label">
              Request Type <span className="required">*</span>
            </label>
            <select
              id="requestType"
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Select Request Type --</option>
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject <span className="required">*</span>
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief subject of your request"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your request"
              className="form-textarea"
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priority <span className="required">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
              required
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>

        {message && (
          <div className={`message ${messageType}`}>
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateRequest;
