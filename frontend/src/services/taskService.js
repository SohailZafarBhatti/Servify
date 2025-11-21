import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5000/api/tasks",
});

// Attach token automatically for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Geocode location using OpenStreetMap Nominatim
const geocodeLocation = async (address) => {
  try {
    if (!address?.trim()) return null;

    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: address, format: "json", limit: 1 },
    });

    if (res.data && res.data.length > 0) {
      const { lon, lat } = res.data[0];
      return [parseFloat(lon), parseFloat(lat)]; // [lng, lat]
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

// Service functions
const taskService = {
  getMyTasks: async () => {
    const response = await api.get("/my-tasks");
    return response.data.tasks;
  },

  postTask: async (taskData) => {
    console.log('=== TASK SERVICE DEBUG ===');
    console.log('Input taskData:', taskData);
    console.log('Budget fields check:', {
      budgetMin: taskData.budgetMin,
      budgetMax: taskData.budgetMax,
      budgetMinType: typeof taskData.budgetMin,
      budgetMaxType: typeof taskData.budgetMax,
      budgetMinTruthy: !!taskData.budgetMin,
      budgetMaxTruthy: !!taskData.budgetMax
    });
    
    // Validate budget fields before processing
    if (!taskData.budgetMin || !taskData.budgetMax) {
      console.error('Budget validation failed in service:', { budgetMin: taskData.budgetMin, budgetMax: taskData.budgetMax });
      throw new Error('Budget min and max are required');
    }
    
    // Convert location string to GeoJSON coordinates
    let coordinates = null;
    if (taskData.location?.trim()) {
      coordinates = await geocodeLocation(taskData.location);
      if (!coordinates) throw new Error("Invalid location: cannot find coordinates");
    }

    // Build payload with category and priority included
    const payload = {
      title: taskData.title,
      description: taskData.description,
      budgetMin: Number(taskData.budgetMin),
      budgetMax: Number(taskData.budgetMax),
      date: taskData.date,
      category: taskData.category,
      priority: taskData.priority,
      location: coordinates
        ? {
            type: "Point",
            coordinates, // [lng, lat]
            address: taskData.location,
          }
        : undefined,
    };

    console.log('Final payload being sent to API:', payload);
    console.log('API endpoint:', api.defaults.baseURL + '/');
    console.log('Payload validation:', {
      title: !!payload.title,
      description: !!payload.description,
      budgetMin: !!payload.budgetMin,
      budgetMax: !!payload.budgetMax,
      date: !!payload.date,
      category: !!payload.category,
      priority: !!payload.priority
    });

    const response = await api.post("/", payload);
    console.log('API response:', response.data);
    return response.data.task;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/${taskId}`, taskData);
    return response.data.task;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/${taskId}`);
    return response.data;
  },

  getAssignedTasks: async () => {
    const response = await api.get("/assigned");
    return response.data.tasks;
  },
};

export default taskService;
