import { Briefcase, Calendar, FileText } from "lucide-react";

/*
|--------------------------------------------------------------------------
| RecentJobs
|--------------------------------------------------------------------------
| Responsibilities
|
| • Display the recruiter's most recently created jobs.
| • Show how many resumes have been uploaded for each job.
| • Display a friendly empty state.
|--------------------------------------------------------------------------
*/

export default function RecentJobs({ jobs = [] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center shadow-sm">
        <Briefcase
          size={48}
          className="mx-auto text-gray-400"
        />

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          No Jobs Yet
        </h2>

        <p className="mt-2 text-gray-500">
          Create your first job to begin hiring candidates.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center gap-3">
        <Briefcase
          size={24}
          className="text-accent"
        />

        <h2 className="text-xl font-semibold text-gray-800">
          Recent Jobs
        </h2>
      </div>

      <div className="space-y-4">

        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-lg border p-4 transition hover:bg-gray-50"
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold text-gray-800">
                  {job.title}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">

                  <Calendar size={16} />

                  <span>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>

                </div>

              </div>

              <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">

                <FileText size={16} />

                {job.resumeCount} Resume
                {job.resumeCount !== 1 && "s"}

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}