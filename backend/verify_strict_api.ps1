
# 1. Login as Super Admin
$superLoginUrl = "http://localhost:8082/api/auth/login"
$superLoginBody = @{
    email = "admin@littlesteps.com" 
    password = "SecureLittleSteps2024!" 
} | ConvertTo-Json

try {
    $superResponse = Invoke-RestMethod -Uri $superLoginUrl -Method Post -Body $superLoginBody -ContentType "application/json"
    $superToken = $superResponse.token
    $superHeaders = @{
        Authorization = "Bearer $superToken"
    }
    Write-Host "Logged in as Super Admin."
} catch {
    Write-Host "Super Admin Login failed."
    exit
}

# 2. Create School
$uniqueId = Get-Random -Minimum 10000 -Maximum 99999
$schoolCode = "SCHAPI$uniqueId"
$schoolBody = @{
    name = "API Test School $uniqueId"
    code = $schoolCode
    address = "123 Test St"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "9876543210"
    email = "schoolapi$uniqueId@test.com"
} | ConvertTo-Json

try {
    $school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
    Write-Host "Created School: $($school.name) ($($school.id))"
} catch {
    Write-Error "Failed to create school: $_"
    exit
}

# 3. Create Admin for School
$adminEmail = "adminapi$uniqueId@test.com"
$adminPassword = "password123"
$adminBody = @{
    name = "Test Admin $uniqueId"
    email = $adminEmail
    password = $adminPassword
    phone = "9876543210"
} | ConvertTo-Json

try {
    $adminUser = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)/admin" -Method Post -Body $adminBody -Headers $superHeaders -ContentType "application/json"
    Write-Host "Created Admin: $($adminUser.email)"
} catch {
    Write-Error "Failed to create admin: $_"
    # Cleanup school
    Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)" -Method Delete -Headers $superHeaders
    exit
}

# 4. Login as New School Admin
$adminLoginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri $superLoginUrl -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminResponse.token
    $adminHeaders = @{
        Authorization = "Bearer $adminToken"
    }
    Write-Host "Logged in as New School Admin."
} catch {
    Write-Error "Failed to login as new admin: $_"
    exit
}

# 5. Create Class & Section
$classBody = @{ name = "Class 1"; grade = "1"; section = "A"; capacity = 30; room = "101" } | ConvertTo-Json
$class = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $classBody -Headers $adminHeaders -ContentType "application/json"
$sectionBody = @{ name = "A"; classId = $class.id } | ConvertTo-Json
$section = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/sections" -Method Post -Body $sectionBody -Headers $adminHeaders -ContentType "application/json"

# 6. Test: Create Student with Explicit Roll No (Should be IGNORED)
Write-Host "Testing Strict Roll No Rule (Creation)..."
$studentBody = @{
    name = "Hacker Student"
    age = 6
    classId = $class.id
    sectionId = $section.id
    guardian = "Guardian"
    guardianPhone = "0000000000"
    guardianEmail = "hacker@test.com"
    rollNo = 999 # TRYING TO INJECT ROLL NO
} | ConvertTo-Json

try {
    $s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $studentBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Created Student. Returned Roll No: $($s1.rollNo)"
    
    if ($s1.rollNo -eq 1) {
        Write-Host "SUCCESS: System ignored injected rollNo (999) and assigned correct rollNo (1)."
    } else {
        Write-Error "FAILURE: System accepted injected rollNo or assigned incorrect one. Got: $($s1.rollNo)"
    }
} catch {
    Write-Error "Failed to create student: $_"
    exit
}

# 7. Test: Update Student with Explicit Roll No (Should be IGNORED)
Write-Host "Testing Strict Roll No Rule (Update)..."
$updateBody = @{
    rollNo = 888 # TRYING TO UPDATE ROLL NO
    name = "Hacker Student Updated"
} | ConvertTo-Json

try {
    $s1Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/$($s1.id)" -Method Put -Body $updateBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Updated Student. Returned Roll No: $($s1Updated.rollNo)"
    
    if ($s1Updated.rollNo -eq 1) {
        Write-Host "SUCCESS: System ignored update to rollNo (888) and kept correct rollNo (1)."
    } else {
        Write-Error "FAILURE: System accepted update to rollNo. Got: $($s1Updated.rollNo)"
    }
} catch {
    Write-Error "Failed to update student: $_"
    exit
}

# Cleanup
try {
   Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)" -Method Delete -Headers $superHeaders
   Write-Host "Cleaned up School."
} catch {
    Write-Host "Failed to cleanup school (might need manual cleanup): $_"
}
