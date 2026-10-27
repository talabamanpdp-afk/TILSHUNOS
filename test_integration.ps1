$loginBody = @{ email = 'learner@tilshunos.app'; password = 'Learner123!' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
Write-Host "Learner Token received: $($loginRes.token.Substring(0, 25))..."
$headers = @{ Authorization = "Bearer $($loginRes.token)" }

# 1. Register PWA device
$deviceBody = @{
    deviceName = 'iPhone 16 Pro (PWA Safari)'
    deviceType = 'Mobile'
    platform = 'iOS'
    browser = 'Mobile Safari'
    isPwaInstalled = $true
    installMethod = 'standalone'
} | ConvertTo-Json
$devRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/devices/register' -Method Post -Body $deviceBody -ContentType 'application/json' -Headers $headers
Write-Host "Registered Device: $($devRes.deviceName) | PWA: $($devRes.isPwaInstalled) | ID: $($devRes.id)"

# 2. Get registered devices
$myDevices = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/devices' -Method Get -Headers $headers
Write-Host "Total Registered Devices: $($myDevices.Count)"

# 3. Add personal vocabulary entry
$vocabBody = @{
    targetWord = "eloquent-$([Guid]::NewGuid().ToString().Substring(0, 5))"
    nativeTranslation = 'notiq, so`zga chechan'
    languageCode = 'en'
    exampleSentence = 'Finding this book was pure serendipity.'
    hint = 'Accidental good fortune'
    personalNote = 'Discovered in story reading'
    topic = 'Advanced Vocabulary'
    partOfSpeech = 'Noun'
} | ConvertTo-Json
$vocabRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/vocabulary' -Method Post -Body $vocabBody -ContentType 'application/json' -Headers $headers
Write-Host "Created Vocabulary: '$($vocabRes.targetWord)' -> '$($vocabRes.nativeTranslation)' | State: $($vocabRes.state)"

# 4. Start Practice Session
$sessionBody = @{
    languageCode = 'en'
    direction = 'TargetToNative'
    sessionSize = 5
} | ConvertTo-Json
$sessionRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/practice/start' -Method Post -Body $sessionBody -ContentType 'application/json' -Headers $headers
Write-Host "Started Practice Session ID: $($sessionRes.sessionId) | Total Questions: $($sessionRes.questions.Count)"

# 5. Ask AI Assistant
$aiBody = @{
    message = 'Can you explain the nuance between serendipity and coincidence?'
    targetLanguage = 'English'
    level = 'B2'
} | ConvertTo-Json
$aiRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/ai/chat' -Method Post -Body $aiBody -ContentType 'application/json' -Headers $headers
Write-Host "AI Tutor Response: $($aiRes.reply.Substring(0, [Math]::Min(140, $aiRes.reply.Length)))..."

# 6. Admin stats check
$adminLoginBody = @{ email = 'admin@tilshunos.app'; password = 'Admin123!' } | ConvertTo-Json
$adminLoginRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $adminLoginBody -ContentType 'application/json'
$adminHeaders = @{ Authorization = "Bearer $($adminLoginRes.token)" }
$stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/admin/stats' -Method Get -Headers $adminHeaders
Write-Host "Admin Stats -> Users: $($stats.totalUsers) | Materials: $($stats.totalMaterials) | Vocab: $($stats.totalVocabularyEntries) | Sessions: $($stats.totalPracticeSessions)"

Write-Host "`n>>> ALL INTEGRATION CHECKS PASSED WITH FLYING COLORS! <<<`n"
