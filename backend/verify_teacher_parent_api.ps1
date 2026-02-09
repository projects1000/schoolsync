
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
$schoolBody = @{
    name = "API Valid School $uniqueId"
    code = "SCHVAL$uniqueId"
    address = "123 Test St"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "9876543210"
    email = "schoolval$uniqueId@test.com"
} | ConvertTo-Json

$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
Write-Host "Created School: $($school.name)"

# 3. Create Admin for School
$adminEmail = "adminval$uniqueId@test.com"
$adminPassword = "password123"
$adminBody = @{
    name = "Test Admin $uniqueId"
    email = $adminEmail
    password = $adminPassword
    phone = "9876543210"
} | ConvertTo-Json

$adminUser = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)/admin" -Method Post -Body $adminBody -Headers $superHeaders -ContentType "application/json"
Write-Host "Created Admin: $($adminUser.email)"

# 4. Login as New School Admin
$adminLoginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri $superLoginUrl -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminResponse.token
$adminHeaders = @{
    Authorization = "Bearer $adminToken"
}
Write-Host "Logged in as New School Admin."

# 5. Create Class & Section
$classBody = @{ name = "Class 1"; grade = "1"; section = "A"; capacity = 30; room = "101" } | ConvertTo-Json
$class = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $classBody -Headers $adminHeaders -ContentType "application/json"
$sectionBody = @{ name = "A"; classId = $class.id } | ConvertTo-Json
$section = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/sections" -Method Post -Body $sectionBody -Headers $adminHeaders -ContentType "application/json"

# 6. Create Teacher
$teacherEmail = "teacherval$uniqueId@test.com"
$teacherPassword = "password123"
$teacherBody = @{
    name = "Teacher Val"
    email = $teacherEmail
    password = $teacherPassword
    phoneNumber = "9876543210"
    qualification = "B.Ed"
    experience = 5
    department = "Science"
    joiningDate = "2023-01-01"
} | ConvertTo-Json

$teacherRes = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body $teacherBody -Headers $adminHeaders -ContentType "application/json"
$teacherId = $teacherRes.teacher.id
Write-Host "Created Teacher: $teacherEmail"

# Assign Class to Teacher
$assignBody = @{
    assignedClassIds = @($class.id)
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers/$teacherId/assign-classes" -Method Put -Body $assignBody -Headers $adminHeaders -ContentType "application/json"

# 7. Create Parent
$parentEmail = "parentval$uniqueId@test.com"
$parentPassword = "password123"
$parentBody = @{
    name = "Parent Val"
    email = $parentEmail
    password = $parentPassword
    phoneNumber = "9876543210"
    address = "Test Address"
    relation = "FATHER"
} | ConvertTo-Json
$parentRes = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/parents" -Method Post -Body $parentBody -Headers $adminHeaders -ContentType "application/json"
$parentId = $parentRes.parent.id
Write-Host "Created Parent: $parentEmail"

# 8. Create Students (Roll 1 and 2)
# Student A (Roll 1)
$s1Body = @{ name = "Aaron"; classId = $class.id; sectionId = $section.id; guardian = "G"; guardianPhone="0"; guardianEmail="g@t.com" } | ConvertTo-Json
$s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $s1Body -Headers $adminHeaders -ContentType "application/json"

# Student B (Roll 2)
$s2Body = @{ name = "Bob"; classId = $class.id; sectionId = $section.id; guardian = "G"; guardianPhone="0"; guardianEmail="g@t.com" } | ConvertTo-Json
$s2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $s2Body -Headers $adminHeaders -ContentType "application/json"

# Map Student to Parent
$mapBody = @{
    parentId = $parentId
    studentId = $s1.id
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/parents/map-student" -Method Post -Body $mapBody -Headers $adminHeaders -ContentType "application/json"

# 9. Verify Teacher API
Write-Host "`n--- Verifying Teacher API ---"
$teacherLoginBody = @{ email = $teacherEmail; password = $teacherPassword } | ConvertTo-Json
$teacherAuth = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body $teacherLoginBody -ContentType "application/json"
$teacherHeaders = @{ Authorization = "Bearer $($teacherAuth.token)" }

$teacherStudents = Invoke-RestMethod -Uri "http://localhost:8082/api/teacher/students" -Method Get -Headers $teacherHeaders
Write-Host "Teacher fetched $($teacherStudents.Count) students."

if ($teacherStudents[0].rollNo -eq 1 -and $teacherStudents[0].name -eq "Aaron") {
    Write-Host "SUCCESS: Teacher API sorted correctly (Roll 1 first)."
} else {
    Write-Error "FAILURE: Teacher API sort order incorrect. First is: $($teacherStudents[0].name) Roll: $($teacherStudents[0].rollNo)"
}

if ($teacherStudents[0].rollNo) {
    Write-Host "SUCCESS: Teacher API includes rollNo."
} else {
    Write-Error "FAILURE: Teacher API missing rollNo."
}

# 10. Verify Parent API
Write-Host "`n--- Verifying Parent API ---"
$parentLoginBody = @{ email = $parentEmail; password = $parentPassword } | ConvertTo-Json
$parentAuth = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body $parentLoginBody -ContentType "application/json"
$parentHeaders = @{ Authorization = "Bearer $($parentAuth.token)" }

try {
    $parentStudents = Invoke-RestMethod -Uri "http://localhost:8082/api/parent/students" -Method Get -Headers $parentHeaders
    Write-Host "Parent fetched $($parentStudents.Count) students."
    if ($parentStudents[0].rollNo) {
        Write-Host "SUCCESS: Parent API includes rollNo."
    } else {
        Write-Error "FAILURE: Parent API missing rollNo."
    }
} catch {
    Write-Error "FAILURE: Parent API endpoint /api/parent/students fail: $_"
}

# Cleanup
Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)" -Method Delete -Headers $superHeaders
Write-Host "`nCleaned up School."
