export const TOKENS = [
  { key: "first_name", label: "First Name", example: "John" },
  { key: "last_name", label: "Last Name", example: "Doe" },
  { key: "full_name", label: "Full Name", example: "John Doe" },
  { key: "location_name", label: "Location Name", example: "Acme Dental" },
  { key: "location_phone", label: "Location Phone", example: "+1 555-0100" },
] as const;

export function resolveTemplate(
  template: string,
  contact: any,
  workspace: any,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    switch (key) {
      case "first_name":
        return contact?.firstName || "";
      case "last_name":
        return contact?.lastName || "";
      case "full_name":
        return [contact?.firstName, contact?.lastName]
          .filter(Boolean)
          .join(" ");
      case "location_name":
        return workspace?.name || "";
      case "location_phone":
        return workspace?.twilioPhoneNumber?.phoneNumber || "";
      default:
        return match;
    }
  });
}

export function previewTemplate(template: string): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const token = TOKENS.find((t) => t.key === key);
    return token ? token.example : match;
  });
}
