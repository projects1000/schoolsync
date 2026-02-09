# verify_assign_subject_teacher.ps1

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
Write-Host "Creating New School..."
$schoolBody = @{
    name = "Sub Teacher School $(Get-Random)"
    code = "STS$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "stschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id

# 1.2 Create New Admin
Write-Host "Creating New Admin..."
$adminEmail = "stadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "ST Admin"
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

# 2. Setup: 1 Class, 1 Subject, 2 Teachers
Write-Host "Setting up Resources..."
$rand = Get-Random
$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{ name = "Class ST-$rand"; capacity = 30; room = "101" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id

$s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{ name = "English $rand"; description = "Literature" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s1Id = $s1.id

$t1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{ name = "T1 $rand"; email = "t1$rand@test.com"; phone = "940000$rand"; department = "Arts"; qualification = "MA"; experience = "3y"; joiningDate = "2023-01-01"; password = "password123" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t1Id = $t1.teacher.id

$t2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{ name = "T2 $rand"; email = "t2$rand@test.com"; phone = "950000$rand"; department = "Arts"; qualification = "MA"; experience = "2y"; joiningDate = "2023-01-01"; password = "password123" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t2Id = $t2.teacher.id

# 3. Assign Teacher T1 to Subject S1 in Class C1 (New Assignment)
Write-Host "1. New Assignment (T1 to S1)..."
$assignBody = @{ classId = $c1Id; subjectId = $s1Id; teacherId = $t1Id } | ConvertTo-Json
$res1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/class-subjects/assign-teacher" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($res1.teacherId -eq $t1Id) "T1 assigned initially"

# 4. Verify T1 is assigned
$subjects = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Get -Headers $adminHeaders
Assert-Check ($subjects.Count -eq 1 -and $subjects[0].teacherId -eq $t1Id) "Verification: T1 is assigned"

# 5. Assign Teacher T2 to Subject S1 in Class C1 (Update Assignment)
Write-Host "2. Update Assignment (T2 to S1)..."
$assignBody2 = @{ classId = $c1Id; subjectId = $s1Id; teacherId = $t2Id } | ConvertTo-Json
$res2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/class-subjects/assign-teacher" -Method Post -Body $assignBody2 -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($res2.teacherId -eq $t2Id) "T2 updated successfully"

# 6. Verify T2 is assigned
$subjects2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Get -Headers $adminHeaders
Assert-Check ($subjects2.Count -eq 1 -and $subjects2[0].teacherId -eq $t2Id) "Verification: T2 is assigned"

Write-Host "ASSIGN TEACHER TO SUBJECT ENDPOINT VERIFICATION COMPLETE" -ForegroundColor Cyan
