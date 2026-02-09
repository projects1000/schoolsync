# verify_assign_teacher_endpoint.ps1

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
    name = "Assign Endpoint School $(Get-Random)"
    code = "AES$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "assignschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id

# 1.2 Create New Admin
Write-Host "Creating New Admin..."
$adminEmail = "assignadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "Assign Admin"
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

# 2. Setup: 2 Teachers
Write-Host "Setting up Teachers..."
$rand = Get-Random
$t1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{
    name = "AT1 $rand"; email = "at1$rand@test.com"; phone = "900000$rand"; department = "Math"; qualification = "B.Ed"; experience = "5 years"; joiningDate = "2023-01-01"; password = "password123"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t1Id = $t1.teacher.id

$t2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body (@{
    name = "AT2 $rand"; email = "at2$rand@test.com"; phone = "911111$rand"; department = "Sci"; qualification = "B.Ed"; experience = "3 years"; joiningDate = "2023-01-01"; password = "password123"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$t2Id = $t2.teacher.id

# 3. Create Class C1 (No Teacher)
Write-Host "Creating Class C1..."
$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{
    name = "Class AC1-$rand"; capacity = 30; room = "101"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id

# 4. Assign T1 to C1 via Endpoint (Should Success)
Write-Host "Assigning T1 to C1 via Endpoint..."
$assignBody = @{ teacherId = $t1Id } | ConvertTo-Json
$c1Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/assign-class-teacher" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($c1Updated.classTeacherId -eq $t1Id) "T1 assigned to C1"

# 5. Create Class C2
Write-Host "Creating Class C2..."
$c2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{
    name = "Class AC2-$rand"; capacity = 30; room = "102"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c2Id = $c2.id

# 6. Attempt Assign T1 to C2 (Should Fail - Already Assigned)
Write-Host "Attempting Assign T1 to C2 (Should Fail)..."
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c2Id/assign-class-teacher" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"
    Write-Error "FAIL: Should not support assigning same teacher to multiple classes via endpoint"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) "Blocked assigning T1 to C2"
}

# 7. Assign T2 to C2 (Should Success)
Write-Host "Assigning T2 to C2..."
$assignBody2 = @{ teacherId = $t2Id } | ConvertTo-Json
$c2Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c2Id/assign-class-teacher" -Method Post -Body $assignBody2 -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($c2Updated.classTeacherId -eq $t2Id) "T2 assigned to C2"

Write-Host "ASSIGN CLASS TEACHER ENDPOINT VERIFICATION COMPLETE" -ForegroundColor Cyan
