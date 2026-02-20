const checkHealth = async () => {
    try {
        console.log('Checking server health on port 5001...');
        const response = await fetch('http://localhost:5001/api/courses/departments');
        if (response.ok) {
            const data = await response.json();
            console.log('Server is UP. Departments:', data);
        } else {
            console.error('Server responded with status:', response.status);
        }
    } catch (error) {
        console.error('Server check failed:', error.message);
        // Try port 5000 just in case
        try {
            console.log('Checking server health on port 5000...');
            const response = await fetch('http://localhost:5000/api/courses/departments');
            if (response.ok) {
                const data = await response.json();
                console.log('Server is UP on port 5000. Departments:', data);
            } else {
                console.error('Server responded with status:', response.status);
            }
        } catch (err2) {
            console.error('Server check failed on port 5000:', err2.message);
        }
    }
};

checkHealth();
