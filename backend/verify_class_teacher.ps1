# verify_class_teacher.ps1

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

# 2. Setup: Create Teacher and 2 Classes
Write-Host "Setting up Teacher and Classes..."
$rand = Get-Random -Minimum 1000 -Maximum 9999

# Create Teacher
$teacherBody = @{
    name = "Teacher $rand"
    email = "teacher$rand@test.com"
    phone = "987654$rand"
    department = "Science"
    qualification = "B.Ed"
    experience = "5 years"
    joiningDate = "2023-01-01"
    password = "password123"
} | ConvertTo-Json
$teacher = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/teachers" -Method Post -Body $teacherBody -Headers $headers -ContentType "application/json"
$teacherId = $teacher.teacher.id
Write-Host "Created Teacher: $teacherId"

# Create Class 1
$class1Body = @{
    name = "Class 1-$rand"
    capacity = 30
    room = "101"
} | ConvertTo-Json
$class1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $class1Body -Headers $headers -ContentType "application/json"
$class1Id = $class1.id
Write-Host "Created Class 1: $class1Id"

# Create Class 2
$class2Body = @{
    name = "Class 2-$rand"
    capacity = 30
    room = "102"
} | ConvertTo-Json
$class2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $class2Body -Headers $headers -ContentType "application/json"
$class2Id = $class2.id
Write-Host "Created Class 2: $class2Id"

# 3. Assign Teacher to Class 1 (Update)
Write-Host "Assigning Teacher to Class 1..."
$updateBody1 = @{
    classTeacherId = $teacherId
} | ConvertTo-Json
$updatedClass1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$class1Id" -Method Put -Body $updateBody1 -Headers $headers -ContentType "application/json"
Assert-Check ($updatedClass1.classTeacher.id -eq $teacherId) "Teacher assigned to Class 1"

# 4. Attempt Assign Teacher to Class 2 (Should Fail)
Write-Host "Attempting Assign Teacher to Class 2 (Expect Fail)..."
try {
    $updateBody2 = @{
        classTeacherId = $teacherId
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$class2Id" -Method Put -Body $updateBody2 -Headers $headers -ContentType "application/json"
    Write-Error "FAIL: Should have rejected dual assignment"
} catch {
    Assert-Check ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::BadRequest) "Dual assignment rejected"
}

# 5. Unassign from Class 1
Write-Host "Unassigning Teacher from Class 1..."
$unassignBody = @{
    classTeacherId = ""
} | ConvertTo-Json
$unassignedClass1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$class1Id" -Method Put -Body $unassignBody -Headers $headers -ContentType "application/json"
Assert-Check ($unassignedClass1.classTeacher -eq $null) "Teacher unassigned from Class 1"

# 6. Assign to Class 2 (Should Success now)
Write-Host "Assigning Teacher to Class 2..."
$updateBody2Retry = @{
    classTeacherId = $teacherId
} | ConvertTo-Json
$updatedClass2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes/$class2Id" -Method Put -Body $updateBody2Retry -Headers $headers -ContentType "application/json"
Assert-Check ($updatedClass2.classTeacher.id -eq $teacherId) "Teacher re-assigned to Class 2"

Write-Host "VERIFICATION COMPLETE" -ForegroundColor Cyan
