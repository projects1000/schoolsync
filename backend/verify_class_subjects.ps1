# verify_class_subjects.ps1

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
    name = "Subject School $(Get-Random)"
    code = "SUB$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "subschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id

# 1.2 Create New Admin
Write-Host "Creating New Admin..."
$adminEmail = "subadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "Subject Admin"
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

# 2. Setup: 1 Teacher, 1 Class
Write-Host "Setting up Teacher and Class..."
$rand = Get-Random
$t1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{
    name = "ST1 $rand"; email = "st1$rand@test.com"; phone = "920000$rand"; department = "Math"; qualification = "B.Ed"; experience = "5 years"; joiningDate = "2023-01-01"; password = "password123"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t1Id = $t1.teacher.id

$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{
    name = "Class S1-$rand"; capacity = 30; room = "101"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id

# 3. Create Subjects
Write-Host "Creating Subjects..."
$s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{
    name = "Math $rand"; description = "Mathematics"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s1Id = $s1.id

$s2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{
    name = "Science $rand"; description = "Science"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s2Id = $s2.id

# 4. Assign Subject S1 to Class C1 with Teacher T1
Write-Host "Assigning Math to Class with Teacher..."
$assignBody = @{ subjectId = $s1Id; teacherId = $t1Id } | ConvertTo-Json
$cs1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($cs1.classId -eq $c1Id -and $cs1.subjectId -eq $s1Id -and $cs1.teacherId -eq $t1Id) "Math assigned to Class with Teacher"

# 5. Attempt Duplicate Assignment (Should Fail)
Write-Host "Attempting Duplicate Assignment (Should Fail)..."
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"
    Write-Error "FAIL: Should not allow duplicate subject assignment"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) "Blocked duplicate assignment"
}

# 6. Assign Subject S2 to Class C1 without Teacher
Write-Host "Assigning Science to Class without Teacher..."
$assignBody2 = @{ subjectId = $s2Id } | ConvertTo-Json
$cs2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Post -Body $assignBody2 -Headers $adminHeaders -ContentType "application/json"
$cs2Id = $cs2.id
Assert-Check ($cs2.subjectId -eq $s2Id -and $cs2.teacherId -eq $null) "Science assigned without Teacher"

# 7. Update Subject S2 with Teacher T1
Write-Host "Updating Science with Teacher..."
$updateBody = @{ teacherId = $t1Id } | ConvertTo-Json
$cs2Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/class-subjects/$cs2Id" -Method Put -Body $updateBody -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($cs2Updated.teacherId -eq $t1Id) "Science updated with Teacher"

# 8. List Subjects for Class
Write-Host "Listing Subjects for Class..."
$subjects = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Get -Headers $adminHeaders
Assert-Check ($subjects.Count -eq 2) "Found 2 subjects for class"

Write-Host "CLASS SUBJECT VERIFICATION COMPLETE" -ForegroundColor Cyan
