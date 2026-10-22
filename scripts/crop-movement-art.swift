import AppKit
import Foundation

guard CommandLine.arguments.count == 11 else {
  fputs("usage: crop-movement-art <source> <output> <x> <y> <width> <height> <content-width> <content-height> <canvas-width> <canvas-height>\n", stderr)
  exit(2)
}

let sourcePath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]
let values = CommandLine.arguments[3...10].compactMap(Int.init)
guard values.count == 8 else {
  fputs("crop coordinates and sizes must be integers\n", stderr)
  exit(2)
}

let x = values[0]
let y = values[1]
let cropWidth = values[2]
let cropHeight = values[3]
let contentWidth = values[4]
let contentHeight = values[5]
let canvasWidth = values[6]
let canvasHeight = values[7]

guard let source = NSImage(contentsOfFile: sourcePath),
      let sourceCG = source.cgImage(forProposedRect: nil, context: nil, hints: nil),
      x >= 0, y >= 0, cropWidth > 0, cropHeight > 0,
      x + cropWidth <= sourceCG.width, y + cropHeight <= sourceCG.height,
      let crop = sourceCG.cropping(to: CGRect(x: x, y: y, width: cropWidth, height: cropHeight)),
      let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: canvasWidth,
        pixelsHigh: canvasHeight,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
      ) else {
  fputs("unable to load or crop source image\n", stderr)
  exit(1)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight).fill()

let scale = min(Double(contentWidth) / Double(cropWidth), Double(contentHeight) / Double(cropHeight))
let targetWidth = Double(cropWidth) * scale
let targetHeight = Double(cropHeight) * scale
let target = NSRect(
  x: (Double(canvasWidth) - targetWidth) / 2,
  y: (Double(canvasHeight) - targetHeight) / 2,
  width: targetWidth,
  height: targetHeight
)
let sourceDividerInset = max(1, cropWidth / 100)
let sourceMiddle = cropWidth / 2
let leftCropWidth = sourceMiddle - sourceDividerInset
let rightCropX = sourceMiddle + sourceDividerInset
let rightCropWidth = cropWidth - rightCropX

func horizontalInkCenter(_ image: CGImage) -> Double {
  let pixels = NSBitmapImageRep(cgImage: image)
  var minX = pixels.pixelsWide
  var maxX = -1

  for y in 0..<pixels.pixelsHigh {
    for x in 0..<pixels.pixelsWide {
      guard let color = pixels.colorAt(x: x, y: y)?.usingColorSpace(.deviceRGB) else { continue }
      let luminance = 0.2126 * color.redComponent + 0.7152 * color.greenComponent + 0.0722 * color.blueComponent
      if color.alphaComponent > 0.1 && luminance < 0.72 {
        minX = min(minX, x)
        maxX = max(maxX, x)
      }
    }
  }

  return maxX >= minX ? Double(minX + maxX) / 2 : Double(pixels.pixelsWide) / 2
}

if let leftCrop = crop.cropping(to: CGRect(x: 0, y: 0, width: leftCropWidth, height: cropHeight)),
   let rightCrop = crop.cropping(to: CGRect(x: rightCropX, y: 0, width: rightCropWidth, height: cropHeight)) {
  let leftTargetWidth = Double(leftCropWidth) * scale
  let rightTargetWidth = Double(rightCropWidth) * scale
  let leftTargetX = Double(canvasWidth) / 4 - horizontalInkCenter(leftCrop) * scale
  let rightTargetX = Double(canvasWidth) * 3 / 4 - horizontalInkCenter(rightCrop) * scale

  NSImage(cgImage: leftCrop, size: NSSize(width: leftCropWidth, height: cropHeight)).draw(
    in: NSRect(x: leftTargetX, y: target.minY, width: leftTargetWidth, height: targetHeight),
    from: .zero,
    operation: .sourceOver,
    fraction: 1,
    respectFlipped: true,
    hints: [.interpolation: NSImageInterpolation.high]
  )
  NSImage(cgImage: rightCrop, size: NSSize(width: rightCropWidth, height: cropHeight)).draw(
    in: NSRect(x: rightTargetX, y: target.minY, width: rightTargetWidth, height: targetHeight),
    from: .zero,
    operation: .sourceOver,
    fraction: 1,
    respectFlipped: true,
    hints: [.interpolation: NSImageInterpolation.high]
  )

  NSColor(calibratedWhite: 0.83, alpha: 1).setStroke()
  let divider = NSBezierPath()
  divider.lineWidth = 1
  divider.move(to: NSPoint(x: Double(canvasWidth) / 2, y: target.minY))
  divider.line(to: NSPoint(x: Double(canvasWidth) / 2, y: target.maxY))
  divider.stroke()
} else {
  fputs("unable to split movement phases\n", stderr)
  exit(1)
}
NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else {
  fputs("unable to encode output PNG\n", stderr)
  exit(1)
}

do {
  try png.write(to: URL(fileURLWithPath: outputPath), options: .atomic)
} catch {
  fputs("unable to write output PNG: \(error)\n", stderr)
  exit(1)
}
