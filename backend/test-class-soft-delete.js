async function testSoftDelete() {
    try {
        console.log("Starting test...");

        // 1. Login to get token
        const loginRes = await fetch('http://localhost:8082/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@littlesteps.com',
                password: 'password',
                role: 'SUPERADMIN'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error("Login failed: " + JSON.stringify(loginData));
        const token = loginData.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        console.log("Logged in successfully.");

        // 2. Fetch all classes
        let classesRes = await fetch('http://localhost:8082/api/admin/classes', { headers });
        let classes = await classesRes.json();

        if (classes.length === 0) {
            console.log("No classes found to delete! Creating dummy class...");
            const createRes = await fetch('http://localhost:8082/api/admin/classes', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    grade: 'Dummy Grade',
                    section: 'Z',
                    capacity: 30
                })
            });
            classes = [await createRes.json()];
        }

        const targetClass = classes[0];
        console.log(`Target class to delete: ${targetClass.grade} - ${targetClass.section} (ID: ${targetClass.id})`);

        // 3. Delete the class
        console.log(`Deleting class ${targetClass.id}...`);
        await fetch(`http://localhost:8082/api/admin/classes/${targetClass.id}`, { method: 'DELETE', headers });
        console.log("Class deleted.");

        // 4. Verify it's no longer in the active list
        classesRes = await fetch('http://localhost:8082/api/admin/classes', { headers });
        let activeClasses = await classesRes.json();
        const stillExists = activeClasses.some(c => c.id === targetClass.id);
        console.log(`Is class in active list? ${stillExists}`);

        // 5. Verify it is in the deleted list
        const deletedRes = await fetch('http://localhost:8082/api/admin/classes/deleted', { headers });
        let deletedClasses = await deletedRes.json();
        const inDeletedList = deletedClasses.some(c => c.id === targetClass.id);
        console.log(`Is class in deleted list? ${inDeletedList}`);

        // 6. Restore the class
        console.log(`Restoring class ${targetClass.id}...`);
        await fetch(`http://localhost:8082/api/admin/classes/${targetClass.id}/restore`, { method: 'POST', headers });
        console.log("Class restored.");

        // 7. Verify it's back in the active list
        classesRes = await fetch('http://localhost:8082/api/admin/classes', { headers });
        activeClasses = await classesRes.json();
        const existsAgain = activeClasses.some(c => c.id === targetClass.id);
        console.log(`Is class in active list after restore? ${existsAgain}`);

    } catch (e) {
        console.error("Error during test:", e.message);
    }
}

testSoftDelete();
