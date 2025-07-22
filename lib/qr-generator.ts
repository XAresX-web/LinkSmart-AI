import QRCode from "qrcode"

export interface QRStyle {
  size: number
  margin: number
  color: {
    dark: string
    light: string
  }
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
}

export const defaultQRStyle: QRStyle = {
  size: 256,
  margin: 4,
  color: {
    dark: "#000000",
    light: "#ffffff",
  },
  errorCorrectionLevel: "M",
}

export async function generateQRCode(data: string, style: QRStyle = defaultQRStyle): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: style.size,
      margin: style.margin,
      color: style.color,
      errorCorrectionLevel: style.errorCorrectionLevel,
    })

    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeSVG(data: string, style: QRStyle = defaultQRStyle): Promise<string> {
  try {
    const qrCodeSVG = await QRCode.toString(data, {
      type: "svg",
      width: style.size,
      margin: style.margin,
      color: style.color,
      errorCorrectionLevel: style.errorCorrectionLevel,
    })

    return qrCodeSVG
  } catch (error) {
    console.error("Error generating QR code SVG:", error)
    throw new Error("Failed to generate QR code SVG")
  }
}

export function downloadQRCode(dataURL: string, filename = "qr-code.png") {
  const link = document.createElement("a")
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
