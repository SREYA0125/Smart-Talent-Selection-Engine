import { useEffect, useState } from "react";

import JobCard from "../../components/jobs/JobCard";
import JobForm from "../../components/jobs/JobForm";
import DeleteDialog from "../../components/jobs/DeleteDialog";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../../services/jobService";

/*
|--------------------------------------------------------------------------
| Jobs Page
|--------------------------------------------------------------------------
| Responsibilities:
| - Fetch recruiter jobs
| - Create jobs
| - Edit jobs
| - Delete jobs
| - Display loading & empty states
|--------------------------------------------------------------------------
*/

export default function Jobs() {
  // ---------------------------
  // Page State
  // ---------------------------

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  // ---------------------------
  // Selected Job
  // ---------------------------

  const [selectedJob, setSelectedJob] = useState(null);

  // ---------------------------
  // Modal State
  // ---------------------------

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

    // ---------------------------
  // Load Jobs
  // ---------------------------

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getJobs();

      // Backend returns { success, jobs }
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);


    // ---------------------------
  // Create Job
  // ---------------------------

  const handleCreateJob = async (formData) => {
    try {
      setSubmitting(true);

      const response = await createJob(formData);

      // Add the newly created job to the top of the list.
      setJobs((prev) => [response.job, ...prev]);

      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------
  // Edit Job
  // ---------------------------

  const handleEditJob = async (formData) => {
    try {
      setSubmitting(true);

      const response = await updateJob(selectedJob.id, formData);

      setJobs((prev) =>
        prev.map((job) =>
          job.id === selectedJob.id ? response.job : job
        )
      );

      setSelectedJob(null);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update job.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------
  // Delete Job
  // ---------------------------

  const handleDeleteJob = async () => {
    try {
      setDeleting(true);

      await deleteJob(selectedJob.id);

      // Remove immediately from UI (no refetch)
      setJobs((prev) =>
        prev.filter((job) => job.id !== selectedJob.id)
      );

      setSelectedJob(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------
  // View Job
  // ---------------------------

  const handleView = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  // ---------------------------
  // Edit Job
  // ---------------------------

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  // ---------------------------
  // Delete Job
  // ---------------------------

  const handleDelete = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };



    // ---------------------------
  // Render
  // ---------------------------

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Jobs
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your job postings.
            </p>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            + Create Job
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No jobs yet
            </h2>

            <p className="mt-2 text-gray-500">
              Create your first job posting.
            </p>

            <Button
              className="mt-6"
              onClick={() => setShowCreateModal(true)}
            >
              Create Job
            </Button>
          </div>
        )}

        {/* Job List */}
        <div className="space-y-5">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Create Job */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Job"
      >
        <JobForm
          onSubmit={handleCreateJob}
          onCancel={() => setShowCreateModal(false)}
          submitting={submitting}
        />
      </Modal>

      {/* -------------------------------- */}
      {/* Edit Job */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedJob(null);
        }}
        title="Edit Job"
      >
        <JobForm
          initialData={selectedJob}
          onSubmit={handleEditJob}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
          submitting={submitting}
        />
      </Modal>

      {/* -------------------------------- */}
      {/* Delete */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedJob(null);
        }}
        title="Delete Job"
      >
        <DeleteDialog
          job={selectedJob}
          deleting={deleting}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedJob(null);
          }}
          onConfirm={handleDeleteJob}
        />
      </Modal>

      {/* -------------------------------- */}
      {/* View */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedJob(null);
        }}
        title="Job Details"
      >
        {selectedJob && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedJob.title}
              </h2>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  selectedJob.status === "OPEN"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedJob.status}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-gray-600">
                {selectedJob.description}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Created on{" "}
              {new Date(selectedJob.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}