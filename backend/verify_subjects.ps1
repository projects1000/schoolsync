# verify_subjects.ps1

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

# 1. Login as Admin
Write-Host "Logging in as Admin..."
$loginBody = @{
    email = "admin@littlesteps.com"
    password = "password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Create Subject "Math"
Write-Host "Creating Subject 'Math'..."
$mathBody = @{
    name = "Math"
    description = "Mathematics"
} | ConvertTo-Json

try {
    $math = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body $mathBody -Headers $headers -ContentType "application/json"
    Assert-Check ($math.name -eq "Math") "Subject 'Math' created"
    $mathId = $math.id
} catch {
    Write-Error "Failed to create subject: $_"
}

# 3. Create Duplicate Subject "Math"
Write-Host "Attempting to create duplicate Subject 'Math'..."
try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Post -Body $mathBody -Headers $headers -ContentType "application/json"
    Write-Error "FAIL: Duplicate subject creation should have failed"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) "Duplicate creation failed as expected"
}

# 4. Get All Subjects
Write-Host "Fetching all subjects..."
$subjects = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Get -Headers $headers
Assert-Check ($subjects.Count -ge 1) "Received subjects list"
$foundMath = $subjects | Where-Object { $_.id -eq $mathId }
Assert-Check ($foundMath -ne $null) "Found 'Math' in list"

# 5. Update Subject
Write-Host "Updating 'Math' to 'Mathematics'..."
$updateBody = @{
    name = "Mathematics"
    description = "Advanced Math"
    active = $true
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects/$mathId" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
Assert-Check ($updated.name -eq "Mathematics") "Subject name updated"

# 6. Delete Subject
Write-Host "Deleting Subject..."
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects/$mathId" -Method Delete -Headers $headers
try {
    # Verify deletion by fetching all
    $newSubjects = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/subjects" -Method Get -Headers $headers
    $deletedMath = $newSubjects | Where-Object { $_.id -eq $mathId }
    Assert-Check ($deletedMath -eq $null) "Subject deleted successfully"
} catch {
    Write-Error "Failed to verify deletion: $_"
}

Write-Host "VERIFICATION COMPLETE" -ForegroundColor Cyan
