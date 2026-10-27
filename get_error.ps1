try {
    $res = Invoke-WebRequest -Uri "https://tilshunos.onrender.com/api/v1/materials" -UseBasicParsing
    Write-Host "Success! Status:" $res.StatusCode
} catch {
    Write-Host "Caught error:" $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "500 Response Body:" $body
    }
}
