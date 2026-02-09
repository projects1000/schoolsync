# verify_class_teacher_assignment.ps1

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
    name = "Verify CT School $(Get-Random)"
    code = "VCT$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "verifyctschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id
Write-Host "Created School: $schoolId"

# 1.2 Create New Admin for this School
Write-Host "Creating New Admin..."
$adminEmail = "verifyctadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "Verify CT Admin"
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


# 2. Setup: 2 Teachers
Write-Host "Setting up Teachers..."
$rand = Get-Random -Minimum 1000 -Maximum 9999

# Teacher 1
$t1Body = @{
    name = "T1 $rand"
    email = "t1$rand@test.com"
    phone = "900000$rand"
    department = "Math"
    qualification = "B.Ed"
    experience = "5 years"
    joiningDate = "2023-01-01"
    password = "password123"
} | ConvertTo-Json
$t1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body $t1Body -Headers $adminHeaders -ContentType "application/json"
$t1Id = $t1.teacher.id
Write-Host "Created Teacher 1: $t1Id"

# Teacher 2
$t2Body = @{
    name = "T2 $rand"
    email = "t2$rand@test.com"
    phone = "911111$rand"
    department = "Social"
    qualification = "B.Ed"
    experience = "3 years"
    joiningDate = "2023-01-01"
    password = "password123"
} | ConvertTo-Json
$t2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body $t2Body -Headers $adminHeaders -ContentType "application/json"
$t2Id = $t2.teacher.id
Write-Host "Created Teacher 2: $t2Id"

# 3. Create Class C1 with Teacher 1 (Should Success)
Write-Host "Creating Class C1 with Teacher 1..."
$c1Body = @{
    name = "Class C1-$rand"
    capacity = 30
    room = "101"
    classTeacherId = $t1Id
} | ConvertTo-Json
$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $c1Body -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id
Assert-Check ($c1.classTeacherId -eq $t1Id) "Class C1 created with Teacher 1"

# 4. Attempt to Create Class C2 with Teacher 1 (Should Fail)
Write-Host "Attempting to create Class C2 with Teacher 1 (Should Fail)..."
$c2Body = @{
    name = "Class C2-$rand"
    capacity = 30
    room = "102"
    classTeacherId = $t1Id
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $c2Body -Headers $adminHeaders -ContentType "application/json"
    Write-Error "FAIL: Should not support assigning same teacher to multiple classes"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) "Blocked assigning Teacher 1 to second class"
}

# 5. Create Class C2 with Teacher 2 (Should Success)
Write-Host "Creating Class C2 with Teacher 2..."
$c2CorrectBody = @{
    name = "Class C2-$rand"
    capacity = 30
    room = "102"
    classTeacherId = $t2Id
} | ConvertTo-Json
$c2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $c2CorrectBody -Headers $adminHeaders -ContentType "application/json"
$c2Id = $c2.id
Assert-Check ($c2.classTeacherId -eq $t2Id) "Class C2 created with Teacher 2"

# 6. Update Class C1 to remove Teacher 1
Write-Host "Removing Teacher 1 from Class C1..."
$c1UpdateBody = @{
    classTeacherId = ""
} | ConvertTo-Json
$c1Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id" -Method Put -Body $c1UpdateBody -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($c1Updated.classTeacherId -eq $null) "Teacher 1 removed from Class C1"

# 7. Update Class C2 to assign Teacher 1 (Should Success now)
Write-Host "Assigning Teacher 1 to Class C2..."
$c2UpdateBody = @{
    classTeacherId = $t1Id
} | ConvertTo-Json
$c2Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c2Id" -Method Put -Body $c2UpdateBody -Headers $adminHeaders -ContentType "application/json"
Assert-Check ($c2Updated.classTeacherId -eq $t1Id) "Teacher 1 assigned to Class C2 successfully"

Write-Host "STRICT CLASS TEACHER ASSIGNMENT VERIFICATION COMPLETE" -ForegroundColor Cyan
