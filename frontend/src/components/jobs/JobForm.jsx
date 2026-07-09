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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Job Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Job Title
        </label>

        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Backend Developer"
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-500">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Job Description
        </label>

        <textarea
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the role..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
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
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : initialData
            ? "Update Job"
            : "Create Job"}
        </Button>
      </div>
    </form>
  );
}