Add-Type -Path "C:\Users\Soxibjon\.nuget\packages\npgsql\10.0.3\lib\net10.0\Npgsql.dll"
$connString = "Host=aws-0-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.yipexommqztxnvpckqyi;Password=s0x1bj0n$02$;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;"

$conn = New-Object Npgsql.NpgsqlConnection($connString)
try {
    $conn.Open()
    Write-Host "Connected to Supabase!"
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    $reader = $cmd.ExecuteReader()
    $count = 0
    while ($reader.Read()) {
        $count++
        Write-Host "Table: $($reader.GetString(0))"
    }
    Write-Host "Total public tables on Supabase: $count"
    $reader.Close()
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    $conn.Close()
}
