const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_COURSES = `${BASE_URL}/api/courses`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export async function getCoursesForStudent() {
    try {
        const response = await fetch(API_COURSES, { headers: getHeaders() });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        if (!response.ok) throw new Error('Failed to fetch courses');
        return await response.json();
    } catch (err) {
        console.error('Fetch courses error:', err);
        return { courses: [], totalCredits: 0, totalCourses: 0 };
    }
}

export async function updateCourse(courseData) {
    try {
        const response = await fetch(API_COURSES, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(courseData)
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update course');
        }
        return await response.json();
    } catch (err) {
        throw err;
    }
}

export async function deleteCourse(id) {
    try {
        const response = await fetch(`${API_COURSES}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        if (!response.ok) throw new Error('Failed to delete course');
        return await response.json();
    } catch (err) {
        throw err;
    }
}
