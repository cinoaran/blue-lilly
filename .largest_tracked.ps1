# Lists the top 30 tracked files by size in the repo
$repoRoot = Get-Location
$files = git ls-files
$items = @()
foreach ($f in $files) {
    try {
        $p = Get-Item -LiteralPath $f -ErrorAction Stop
        $items += [PSCustomObject]@{ Size = $p.Length; Path = $f }
    } catch {
        # ignore
    }
}
$items | Sort-Object Size -Descending | Select-Object -First 30 | ForEach-Object {
    "{0,12:N0} bytes`t{1}" -f $_.Size, $_.Path
}
