import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "./Register.css";

const PASSWORD_REQUIREMENTS = {
  minLength: { regex: /.{8,}/, label: "At least 8 characters" },
  uppercase: { regex: /[A-Z]/, label: "One uppercase letter" },
  lowercase: { regex: /[a-z]/, label: "One lowercase letter" },
  number: { regex: /\d/, label: "One number" },
  special: { regex: /[!@#$%^&*(),.?":{}|<>]/, label: "One special character" },
};

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const validatePassword = (password) => {
    return Object.entries(PASSWORD_REQUIREMENTS).map(([key, req]) => ({
      name: key,
      label: req.label,
      isValid: req.regex.test(password),
    }));
  };

  const isPasswordValid = (password) => {
    return validatePassword(password).every((req) => req.isValid);
  };

  const passwordValidation = validatePassword(formData.password);
  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password &&
    isPasswordValid(formData.password);

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
        `${API_BASE_URL}/api/auth/register`,
        formData
      );

      setMessageType("success");
      setMessage(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Employee Service Portal</h1>
          <h2>Create Account</h2>
          <p className="register-subtitle">Join our team and manage your services</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
              placeholder="Create a strong password"
              className="form-input"
              required
            />
            {showPasswordRequirements && formData.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password Requirements:</p>
                <ul className="requirements-list">
                  {passwordValidation.map((req) => (
                    <li key={req.name} className={req.isValid ? "valid" : "invalid"}>
                      <span className="requirement-icon">
                        {req.isValid ? "✓" : "✗"}
                      </span>
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <div className={`message ${messageType}`}>
            <span>{message}</span>
          </div>
        )}

        <div className="register-footer">
          <p className="login-text">
            Already have an account? <button
              type="button"
              className="login-link"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;