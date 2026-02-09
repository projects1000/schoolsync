
# 1. Login as Super Admin
$superLoginUrl = "http://localhost:8082/api/auth/login"
$superLoginBody = @{
    email = "admin@littlesteps.com" 
    password = "SecureLittleSteps2024!" 
} | ConvertTo-Json

try {
    $superResponse = Invoke-RestMethod -Uri $superLoginUrl -Method Post -Body $superLoginBody -ContentType "application/json"
    $superToken = $superResponse.token
    $superHeaders = @{
        Authorization = "Bearer $superToken"
    }
    Write-Host "Logged in as Super Admin."
} catch {
    Write-Host "Super Admin Login failed."
    exit
}

# 2. Create School
$uniqueId = Get-Random -Minimum 10000 -Maximum 99999
$schoolCode = "SCH$uniqueId"
$schoolBody = @{
    name = "Test School $uniqueId"
    code = $schoolCode
    address = "123 Test St"
    city = "Test City"
    state = "Test State"
    pincode = "123456"
    phone = "9876543210"
    email = "school$uniqueId@test.com"
} | ConvertTo-Json

try {
    $school = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools" -Method Post -Body $schoolBody -Headers $superHeaders -ContentType "application/json"
    Write-Host "Created School: $($school.name) ($($school.id))"
} catch {
    Write-Error "Failed to create school: $_"
    exit
}

# 3. Create Admin for School
$adminEmail = "admin$uniqueId@test.com"
$adminPassword = "password123"
$adminBody = @{
    name = "Test Admin $uniqueId"
    email = $adminEmail
    password = $adminPassword
    phone = "9876543210"
} | ConvertTo-Json

try {
    $adminUser = Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)/admin" -Method Post -Body $adminBody -Headers $superHeaders -ContentType "application/json"
    Write-Host "Created Admin: $($adminUser.email)"
} catch {
    Write-Error "Failed to create admin: $_"
    # Cleanup school
    Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)" -Method Delete -Headers $superHeaders
    exit
}

# 4. Login as New School Admin
$adminLoginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri $superLoginUrl -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminResponse.token
    $adminHeaders = @{
        Authorization = "Bearer $adminToken"
    }
    Write-Host "Logged in as New School Admin."
} catch {
    Write-Error "Failed to login as new admin: $_"
    exit
}

# 5. Create Class
$classBody = @{
    name = "Class 1"
    grade = "1"
    section = "A"
    capacity = 30
    room = "101"
} | ConvertTo-Json

try {
    $class = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/classes" -Method Post -Body $classBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Created Class: $($class.name) ($($class.id))"
} catch {
    Write-Error "Failed to create class: $_"
    exit
}

# 6. Create Section
# Note: SectionController expects a Section entity.
$sectionBody = @{
    name = "A"
    classId = $class.id
    schoolId = $school.id # Should be ignored/overwritten by controller but safe to send
} | ConvertTo-Json

try {
    $section = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/sections" -Method Post -Body $sectionBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Created Section: $($section.name) ($($section.id))"
} catch {
    Write-Error "Failed to create section: $_"
    exit
}

# 7. Create Students and Verify Roll No
# Create "Zack" first - should get Roll 1 initially
$student1Body = @{
    name = "Zack Student"
    age = 6
    classId = $class.id
    sectionId = $section.id
    guardian = "Guardian One"
    guardianPhone = "1111111111"
    guardianEmail = "g1@test.com"
} | ConvertTo-Json

try {
    $s1 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $student1Body -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Created 'Zack Student': Roll No $($s1.rollNo)"
} catch {
    Write-Error "Failed to create student 1: $_"
    exit
}

# Create "Aaron" - should become Roll 1, and Zack should become Roll 2
$student2Body = @{
    name = "Aaron Student"
    age = 6
    classId = $class.id
    sectionId = $section.id
    guardian = "Guardian Two"
    guardianPhone = "2222222222"
    guardianEmail = "g2@test.com"
} | ConvertTo-Json

