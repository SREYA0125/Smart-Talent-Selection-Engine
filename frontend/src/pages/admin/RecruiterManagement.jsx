import { useEffect, useState } from "react";
import { Users, UserPlus, Pencil, Trash2 } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import {
  getRecruiters,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
} from "../../services/adminService.js";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null); // null means "Create Mode"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECRUITER",
  });

  const fetchRecruitersList = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getRecruiters();
      setRecruiters(res.recruiters || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load recruiters list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitersList();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRecruiter(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "RECRUITER",
    });
    setActionError("");
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
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionError("");

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
      fetchRecruitersList();
    } catch (err) {
      console.error(err);
      setActionError(
        err.response?.data?.message || "Failed to process request."
      );
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the recruiter "${name}"? This action will permanently delete all jobs and candidate analyses associated with this account.`
    );
    if (!confirmed) return;

    try {
      setActionError("");
      await deleteRecruiter(id);
      fetchRecruitersList();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete recruiter.");
    }
  };

  if (loading) {
    return <Loader label="Loading recruiters list..." />;
  }

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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {/* Recruiters List Table */}
      {!error && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
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
              {recruiters.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                    No recruiters found on the platform.
                  </td>
                </tr>
              ) : (
                recruiters.map((recruiter) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingRecruiter ? "Edit Recruiter" : "Create New User"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />

          <Input
            label="Email"
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />

          <Input
            label="Password"
            id="password"
            type="password"
            required={!editingRecruiter}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={
              editingRecruiter
                ? "Leave blank to keep current password"
                : "Minimum 6 characters"
            }
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-ink">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
            >
              <option value="RECRUITER">RECRUITER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRecruiter ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
