import QRCode from "qrcode";

export function buildSmsUri(phone: string, keyword: string): string {
  // sms: URI scheme — works on iOS and Android
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `sms:${cleaned}?body=${encodeURIComponent(keyword)}`;
}

export async function generateQRCodeDataUrl(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  },
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options?.width || 512,
    margin: options?.margin || 2,
    color: {
      dark: options?.darkColor || "#000000",
      light: options?.lightColor || "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
}

export async function generateQRCodeSvg(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  },
): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: options?.width || 512,
    margin: options?.margin || 2,
    color: {
      dark: options?.darkColor || "#000000",
      light: options?.lightColor || "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
}
