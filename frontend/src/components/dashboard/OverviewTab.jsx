import React from "react";

const OverviewTab = ({ tasks }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const stats = {
    total: safeTasks.length,
    posted: safeTasks.filter((t) => t.status === "posted").length,
    accepted: safeTasks.filter((t) => t.status === "accepted").length,
    in_progress: safeTasks.filter((t) => t.status === "in_progress").length,
    completed: safeTasks.filter((t) => t.status === "completed").length,
  };

  const statColors = {
    total: "bg-blue-100 text-blue-800",
    posted: "bg-gray-100 text-gray-800",
    accepted: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Overview</h2>
        <div className="text-sm text-gray-500">
          {safeTasks.length} Total Tasks
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className={`rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 sm:p-4 lg:p-6 text-center font-medium ${statColors[key]}`}
          >
            <h3 className="text-xs sm:text-sm lg:text-base capitalize font-semibold mb-1 sm:mb-2">
              {key.replace("_", " ")}
            </h3>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Actions - Mobile Only 
      <div className="sm:hidden mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-blue-600 font-medium text-sm">Post New Task</div>
            <div className="text-xs text-blue-500 mt-1">Create a new job</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-green-600 font-medium text-sm">View Messages</div>
            <div className="text-xs text-green-500 mt-1">Check chat</div>
          </div>
        </div>
      </div>  */}
      
      {/* Recent Activity Preview - Desktop Only */}
      {safeTasks.length > 0 && (
        <div className="hidden lg:block mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h3>
          <div className="bg-white rounded-lg shadow-sm border">
            {safeTasks.slice(0, 3).map((task, index) => (
              <div key={task._id} className={`p-4 ${index !== 2 ? 'border-b' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>
                  </div>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
