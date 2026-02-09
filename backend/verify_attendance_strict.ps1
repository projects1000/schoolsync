# verify_attendance_strict.ps1

$ErrorActionPreference = "Stop"

function Assert-Check {
    param(
        [bool]$Condition,
        [string]$Message
    )
    if (-not $Condition) {
        Write-Error "FAIL: $Message"
    } else {
        Write-Host "SUCCESS: $Message" -ForegroundColor Green
    }
}

# 1. Login as SuperAdmin
Write-Host "Logging in as SuperAdmin..."
$superLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email="admin@littlesteps.com"; password="password"} | ConvertTo-Json) -ContentType "application/json"
$superToken = $superLogin.token
$superHeaders = @{ Authorization = "Bearer $superToken" }

# 1.1 Create New School
Write-Host "Creating New School for Verification..."
$schoolBody = @{
    name = "Verify School $(Get-Random)"
    code = "VS$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "verifyschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id
Write-Host "Created School: $schoolId"

# 1.2 Create New Admin for this School
Write-Host "Creating New Admin..."
$adminEmail = "verifyadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "Verify Admin"
    email = $adminEmail
    password = "password123"
    confirmPassword = "password123"
    phone = "1234567890"
    role = "ADMIN"
} | ConvertTo-Json
$createdAdmin = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$schoolId/admin" -Method Post -Body $adminBody -Headers $superHeaders -ContentType "application/json"
Write-Host "Created Admin: $($createdAdmin.id) ($adminEmail)"

# 1.3 Login as New Admin
Write-Host "Logging in as New Admin..."
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$adminEmail; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminLogin.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }


# 2. Setup: 2 Teachers, 1 Class
Write-Host "Setting up Teachers and Class..."
$rand = Get-Random -Minimum 1000 -Maximum 9999

# Teacher A (Class Teacher)
$teacherABody = @{
    name = "CT $rand"
    email = "ct$rand@test.com"
    phone = "900000$rand"
    department = "Math"
    qualification = "B.Ed"
    experience = "5 years"
    joiningDate = "2023-01-01"
    password = "password123"
} | ConvertTo-Json
$teacherA = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body $teacherABody -Headers $adminHeaders -ContentType "application/json"
$teacherAId = $teacherA.teacher.id
Write-Host "Created Class Teacher: $teacherAId ($($teacherA.teacher.email))"

# Teacher B (Subject Teacher)
$teacherBBody = @{
    name = "ST $rand"
    email = "st$rand@test.com"
    phone = "911111$rand"
    department = "Social"
    qualification = "B.Ed"
    experience = "3 years"
    joiningDate = "2023-01-01"
    password = "password123"
} | ConvertTo-Json
$teacherB = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body $teacherBBody -Headers $adminHeaders -ContentType "application/json"
$teacherBId = $teacherB.teacher.id
Write-Host "Created Subject Teacher: $teacherBId ($($teacherB.teacher.email))"

# Create Class and Assign Teacher A
$classBody = @{
    name = "Class Verify-$rand"
    capacity = 30
    room = "101"
    classTeacherId = $teacherAId
} | ConvertTo-Json
$class = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $classBody -Headers $adminHeaders -ContentType "application/json"
$classId = $class.id
Write-Host "Created Class: $classId with Class Teacher $teacherAId"

# Create Student in Class
$studentBody = @{
    firstName = "Student"
    lastName = "$rand"
    dateOfBirth = "2015-01-01"
    gender = "Male"
    admissionDate = "2023-01-01"
    classId = $classId
    sectionId = "" # Assuming optional or empty for now since we focus on Class Teacher permission
    parentName = "Parent $rand"
    parentEmail = "parent$rand@test.com"
    parentPhone = "999888$rand"
    address = "Test Address"
} | ConvertTo-Json
$student = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $studentBody -Headers $adminHeaders -ContentType "application/json"
$studentId = $student.id
# Note: student creation might require section depending on validation logic. Assuming it works.

# 3. Login as Teacher A (Class Teacher)
Write-Host "Logging in as Class Teacher A..."
$loginA = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email="ct$rand@test.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$tokenA = $loginA.token
$headersA = @{ Authorization = "Bearer $tokenA" }

# 4. Mark Attendance as Class Teacher A (Should Success)
Write-Host "Teacher A marking attendance..."
$today = (Get-Date).ToString("yyyy-MM-dd")
$attendanceList = @(@{
    studentId = $studentId
    studentName = "Student $rand"
    attendanceDate = $today
    status = "PRESENT"
    className = "Class Verify-$rand" 
})
$attendanceBody = $attendanceList | ConvertTo-Json -Depth 10
if ($attendanceBody.Trim().StartsWith("{")) {
    $attendanceBody = "[$attendanceBody]"
}

try {
    $att = Invoke-RestMethod -Uri "http://localhost:8082/api/attendance" -Method Post -Body $attendanceBody -Headers $headersA -ContentType "application/json"
    Assert-Check ($att.Count -eq 1) "Class Teacher marked attendance successfully"
    $attendanceId = $att[0].id
} catch {
    Write-Error "Class Teacher failed to mark attendance: $_"
}

# 5. Login as Teacher B (Subject Teacher)
Write-Host "Logging in as Subject Teacher B..."
$loginB = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email="st$rand@test.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$tokenB = $loginB.token
$headersB = @{ Authorization = "Bearer $tokenB" }

# 6. Update Attendance as Subject Teacher B (Should Fail)
Write-Host "Teacher B attempting to update attendance... (Expect Fail)"
$updateBody = @{
    status = "ABSENT"
    notes = "Updated by Subject Teacher"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/attendance/$attendanceId" -Method Put -Body $updateBody -Headers $headersB -ContentType "application/json"
    Write-Error "FAIL: Subject Teacher SHOULD NOT be able to update attendance"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) "Subject Teacher update blocked as expected"
}

# 7. Update Attendance as Teacher A (Should Success)
Write-Host "Teacher A updating attendance..."
try {
    $updated = Invoke-RestMethod -Uri "http://localhost:8082/api/attendance/$attendanceId" -Method Put -Body $updateBody -Headers $headersA -ContentType "application/json"
    Assert-Check ($updated.status -eq "ABSENT") "Class Teacher updated attendance successfully"
} catch {
    Write-Error "Class Teacher failed to update attendance: $_"
}

Write-Host "ATTENDANCE PERMISSION VERIFICATION COMPLETE" -ForegroundColor Cyan
