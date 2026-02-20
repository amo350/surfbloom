export type ParsedCSV = {
  headers: string[];
  rows: string[][];
  rowCount: number;
};

export function parseCSV(text: string): ParsedCSV {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [], rowCount: 0 };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows, rowCount: rows.length };
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

export const CONTACT_FIELDS = [
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "stage", label: "Stage", required: false },
  { key: "notes", label: "Notes", required: false },
] as const;

export type ColumnMapping = Record<string, string | null>;

export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  const matchers: Record<string, RegExp> = {
    firstName: /^(first[\s_-]?name|fname|given[\s_-]?name|first)$/i,
    lastName: /^(last[\s_-]?name|lname|surname|family[\s_-]?name|last)$/i,
    email: /^(email|e[\s_-]?mail|email[\s_-]?address)$/i,
    phone: /^(phone|phone[\s_-]?number|mobile|cell|tel|telephone)$/i,
    stage: /^(stage|status|lead[\s_-]?stage|pipeline)$/i,
    notes: /^(notes?|comments?|description)$/i,
  };

  for (const header of headers) {
    for (const [field, regex] of Object.entries(matchers)) {
      if (
        regex.test(header.trim()) &&
        !Object.values(mapping).includes(field)
      ) {
        mapping[header] = field;
        break;
      }
    }
    if (!mapping[header]) {
      mapping[header] = null; // unmapped
    }
  }

  return mapping;
}

export function applyMapping(
  rows: string[][],
  headers: string[],
  mapping: ColumnMapping,
): Record<string, string>[] {
  return rows.map((row) => {
    const contact: Record<string, string> = {};
    headers.forEach((header, i) => {
      const field = mapping[header];
      if (field && row[i]) {
        contact[field] = row[i];
      }
    });
    return contact;
  });
}
