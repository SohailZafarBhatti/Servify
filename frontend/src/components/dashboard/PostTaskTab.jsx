import React, { useState, useEffect } from "react";
import taskService from "../../services/taskService";

const PostTaskTab = ({ addTask }) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    date: "",
    location: "",
    category: "",
    priority: "medium",
  });

  const [loading, setLoading] = useState(false);

  // Monitor state changes
  useEffect(() => {
    console.log('taskData state changed:', taskData);
  }, [taskData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called:', { name, value, type: typeof value });
    
    const updatedData = { ...taskData, [name]: value };
    setTaskData(updatedData);
    
    // Log the updated data after setting state
    console.log('Updated taskData:', updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Log the actual form data being submitted
    const formData = new FormData(e.target);
    console.log('=== FORM DATA DEBUG ===');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value} (type: ${typeof value})`);
    }
    
    const { title, description, budgetMin, budgetMax, date, location, category, priority } = taskData;

    // Debug: Log the form data
    console.log('=== POST TASK TAB DEBUG ===');
    console.log('Form data extracted:', { title, description, budgetMin, budgetMax, date, location, category, priority });
    console.log('Full taskData state:', taskData);
    console.log('Budget validation check:', {
      budgetMin: budgetMin,
      budgetMax: budgetMax,
      budgetMinType: typeof budgetMin,
      budgetMaxType: typeof budgetMax,
      budgetMinTruthy: !!budgetMin,
      budgetMaxTruthy: !!budgetMax
    });

    // Validate all required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !budgetMin ||
      !budgetMax ||
      !date ||
      !location?.trim() ||
      !category?.trim() ||
      !priority?.trim()
    ) {
      console.log('Validation failed - missing fields detected');
      console.log('Missing fields:', {
        title: !title?.trim(),
        description: !description?.trim(),
        budgetMin: !budgetMin,
        budgetMax: !budgetMax,
        date: !date,
        location: !location?.trim(),
        category: !category?.trim(),
        priority: !priority?.trim()
      });
      
      // Create a more specific error message
      const missingFields = [];
      if (!title?.trim()) missingFields.push('Title');
      if (!description?.trim()) missingFields.push('Description');
      if (!budgetMin) missingFields.push('Budget Min');
      if (!budgetMax) missingFields.push('Budget Max');
      if (!date) missingFields.push('Date');
      if (!location?.trim()) missingFields.push('Location');
      if (!category?.trim()) missingFields.push('Category');
      if (!priority?.trim()) missingFields.push('Priority');
      
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Additional validation for budget fields
    if (isNaN(Number(budgetMin)) || isNaN(Number(budgetMax))) {
      alert('Budget values must be valid numbers');
      return;
    }

    if (Number(budgetMin) >= Number(budgetMax)) {
      alert('Budget Min must be less than Budget Max');
      return;
    }

    setLoading(true);
    try {
      console.log('Calling taskService.postTask with:', taskData);
      const task = await taskService.postTask(taskData);
      console.log('Task created successfully:', task);
      addTask(task);
      alert("Task posted successfully!");
      setTaskData({
        title: "",
        description: "",
        budgetMin: "",
        budgetMax: "",
        date: "",
        location: "",
        category: "",
        priority: "medium",
      });
    } catch (err) {
      console.error("Failed to post task:", err);
      console.error("Error response:", err.response?.data);
      alert(err.response?.data?.message || err.message || "Failed to post task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Post a Task</h2>
        <div className="text-sm text-gray-500">Create new job</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
            <input 
              type="text" 
              name="title" 
              placeholder="Enter a clear, descriptive title" 
              value={taskData.title} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              required 
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea 
              name="description" 
              placeholder="Provide detailed information about the task..." 
              value={taskData.description} 
              onChange={handleChange} 
              rows="4"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
              required 
            />
          </div>
          
          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum (PKR)</label>
                <input 
                  type="number" 
                  name="budgetMin" 
                  placeholder="0" 
                  min="0"
                  step="0.01"
                  value={taskData.budgetMin} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum (PKR)</label>
                <input 
                  type="number" 
                  name="budgetMax" 
                  placeholder="0" 
                  min="0"
                  step="0.01"
                  value={taskData.budgetMax} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  required 
                />
              </div>
            </div>
          </div>
          
          {/* Date and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
              <input 
                type="date" 
                name="date" 
                value={taskData.date} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select 
                name="priority" 
                value={taskData.priority} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
          
          {/* Location and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input 
                type="text" 
                name="location" 
                placeholder="City, State or Address" 
                value={taskData.location} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required 
              />
            </div>
 <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Category *
  </label>
  <select
    name="category"
    value={taskData.category}
    onChange={handleChange}
    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    required
  >
    <option value="">Select a category</option>
    <option value="Home Repair">Home Repair</option>
    <option value="Cleaning">Cleaning</option>
    <option value="Moving">Moving</option>
    <option value="Plumbing">Plumbing</option>
    <option value="Electrical">Electrical</option>
    <option value="Gardening">Gardening</option>
    <option value="Painting">Painting</option>
  </select>
</div>

          </div>
          
          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </div>
              ) : (
                "Post Task"
              )}
            </button>
            <button 
              type="button" 
              onClick={() => setTaskData({
                title: "",
                description: "",
                budgetMin: "",
                budgetMax: "",
                date: "",
                location: "",
                category: "",
                priority: "medium",
              })}
              className="sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              disabled={loading}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostTaskTab;
