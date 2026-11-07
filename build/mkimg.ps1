Add-Type -AssemblyName System.Drawing
$b=$PSScriptRoot
$src=[System.Drawing.Image]::FromFile("$b\logo-1024.png")
foreach($s in 16,24,32,48,64,128,256,512){
  $bmp=New-Object System.Drawing.Bitmap $s,$s
  $g=[System.Drawing.Graphics]::FromImage($bmp); $g.InterpolationMode='HighQualityBicubic'; $g.SmoothingMode='HighQuality'; $g.PixelOffsetMode='HighQuality'
  $g.DrawImage($src,0,0,$s,$s); $g.Dispose(); $bmp.Save("$b\icon-$s.png",[System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
$src.Dispose()
foreach($n in 'sidebar','unsidebar','header'){
  $i=[System.Drawing.Image]::FromFile("$b\$n.png"); $o=New-Object System.Drawing.Bitmap $i.Width,$i.Height,([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g=[System.Drawing.Graphics]::FromImage($o); $g.Clear([System.Drawing.Color]::White); $g.DrawImage($i,0,0,$i.Width,$i.Height); $g.Dispose()
  $o.Save("$b\$n.bmp",[System.Drawing.Imaging.ImageFormat]::Bmp); $o.Dispose(); $i.Dispose()
}
