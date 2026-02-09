# verify_bulk_subjects.ps1

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
    name = "Bulk Subject School $(Get-Random)"
    code = "BLK$(Get-Random)"
    address = "Test Address"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "1234567890"
    email = "blkschool_$(Get-Random)@test.com"
} | ConvertTo-Json
$school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
$schoolId = $school.id

# 1.2 Create New Admin
Write-Host "Creating New Admin..."
$adminEmail = "blkadmin_$(Get-Random)@test.com"
$adminBody = @{
    name = "Bulk Admin"
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

# 2. Setup: 1 Class
Write-Host "Setting up Class..."
$rand = Get-Random
$c1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body (@{
    name = "Class Bulk-$rand"; capacity = 30; room = "101"
} | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$c1Id = $c1.id

# 3. Create 3 Subjects
Write-Host "Creating 3 Subjects..."
$s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{ name = "Physics $rand"; description = "Physics" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{ name = "Chem $rand"; description = "Chemistry" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"
$s3 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body (@{ name = "Bio $rand"; description = "Biology" } | ConvertTo-Json) -Headers $adminHeaders -ContentType "application/json"

$subjectIds = @($s1.id, $s2.id, $s3.id)

# 4. Bulk Assign Subjects
Write-Host "Bulk Assigning Subjects..."
$assignBody = @{ subjectIds = $subjectIds } | ConvertTo-Json
$bulkAssigned = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"

Assert-Check ($bulkAssigned.Count -eq 3) "3 Subjects assigned in bulk"

# 5. Verify Assignments
Write-Host "Verifying Assignments..."
$subjects = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$c1Id/subjects" -Method Get -Headers $adminHeaders
Assert-Check ($subjects.Count -eq 3) "Found 3 subjects for class"
$foundIds = $subjects | ForEach-Object { $_.subjectId }
Assert-Check ($foundIds -contains $s1.id -and $foundIds -contains $s2.id -and $foundIds -contains $s3.id) "All subject IDs match"

Write-Host "BULK SUBJECT ASSIGNMENT VERIFICATION COMPLETE" -ForegroundColor Cyan
