import { Brain, LoaderCircle } from "lucide-react";

/*
|--------------------------------------------------------------------------
| AnalysisLoader
|--------------------------------------------------------------------------
| Responsibilities:
| - Display a dedicated loading state while AI is analyzing a resume.
| - Separate from the generic Loader because AI analysis is a longer
|   operation and deserves more meaningful feedback.
|--------------------------------------------------------------------------
*/

export default function AnalysisLoader() {
  return (
    <div className="rounded-xl border bg-white p-10 shadow-sm">
      <div className="flex flex-col items-center text-center">

        {/* Animated Icon */}
        <div className="relative">
          <Brain
            size={60}
            className="text-accent"
          />

          <LoaderCircle
            size={24}
            className="absolute -right-2 -bottom-2 animate-spin text-blue-600"
          />
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">
          AI is analyzing this resume...
        </h2>

        {/* Description */}
        <p className="mt-3 max-w-md text-gray-500">
          Please wait while our AI evaluates the candidate's
          skills, strengths, weaknesses, and overall suitability
          for the selected job.
        </p>

        {/* Progress Bar Animation */}
        <div className="mt-8 h-2 w-72 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent"></div>
        </div>

        <p className="mt-3 text-sm text-gray-400">
          This usually takes only a few seconds.
        </p>

      </div>
    </div>
  );
}