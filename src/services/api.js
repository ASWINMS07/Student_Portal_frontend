// Main API service file
// Aggregates all services for easier import
export * from './userService';
export * from './attendanceService';
export * from './marksService';
export * from './feesService';
export * from './coursesService';
export * from './timetableService';
export * from './profileService';
export * from './studentService';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_SEED = `${BASE_URL}/api/seed`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const seedAPI = {
  seedData: async () => {
    try {
      const response = await fetch(API_SEED, {
        method: 'POST',
        headers: getHeaders()
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error("Received non-JSON response (likely HTML) from server");
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Seeding failed');
      }
      return await response.json();
    } catch (error) {
      console.error("Seeding error:", error);
      throw error;
    }
  },
};




