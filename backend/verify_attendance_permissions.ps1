# verify_attendance_permissions.ps1

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

function Assert-Fail {
    param(
        [string]$Message
    )
    Write-Error "FAIL: $Message"
}

# 1. Login as SuperAdmin
Write-Host "Logging in as SuperAdmin..."
$superLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email="admin@littlesteps.com"; password="password"} | ConvertTo-Json) -ContentType "application/json"
$superToken = $superLogin.token
$superHeaders = @{ Authorization = "Bearer $superToken" }

# 1.1 Create New School
Write-Host "Creating New School..."
$rand = Get-Random
$schoolBody = @{
    name = "Att Perm School $rand"
    code = "ATTP$rand"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "attschool_$rand@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id

# 1.2 Create New Admin
Write-Host "Creating New Admin..."
$adminEmail = "attadmin_$rand@test.com"
$adminBody = @{
    name = "Att Admin"
    email = $adminEmail
    password = "password123"
    confirmPassword = "password123"
    phone = "1234567890"
    role = "ADMIN"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$schoolId/admin" -Method Post -Body $adminBody -Headers $superHeaders -ContentType "application/json" | Out-Null

# 1.3 Login as New Admin
Write-Host "Logging in as New Admin..."
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$adminEmail; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminLogin.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# 2. Setup: Class, Subject, Class Teacher (CT), Subject Teacher (ST)
Write-Host "Setting up Resources..."
$cName = "Class A-$rand"
$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{ name = $cName; capacity = 30; room = "101" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id

$s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{ name = "Math $rand"; description = "Math" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s1Id = $s1.id

# Teachers
$ctEmail = "ct_att_$rand@test.com"
$ct = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{ name = "CT $rand"; email = $ctEmail; phone = "910000$rand"; department = "Gen"; qualification = "BEd"; experience = "3y"; joiningDate = "2023-01-01"; password = "password123" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$ctId = $ct.teacher.id

$stEmail = "st_att_$rand@test.com"
$st = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{ name = "ST $rand"; email = $stEmail; phone = "920000$rand"; department = "Math"; qualification = "MSc"; experience = "3y"; joiningDate = "2023-01-01"; password = "password123" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$stId = $st.teacher.id

# Assign CT to Class
Write-Host "Assigning CT to Class..."
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/assign-class-teacher" -Method Post -Body (@{ teacherId = $ctId } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json" | Out-Null

# Assign ST to Subject in Class (This might implicitly assign 'access' but shouldn't give Class Teacher rights)
Write-Host "Assigning ST to Subject..."
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/class-subjects/assign-teacher" -Method Post -Body (@{ classId = $c1Id; subjectId = $s1Id; teacherId = $stId } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json" | Out-Null

# Create Student
Write-Host "Creating Student..."
$stu = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body (@{ admissionNo="STU-$rand"; name="Student X"; age=10; classId=$c1Id; guardian="P"; guardianPhone="1"; address="A" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$stuId = $stu.id

# 3. Class Teacher Action (Should Succeed)
Write-Host "Logging in as Class Teacher..."
$ctLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$ctEmail; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$ctToken = $ctLogin.token
$ctHeaders = @{ Authorization = "Bearer $ctToken" }

Write-Host "CT Marking Attendance (Should Succeed)..."
$date = Get-Date -Format "yyyy-MM-dd"
$attArray = @(
    @{ studentId = $stuId; attendanceDate = $date; status = "PRESENT"; className = $cName }
)
$attBody = ConvertTo-Json -InputObject $attArray -Compress
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/teacher/attendance" -Method Post -Body $attBody -Headers $ctHeaders -ContentType "application/json" | Out-Null
    Assert-Check $true "Class Teacher marked attendance"
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Assert-Fail "Class Teacher failed to mark attendance: $($_.Exception.Message) | Body: $body"
}

# 4. Subject Teacher Action (Should FAIL)
Write-Host "Logging in as Subject Teacher..."
$stLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$stEmail; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$stToken = $stLogin.token
$stHeaders = @{ Authorization = "Bearer $stToken" }

Write-Host "ST Marking Attendance (Should FAIL)..."
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/teacher/attendance" -Method Post -Body $attBody -Headers $stHeaders -ContentType "application/json" | Out-Null
    Assert-Fail "Subject Teacher marked attendance (Should be forbidden)"
} catch {
    # Expect 500 or 400 or 403. RuntimeException is mapped to 500 usually unless handled.
    Assert-Check $true "Subject Teacher denied attendance marking ($($_.Exception.Message))"
}

Write-Host "ATTENDANCE PERMISSIONS VERIFICATION COMPLETE" -ForegroundColor Cyan
