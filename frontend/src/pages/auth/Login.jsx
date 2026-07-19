import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!form.password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setSubmitting(true);

    try {
      // All the actual work — the API call, storing the token, setting
      // context state — happens inside AuthContext's login(). This
      // component's only responsibilities are collecting form input and
      // turning success/failure into UI (navigate, or show an error).
      await login(form.email, form.password);
      showToast("Login successful!", "success");
      navigate("/dashboard");
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-ink mb-6">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            required
            error={fieldErrors.email}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            required
            error={fieldErrors.password}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={submitting} className="w-full">
            Log in
          </Button>
        </form>

        <p className="text-sm text-slate mt-4">
          No account?{" "}
          <Link to="/register" className="text-accent">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
