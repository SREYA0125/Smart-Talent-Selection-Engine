import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
    if (!form.name.trim()) {
      errors.name = "Full name is required";
    }
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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
      // register() in AuthContext already stores the returned token and
      // sets the user in context — there is no separate "now log in" step
      // here, because the backend returns a token directly from
      // POST /api/auth/register. This satisfies "automatically log the
      // user in" without a second network request.
      await register(form.name, form.email, form.password);
      showToast("Account created successfully!", "success");
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
        <h1 className="text-xl font-semibold text-ink mb-6">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="name"
            name="name"
            type="text"
            label="Full name"
            value={form.name}
            onChange={handleChange}
            required
            error={fieldErrors.name}
          />
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
            label="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            error={fieldErrors.password}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={submitting} className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-sm text-slate mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-accent">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
