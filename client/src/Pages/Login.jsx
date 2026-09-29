import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData
      );

      setMessageType("success");
      setMessage(response.data.message);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setFormData({
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate(
          response.data.user.role === "admin" ? "/admin/dashboard" : "/dashboard"
        );
      }, 1500);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          {/* <a href="#forgot" className="forgot-password">Forgot Password?</a> */}
          <p className="signup-text">
            Don't have an account? <button
              type="button"
              className="signup-link"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </p>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