try {
    $s2 = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students" -Method Post -Body $student2Body -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Created 'Aaron Student': Roll No $($s2.rollNo)"
} catch {
    Write-Error "Failed to create student 2: $_"
    exit
}

# Refetch Zack to see if his roll number updated
$s1Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/$($s1.id)" -Method Get -Headers $adminHeaders

Write-Host "After adding Aaron:"
Write-Host "Aaron Roll No: $($s2.rollNo)"
Write-Host "Zack Roll No: $($s1Updated.rollNo)"

if ($s2.rollNo -eq 1 -and $s1Updated.rollNo -eq 2) {
    Write-Host "SUCCESS: Roll numbers are sorted alphabetically."
} else {
    Write-Error "FAILURE: Alphabetical sorting failed. Expected Aaron=1, Zack=2. Got Aaron=$($s2.rollNo), Zack=$($s1Updated.rollNo)"
}

# 9. Test Renaming (Edit Name) mechanism
# Rename "Aaron" (Roll 1) to "Zara" -> Should become Roll 2
# Zack (Roll 2) -> Should become Roll 1

Write-Host "Renaming Aaron to Zara..."
$updateBody = @{
    name = "Zara Student"
} | ConvertTo-Json

try {
    $s2Updated = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/$($s2.id)" -Method Put -Body $updateBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Renamed Student. New Name: $($s2Updated.name). New Roll No: $($s2Updated.rollNo)"
} catch {
    Write-Error "Failed to update student: $_"
    exit
}

# Refetch Zack (was Roll 2)
$s1Refetched = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/$($s1.id)" -Method Get -Headers $adminHeaders
Write-Host "Zack Roll No: $($s1Refetched.rollNo)"

if ($s1Refetched.rollNo -eq 1 -and $s2Updated.rollNo -eq 2) {
    Write-Host "SUCCESS: Roll numbers updated correctly after rename."
} else {
    Write-Error "FAILURE: Rename update failed. Expected Zack=1, Zara=2. Got Zack=$($s1Refetched.rollNo), Zara=$($s2Updated.rollNo)"
}

# 10. Test Section Transfer
# Create Section B
$sectionBBody = @{
    name = "B"
    classId = $class.id
} | ConvertTo-Json

try {
    $sectionB = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/sections" -Method Post -Body $sectionBBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Created Section B: $($sectionB.id)"
} catch {
    Write-Error "Failed to create section B: $_"
    exit
}

# Move Zara (Roll 2 in A) to Section B
# Expect: Zara becomes Roll 1 in B. Zack (Roll 1 in A) remains Roll 1 in A. 
# (Note: If we had 3 students in A, the gaps would close. Here we just strictly check destination.)

Write-Host "Moving Zara to Section B..."
$moveBody = @{
    sectionId = $sectionB.id
    classId = $class.id
} | ConvertTo-Json

try {
    $zaraMoved = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/students/$($s2.id)" -Method Put -Body $moveBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Moved Zara. New Section: $($zaraMoved.sectionId). Roll No: $($zaraMoved.rollNo)"
} catch {
    Write-Error "Failed to move student: $_"
    exit
}

if ($zaraMoved.rollNo -eq 1) {
    Write-Host "SUCCESS: Zara assigned Roll 1 in new section."
} else {
    Write-Error "FAILURE: Transfer failed. Expected Roll 1. Got $($zaraMoved.rollNo)"
}

# 8. Cleanup (Delete School - should cascade conceptually or just leave it)
# We log in as Super Admin again to delete? We still have headers.
try {
   Invoke-RestMethod -Uri "http://localhost:8082/api/superadmin/schools/$($school.id)" -Method Delete -Headers $superHeaders
   Write-Host "Cleaned up School."
} catch {
    Write-Host "Failed to cleanup school (might need manual cleanup): $_"
}
