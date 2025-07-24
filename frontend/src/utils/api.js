const URL_PREFIX = 'http://localhost:5000/api';

function Headers() {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    return headers;
}

async function apiFetch(endpoint, options = {}) {
    const url = `${URL_PREFIX}${endpoint}`;
    const headers = {
        ...Headers(),
        ...options.headers,
    };
    const config = {
        ...options,
        headers,
    };
    const response = await fetch(url, config);
    return await response.json();
}

export const auth = {
    login: (email, password) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
    }),
    signup: (userData) => apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
};

export const task = {
    all: () => apiFetch('/task/all', {
        method: 'GET',
    }),
    add: (taskData) => apiFetch('/task/add', {
        method: 'POST',
        body: JSON.stringify(taskData),
    }),
    update: (taskId, taskData) => apiFetch(`/task/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
    }),
    delete: (taskId) => apiFetch(`/task/${taskId}`, {
        method: 'DELETE',
    }),
    complete: (taskId) => apiFetch(`/task/${taskId}/complete`, {
        method: 'POST',
    }),
    undoComplete: (taskId) => apiFetch(`/task/${taskId}/undo-complete`, {
        method: 'POST',
    }),
    getOverdue: () => apiFetch('/task/overdue', {
        method: 'GET',
    })
};

export const notifications = {
  registerToken: (token) => {
    return apiFetch('/notification/token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },
  getAll: () => apiFetch('/notification/all', {
    method: 'GET',
  }),
  markAsRead: (notificationId) => apiFetch(`/notification/${notificationId}/read`, {
    method: 'PUT',
  }),
  markAllAsRead: () => apiFetch('/notification/read-all', {
    method: 'PUT',
  }),
  send: (notificationData) => apiFetch('/notification/send', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  }),
};

export const pomodoro = {
    add: (cycleData) => apiFetch('/pomodoro', {
        method: 'POST',
        body: JSON.stringify(cycleData),
    }),
    getAll: () => apiFetch('/pomodoro/all', {
        method: 'GET',
    }),
    getWeekly: () => apiFetch('/pomodoro/weekly', {
        method: 'GET',
    }),
};

export const classes = {
    getAll: () => apiFetch('/class/all', {
        method: 'GET'
    }),
    add: (classData) => apiFetch('/class/add', {
        method: 'POST',
        body: JSON.stringify(classData)
    }),
    update: (classId, classData) => apiFetch(`/class/${classId}/update`, {
        method: 'PUT',
        body: JSON.stringify(classData)
    }),
    delete: (classId) => apiFetch(`/class/${classId}/delete`, {
        method: 'DELETE'
    }),
    getRecommendation: () => apiFetch('/class/recommendation', {
        method: 'GET'
    })
};
