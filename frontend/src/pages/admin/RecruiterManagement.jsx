import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, Pencil, Trash2, Search } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
import { TableSkeleton } from "../../components/common/Skeletons.jsx";
import Modal from "../../components/common/Modal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import {
  getRecruiters,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
  exportRecruiters,
} from "../../services/adminService.js";
import { useToast } from "../../contexts/ToastContext.jsx";

/*
|--------------------------------------------------------------------------
| Recruiter Management Page
|--------------------------------------------------------------------------
| Allows administrators to view all recruiter accounts, create new accounts,
| edit their metadata/passwords, or delete them from the platform.
|--------------------------------------------------------------------------
*/

export default function RecruiterManagement() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Export Loading States
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const { showToast } = useToast();

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null); // null means "Create Mode"
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recruiterToDelete, setRecruiterToDelete] = useState(null);
  const [deletingRecruiter, setDeletingRecruiter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECRUITER",
  });

  const fetchRecruitersList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search;
      }

      const res = await getRecruiters(params);
      setRecruiters(res.recruiters || []);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load recruiters list.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchRecruitersList();
  }, [fetchRecruitersList]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const params = { format: "csv" };
      if (search.trim()) {
        params.search = search;
      }
      const data = await exportRecruiters(params);
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `recruiter_activity_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Recruiter activity CSV report exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export CSV report.", "error");
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const params = { format: "json" };
      if (search.trim()) {
        params.search = search;
      }
      const data = await exportRecruiters(params);
      const { recruiters: rows } = data;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Pop-up blocker is active. Please enable pop-ups to generate reports.", "warning");
        return;
      }

      const rowsHtml = rows.map((row, idx) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 10px;text-align:center;font-weight:bold;color:#4b5563;">#${idx + 1}</td>
          <td style="padding:12px 10px;">
            <div style="font-weight:600;color:#111827;font-size:14px;">${row.name}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">${row.email}</div>
          </td>
          <td style="padding:12px 10px;text-align:center;font-weight:bold;color:#1f2937;">${row.jobsPosted}</td>
          <td style="padding:12px 10px;text-align:center;color:#4b5563;">${row.resumesProcessed}</td>
          <td style="padding:12px 10px;text-align:center;">
            <span style="display:inline-block;padding:3px 8px;border-radius:10px;font-weight:600;font-size:12px;background:#f3f4f6;color:#374151;">
              ${row.averageCandidateScore}%
            </span>
          </td>
          <td style="padding:12px 10px;font-size:12px;color:#4b5563;text-align:right;">${new Date(row.lastActiveDate).toLocaleDateString()}</td>
        </tr>
      `).join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Recruiter Activity Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; max-width: 1000px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 12px 10px; font-size: 11px; text-transform: uppercase; font-weight: 600; color: #4b5563; text-align: left; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 20px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
            @media print {
              body { padding: 0; margin: 15mm; font-size: 13px; }
              .footer { position: fixed; bottom: 0; left: 0; right: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Smart Talent Selection Engine</div>
              <h1 style="font-size:24px;margin:5px 0 0 0;color:#111827;">Recruiter Activity Report</h1>
              <h2 style="font-size:14px;font-weight:500;color:#6b7280;margin:4px 0 0 0;">Platform Statistics</h2>
            </div>
            <div style="text-align:right; font-size:12px; color:#4b5563; line-height:1.4;">
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Admin View:</strong> Platform Wide</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:50px;text-align:center;">#</th>
                <th>Recruiter Details</th>
                <th style="width:100px;text-align:center;">Jobs Posted</th>
                <th style="width:120px;text-align:center;">Resumes Processed</th>
                <th style="width:150px;text-align:center;">Avg Candidate Score</th>
                <th style="width:120px;text-align:right;">Last Active</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <span>Confidential Administrator Report</span>
            <span>Page 1 of 1</span>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      showToast("Recruiter activity PDF report generated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF report.", "error");
    } finally {
      setExportingPDF(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!editingRecruiter) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setEditingRecruiter(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "RECRUITER",
    });
    setActionError("");
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (recruiter) => {
    setEditingRecruiter(recruiter);
    setFormData({
      name: recruiter.name,
      email: recruiter.email,
      password: "", // password stays blank unless they want to change it
      role: recruiter.role,
    });
    setActionError("");
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActionError("");
    setSubmitting(true);

    try {
      if (editingRecruiter) {
        // Edit mode
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password.trim() !== "") {
          payload.password = formData.password;
        }
        await updateRecruiter(editingRecruiter.id, payload);
      } else {
        // Create mode
        await createRecruiter(formData);
      }

      setModalOpen(false);
      showToast(editingRecruiter ? "Recruiter updated successfully!" : "Recruiter created successfully!", "success");
      fetchRecruitersList();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to process request.";
      setActionError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    setRecruiterToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!recruiterToDelete) return;
    try {
      setDeletingRecruiter(true);
      setActionError("");
      await deleteRecruiter(recruiterToDelete.id);
      showToast("Recruiter deleted successfully!", "success");
      fetchRecruitersList();
      setShowDeleteModal(false);
      setRecruiterToDelete(null);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to delete recruiter.";
      showToast(errMsg, "error");
    } finally {
      setDeletingRecruiter(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recruiters</h1>
          <p className="mt-2 text-gray-500">
            Manage recruiter profiles and platform administrators.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add User
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <SearchBar
          value={search}
          onSearch={handleSearch}
          placeholder="Search by recruiter name or email..."
        />
        <div className="flex gap-2 shrink-0">
          <button
            disabled={exportingCSV || recruiters.length === 0}
            onClick={handleExportCSV}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 transition font-medium text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingCSV ? "Exporting..." : "Export CSV"}
          </button>
          <button
            disabled={exportingPDF || recruiters.length === 0}
            onClick={handleExportPDF}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 transition font-medium text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPDF ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Unable to load recruiters"
          message={error}
          onRetry={fetchRecruitersList}
        />
      )}

      {/* Recruiters List Table */}
      {!error && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          {initialLoading || loading ? (
            <TableSkeleton rows={5} />
          ) : recruiters.length === 0 ? (
            search ? (
              <EmptyState
                icon={Search}
                title="No recruiters match your search"
                description="Try searching with a different name or email address."
              />
            ) : (
              <EmptyState
                icon={Users}
                title="No recruiters found"
                description="Add your first recruiter to grant access to the talent selection pipeline."
                actionLabel="Add Recruiter"
                onAction={handleOpenCreateModal}
              />
            )
          ) : (
            <>
              <table className="w-full border-collapse text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-center">Jobs Posted</th>
                    <th className="px-6 py-4 text-center">Resumes Processed</th>
                    <th className="px-6 py-4 text-center">Analyses Completed</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                  {recruiters.map((recruiter) => (
                    <tr key={recruiter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{recruiter.name}</td>
                      <td className="px-6 py-4">{recruiter.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            recruiter.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {recruiter.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{recruiter.stats?.totalJobs || 0}</td>
                      <td className="px-6 py-4 text-center">{recruiter.stats?.totalResumes || 0}</td>
                      <td className="px-6 py-4 text-center">{recruiter.stats?.totalAnalyses || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(recruiter)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Edit User"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(recruiter.id, recruiter.name)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingRecruiter ? "Edit Recruiter" : "Create New User"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          {actionError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {actionError}
            </div>
          )}

          <Input
            label="Name"
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="John Doe"
            error={formErrors.name}
          />

          <Input
            label="Email"
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="john@example.com"
            error={formErrors.email}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            required={!editingRecruiter}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder={
              editingRecruiter
                ? "Leave blank to keep current password"
                : "Minimum 6 characters"
            }
            error={formErrors.password}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-ink flex items-center">
              Role
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
            >
              <option value="RECRUITER">RECRUITER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingRecruiter ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Recruiter"
        message={`Are you sure you want to delete the recruiter "${recruiterToDelete?.name}"? This action will permanently delete all jobs and candidate analyses associated with this account.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        loading={deletingRecruiter}
      />
    </div>
  );
}
