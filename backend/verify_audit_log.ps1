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

# 1. Login as Super Admin
Write-Host "Logging in as Super Admin..."
$loginBody = @{
    email = "admin@littlesteps.com"
    password = "password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Create School
Write-Host "Creating School..."
$rand = Get-Random -Minimum 1000 -Maximum 9999
$schoolName = "Audit Log School $rand"
$schoolCode = "AUDIT$rand"
$adminEmail = "adminaudit$rand@test.com"

$schoolBody = @{
    name = $schoolName
    code = $schoolCode
    address = "Audit St"
    city = "Audit City"
    state = "Audit State"
    pincode = "123456"
    phone = "1234567890"
    email = "audit$rand@school.com"
} | ConvertTo-Json

try {
    $schoolResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $headers -ContentType "application/json"
    $schoolId = $schoolResponse.id
    Write-Host "School Created: $schoolId"
} catch {
    $e = $_.Exception
    if ($e.Response) {
        $reader = New-Object System.IO.StreamReader($e.Response.GetResponseStream())
        $resp = $reader.ReadToEnd()
        Write-Error "Create School Failed: $($e.Response.StatusCode) $resp"
    }
    throw
}

# 3. Create Admin for School
Write-Host "Creating Admin for School..."
$adminBody = @{
    name = "Audit Admin"
    email = $adminEmail
    password = "password"
    phone = "9876543210"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$schoolId/admin" -Method Post -Body $adminBody -Headers $headers -ContentType "application/json"
    Write-Host "Admin Created: $adminEmail"
} catch {
    $e = $_.Exception
    if ($e.Response) {
        $reader = New-Object System.IO.StreamReader($e.Response.GetResponseStream())
        $resp = $reader.ReadToEnd()
        Write-Error "Create Admin Failed: $($e.Response.StatusCode) $resp"
    }
    throw
}

# 4. Login as New Admin
Write-Host "Logging in as New Admin ($adminEmail)..."
$adminLoginBody = @{
    email = $adminEmail
    password = "password"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminLoginResponse.token
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }
    Write-Host "Admin Logged In"
} catch {
     $e = $_.Exception
    if ($e.Response) {
        $reader = New-Object System.IO.StreamReader($e.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Error "Admin Login Failed: $($e.Response.StatusCode). Body: $responseBody"
    } else {
        Write-Error "Admin Login Failed: $_"
    }
    throw
}

# 4. Create Class and Section
Write-Host "Creating Class and Section..."
$classBody = @{
    name = "Class 1"
    grade = "1"
    section = "A"
} | ConvertTo-Json

$classResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $classBody -Headers $adminHeaders -ContentType "application/json"
$classId = $classResponse.id
$sectionId = "A" # Assuming sectionId is 'A' logic or we interpret classId as enough, but AuditLog expects sectionId. 
# Wait, classes controller returns class object. Let's assume section is A.
# Actually StudentService uses sectionId. In our case Class object has section.
# We usually pass sectionId as the ID if separate, or the string.
# In StudentDTO, sectionId is string (Ref: StudentDTO.java).

# 5. Create Students to trigger roll number generation and logging
Write-Host "Creating Students..."

$s1Body = @{
    name = "Alice Audit"
    age = 6
    classId = $classResponse.id
    sectionId = "A"
    guardian = "G1"
    guardianPhone = "111"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $s1Body -Headers $adminHeaders -ContentType "application/json"

$s2Body = @{
    name = "Bob Audit"
    age = 6
    classId = $classResponse.id
    sectionId = "A"
    guardian = "G2"
    guardianPhone = "222"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $s2Body -Headers $adminHeaders -ContentType "application/json"

# 6. Verify Audit Log
Write-Host "Verifying Audit Log..."
# We need an endpoint to fetch audit logs.
# AdminController usually exposes audit logs.
# GET /api/admin/audit-logs
try {
    $logs = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/audit-logs" -Method Get -Headers $adminHeaders
    
    $recalcLogs = $logs | Where-Object { $_.action -eq "ROLL_NO_RECALCULATED" }
    
    if ($recalcLogs.Count -gt 0) {
        Write-Host "SUCCESS: Found $($recalcLogs.Count) ROLL_NO_RECALCULATED logs." -ForegroundColor Green
        $log = $recalcLogs[0]
        Write-Host "Log Entry: $($log | ConvertTo-Json -Depth 5)"
        
        Assert-Check ($log.classId -eq $classId) "Class ID matches"
        Assert-Check ($log.sectionId -eq "A") "Section ID matches"
        Assert-Check ($log.affectedStudentIds.Count -gt 0) "Affected Student IDs present"
        Assert-Check ($log.actorUser.email -eq $adminEmail) "Actor is Admin"
    } else {
        Write-Error "FAIL: No ROLL_NO_RECALCULATED logs found."
    }

} catch {
    $e = $_.Exception
    if ($e.Response) {
        $reader = New-Object System.IO.StreamReader($e.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Error "Request Failed with Status $($e.Response.StatusCode). Response Body: $responseBody"
    } else {
        Write-Error "Request Failed: $_"
    }
}
