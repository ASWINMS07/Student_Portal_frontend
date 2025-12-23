const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_TIMETABLE = `${BASE_URL}/api/timetable`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export async function getTimetableForStudent(userId = null) {
    try {
        const url = userId ? `${API_TIMETABLE}?userId=${userId}` : API_TIMETABLE;
        const response = await fetch(url, { headers: getHeaders() });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        if (!response.ok) throw new Error('Failed to fetch timetable');
        return await response.json();
    } catch (err) {
        console.error('Fetch timetable error:', err);
        return { schedule: [] };
    }
}

export async function updateTimetable(entryData) {
    try {
        const response = await fetch(API_TIMETABLE, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(entryData)
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        if (!response.ok) throw new Error('Failed to update timetable');
        return await response.json();
    } catch (err) {
        throw err;
    }
}

export async function deleteTimetableEntry(id) {
    try {
        const response = await fetch(`${API_TIMETABLE}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        if (!response.ok) throw new Error('Failed to delete timetable entry');
        return await response.json();
    } catch (err) {
        throw err;
    }
}
