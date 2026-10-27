Write-Host "Testing connection to Supabase pooler (aws-0-ap-northeast-1.pooler.supabase.com:5432)..."
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("aws-0-ap-northeast-1.pooler.supabase.com", 5432)
    Write-Host "SUCCESS: TCP connection to Supabase pooler on port 5432 is OPEN!"
    $tcp.Close()
} catch {
    Write-Host "ERROR on pooler 5432: $($_.Exception.Message)"
}

try {
    $tcp6543 = New-Object System.Net.Sockets.TcpClient
    $tcp6543.Connect("aws-0-ap-northeast-1.pooler.supabase.com", 6543)
    Write-Host "SUCCESS: TCP connection to Supabase pooler on port 6543 is OPEN!"
    $tcp6543.Close()
} catch {
    Write-Host "ERROR on pooler 6543: $($_.Exception.Message)"
}

try {
    $tcpDirect = New-Object System.Net.Sockets.TcpClient
    $tcpDirect.Connect("db.yipexommqztxnvpckqyi.supabase.co", 5432)
    Write-Host "SUCCESS: TCP connection to direct host is OPEN!"
    $tcpDirect.Close()
} catch {
    Write-Host "ERROR on direct host: $($_.Exception.Message)"
}
