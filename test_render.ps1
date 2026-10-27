$loginBody = @{ email = 'learner@tilshunos.app'; password = 'Learner123!' } | ConvertTo-Json
$res = Invoke-RestMethod -Uri 'https://tilshunos.onrender.com/api/v1/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
Write-Host "RENDER API SUCCESS! Learner Token: $($res.token.Substring(0, 30))..."
Write-Host "User: $($res.user.firstName) $($res.user.lastName) ($($res.user.email))"

$materials = Invoke-RestMethod -Uri 'https://tilshunos.onrender.com/api/v1/materials' -Method Get
Write-Host "Total Materials on Render (from Supabase): $($materials.Count)"
