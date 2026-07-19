import { useEffect, useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";

/*
|--------------------------------------------------------------------------
| JobForm
|--------------------------------------------------------------------------
| Why this file exists:
| - Shared between Create Job and Edit Job.
| - Owns only local form state.
| - Does not make API calls.
| - Parent (Jobs.jsx) decides what happens on submit.
|--------------------------------------------------------------------------
*/

const INITIAL_FORM = {
  title: "",
  description: "",
};

export default function JobForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // Populate fields when editing.
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error while typing.
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Job Title */}
      <Input
        label="Job Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Backend Developer"
        required
        error={errors.title}
      />

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink flex items-center">
          Job Description
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>

        <textarea
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the role..."
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
            errors.description
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-accent focus:border-accent"
          }`}
        />

        {errors.description && (
          <p className="text-xs text-red-600 font-medium mt-0.5 animate-slide-in">
            {errors.description}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={submitting}
        >
          {initialData ? "Update Job" : "Create Job"}
        </Button>
      </div>
    </form>
  );
}