import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Upload,
  Brain,
  Trophy,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| QuickActions
|--------------------------------------------------------------------------
| Responsibilities
|
| • Display shortcuts to the application's main features.
| • Improve recruiter workflow.
|--------------------------------------------------------------------------
*/

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Create Job",
      description: "Create a new job posting",
      icon: <Briefcase size={24} />,
      color: "bg-blue-500",
      path: "/jobs",
    },
    {
      title: "Upload Resumes",
      description: "Upload candidate resumes",
      icon: <Upload size={24} />,
      color: "bg-green-500",
      path: "/resumes",
    },
    {
      title: "AI Analysis",
      description: "Analyze candidate resumes",
      icon: <Brain size={24} />,
      color: "bg-purple-500",
      path: "/analysis",
    },
    {
      title: "Candidate Ranking",
      description: "View AI rankings",
      icon: <Trophy size={24} />,
      color: "bg-yellow-500",
      path: "/ranking",
    },
  ];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">
        Quick Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-4 rounded-lg border p-4 text-left transition hover:bg-gray-50 hover:shadow"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${action.color}`}
            >
              {action.icon}
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                {action.title}
              </h3>

              <p className="text-sm text-gray-500">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}