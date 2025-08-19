# 1) rename all .png in assets\img\dunca to kebab-case (lowercase, spaces -> hyphens)
Get-ChildItem "assets\img\dunca" -Filter *.png | ForEach-Object {
  $new = ($_.Name.ToLower() -replace ' ', '-')
  if ($_.Name -ne $new) { Rename-Item $_.FullName $new }
}

# 2) (if you have tiles in a subfolder too)
Get-ChildItem "assets\img\dunca\tiles" -Filter *.png | ForEach-Object {
  $new = ($_.Name.ToLower() -replace ' ', '-')
  if ($_.Name -ne $new) { Rename-Item $_.FullName $new }
}
