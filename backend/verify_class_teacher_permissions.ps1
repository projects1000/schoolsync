# verify_class_teacher_permissions.ps1

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
$schoolBody = @{
    name = "CT Perm School $(Get-Random)"
    code = "CTPERM$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "ctpermschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id

# 1.2 Create New Admin
Write-Host "Creating New Admin..."
$adminEmail = "ctadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "CT Admin"
    email = $adminEmail
    password = "password123"
    confirmPassword = "password123"
    phone = "1234567890"
    role = "ADMIN"
} | ConvertTo-Json
$createdAdmin = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$schoolId/admin" -Method Post -Body $adminBody -Headers $superHeaders -ContentType "application/json"

# 1.3 Login as New Admin
Write-Host "Logging in as New Admin..."
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$adminEmail; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminLogin.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# 2. Setup: 2 Classes, 2 Teachers, 1 Student
Write-Host "Setting up Resources..."
$rand = Get-Random

# Teachers
$t1Email = "ct1_$rand@test.com" # Class Teacher for C1
$t1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{ name = "CT One $rand"; email = $t1Email; phone = "980000$rand"; department = "General"; qualification = "BEd"; experience = "5y"; joiningDate = "2023-01-01"; password = "password123" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t1Id = $t1.teacher.id

$t2Email = "ct2_$rand@test.com" # Class Teacher for C2 / Non-CT for C1
$t2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{ name = "CT Two $rand"; email = $t2Email; phone = "990000$rand"; department = "General"; qualification = "BEd"; experience = "3y"; joiningDate = "2023-01-01"; password = "password123" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t2Id = $t2.teacher.id

# Classes
$c1Name = "Class 1-$rand"
$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{ name = $c1Name; capacity = 30; room = "101" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id

$c2Name = "Class 2-$rand"
$c2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{ name = $c2Name; capacity = 30; room = "102" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c2Id = $c2.id

# Assign Class Teacher T1 -> C1
Write-Host "Assigning T1 as Class Teacher for C1..."
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/assign-class-teacher" -Method Post -Body (@{ teacherId = $t1Id } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json" | Out-Null

# Student in C1
Write-Host "Creating Student in C1..."
$s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body (@{ admissionNo="A-$rand"; name="Student One"; age=5; classId=$c1Id; guardian="Parent"; guardianPhone="123"; address="Addr" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s1Id = $s1.id

# 3. Login as T1 (Class Teacher of C1)
Write-Host "Logging in as T1 (CT of C1)..."
$t1Login = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$t1Email; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$t1Token = $t1Login.token
$t1Headers = @{ Authorization = "Bearer $t1Token" }

# 3.1 T1 gets students of C1 (Should Succeed)
Write-Host "T1 getting students of C1 (Should Succeed)..."
try {
    $students = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/class/$c1Name" -Method Get -Headers $t1Headers
    Assert-Check ($students.Count -ge 1) "T1 retrieved student list"
} catch {
    Assert-Fail "T1 failed to get student list: $($_.Exception.Message)"
}

# 3.2 T1 adds Remark for S1 (Should Succeed)
Write-Host "T1 adding Remark for S1 (Should Succeed)..."
try {
    $remarkBody = @{ studentId = $s1Id; title = "Good Work"; description = "Keep it up"; type = "POSITIVE" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8082/api/remarks" -Method Post -Body $remarkBody -Headers $t1Headers -ContentType "application/json" | Out-Null
    Assert-Check $true "T1 added remark"
} catch {
    Assert-Fail "T1 failed to add remark: $($_.Exception.Message)"
}

# 3.3 T1 gets students of C2 (Should FAIL)
Write-Host "T1 attempting to get students of C2 (Should FAIL)..."
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/class/$c2Name" -Method Get -Headers $t1Headers | Out-Null
    Assert-Fail "T1 accessed C2 students (Should be forbidden)"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden ) "T1 denied access to C2 students"
}

# 4. Login as T2 (Not CT of C1)
Write-Host "Logging in as T2..."
$t2Login = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body (@{email=$t2Email; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$t2Token = $t2Login.token
$t2Headers = @{ Authorization = "Bearer $t2Token" }

# 4.1 T2 adds Remark for S1 (Should FAIL)
Write-Host "T2 adding Remark for S1 (Should FAIL)..."
try {
    $remarkBody2 = @{ studentId = $s1Id; title = "Bad"; description = "Should fail"; type = "DISCIPLINE" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8082/api/remarks" -Method Post -Body $remarkBody2 -Headers $t2Headers -ContentType "application/json" | Out-Null
    Assert-Fail "T2 added remark (Should be forbidden)"
} catch {
    # It might return 200 OK with error body or 403 status code depending on controller impl.
    # Our controller catches RuntimeException and returns 403.
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) "T2 denied adding remark"
}

Write-Host "CLASS TEACHER PERMISSIONS VERIFICATION COMPLETE" -ForegroundColor Cyan
