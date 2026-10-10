// Static mock data used only for visual presentation of the DataGuard prototype.
// These are sample records, not real database records.

export const statCards = [
  {
    key: "total",
    label: "Total Records",
    value: "128,540",
    delta: "+4.2%",
    trend: "up" as const,
    sub: "vs last month",
    accent: "indigo",
  },
  {
    key: "unique",
    label: "Unique Records",
    value: "121,906",
    delta: "+3.1%",
    trend: "up" as const,
    sub: "deduplicated set",
    accent: "emerald",
  },
  {
    key: "duplicates",
    label: "Duplicates Detected",
    value: "6,634",
    delta: "-12.8%",
    trend: "down" as const,
    sub: "flagged this cycle",
    accent: "amber",
  },
  {
    key: "quality",
    label: "Data Quality Score",
    value: "94.7%",
    delta: "+1.6%",
    trend: "up" as const,
    sub: "overall health",
    accent: "sky",
  },
];

export const recordsTrend = [
  { month: "Jan", records: 98000, duplicates: 9200 },
  { month: "Feb", records: 102500, duplicates: 8700 },
  { month: "Mar", records: 106800, duplicates: 8100 },
  { month: "Apr", records: 111200, duplicates: 7900 },
  { month: "May", records: 116400, duplicates: 7300 },
  { month: "Jun", records: 121000, duplicates: 6900 },
  { month: "Jul", records: 128540, duplicates: 6634 },
];

export const qualityBreakdown = [
  { name: "Valid", value: 118420, color: "#4f46e5" },
  { name: "Warnings", value: 7486, color: "#f59e0b" },
  { name: "Invalid", value: 2634, color: "#ef4444" },
];

export const sourceData = [
  { source: "CRM", clean: 42000, dupes: 2100 },
  { source: "Billing", clean: 31000, dupes: 1450 },
  { source: "Web Forms", clean: 24000, dupes: 1900 },
  { source: "Imports", clean: 16500, dupes: 980 },
  { source: "API", clean: 8406, dupes: 204 },
];

export const recentActivity = [
  {
    id: "REC-90231",
    name: "Olivia Bennett",
    email: "olivia.bennett@northwind.io",
    source: "CRM",
    status: "Unique",
    score: 98,
    date: "Jul 14, 2026",
  },
  {
    id: "REC-90230",
    name: "Olivia Bennet",
    email: "olivia.bennett@northwind.io",
    source: "Web Forms",
    status: "Duplicate",
    score: 61,
    date: "Jul 14, 2026",
  },
  {
    id: "REC-90228",
    name: "Marcus Lee",
    email: "m.lee@brightpath.com",
    source: "Billing",
    status: "Unique",
    score: 95,
    date: "Jul 13, 2026",
  },
  {
    id: "REC-90225",
    name: "Priya Raman",
    email: "priya@ravenlabs.dev",
    source: "API",
    status: "Warning",
    score: 74,
    date: "Jul 13, 2026",
  },
  {
    id: "REC-90219",
    name: "Daniel Cho",
    email: "daniel.cho@meridian.co",
    source: "Imports",
    status: "Unique",
    score: 91,
    date: "Jul 12, 2026",
  },
  {
    id: "REC-90210",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@lumen.app",
    source: "CRM",
    status: "Duplicate",
    score: 58,
    date: "Jul 12, 2026",
  },
];

export const allRecords = [
  { id: "REC-90231", name: "Olivia Bennett", email: "olivia.bennett@northwind.io", phone: "+1 415 220 1180", source: "CRM", status: "Unique", date: "Jul 14, 2026" },
  { id: "REC-90230", name: "Olivia Bennet", email: "olivia.bennett@northwind.io", phone: "+1 415 220 1180", source: "Web Forms", status: "Duplicate", date: "Jul 14, 2026" },
  { id: "REC-90228", name: "Marcus Lee", email: "m.lee@brightpath.com", phone: "+1 650 981 2231", source: "Billing", status: "Unique", date: "Jul 13, 2026" },
  { id: "REC-90225", name: "Priya Raman", email: "priya@ravenlabs.dev", phone: "+44 20 7946 0102", source: "API", status: "Warning", date: "Jul 13, 2026" },
  { id: "REC-90219", name: "Daniel Cho", email: "daniel.cho@meridian.co", phone: "+1 212 555 0147", source: "Imports", status: "Unique", date: "Jul 12, 2026" },
  { id: "REC-90210", name: "Sofia Alvarez", email: "sofia.alvarez@lumen.app", phone: "+34 91 123 4567", source: "CRM", status: "Duplicate", date: "Jul 12, 2026" },
  { id: "REC-90204", name: "James O'Connor", email: "james.oconnor@vertex.io", phone: "+353 1 437 2200", source: "Billing", status: "Unique", date: "Jul 11, 2026" },
  { id: "REC-90198", name: "Hana Suzuki", email: "hana.suzuki@keystone.jp", phone: "+81 3 5050 1234", source: "Web Forms", status: "Warning", date: "Jul 11, 2026" },
  { id: "REC-90191", name: "Lucas Moreau", email: "lucas.moreau@atlas.fr", phone: "+33 1 70 18 22 90", source: "API", status: "Unique", date: "Jul 10, 2026" },
  { id: "REC-90187", name: "Amara Okafor", email: "amara.okafor@novum.ng", phone: "+234 1 271 0022", source: "Imports", status: "Unique", date: "Jul 10, 2026" },
  { id: "REC-90182", name: "Marcus Lee", email: "marcus.lee@brightpath.com", phone: "+1 650 981 2231", source: "CRM", status: "Duplicate", date: "Jul 09, 2026" },
  { id: "REC-90175", name: "Elena Petrova", email: "elena.petrova@sever.ru", phone: "+7 495 120 0088", source: "Billing", status: "Unique", date: "Jul 09, 2026" },
];

export const duplicatePairs = [
  {
    id: "DUP-4471",
    confidence: 97,
    reason: "Matching email + name similarity",
    master: { id: "REC-90231", name: "Olivia Bennett", email: "olivia.bennett@northwind.io", phone: "+1 415 220 1180", source: "CRM", date: "Jul 14, 2026" },
    duplicate: { id: "REC-90230", name: "Olivia Bennet", email: "olivia.bennett@northwind.io", phone: "+1 415 220 1180", source: "Web Forms", date: "Jul 14, 2026" },
  },
  {
    id: "DUP-4468",
    confidence: 92,
    reason: "Matching email + phone",
    master: { id: "REC-90228", name: "Marcus Lee", email: "m.lee@brightpath.com", phone: "+1 650 981 2231", source: "Billing", date: "Jul 13, 2026" },
    duplicate: { id: "REC-90182", name: "Marcus Lee", email: "marcus.lee@brightpath.com", phone: "+1 650 981 2231", source: "CRM", date: "Jul 09, 2026" },
  },
  {
    id: "DUP-4460",
    confidence: 85,
    reason: "Fuzzy name + same company domain",
    master: { id: "REC-90210", name: "Sofia Alvarez", email: "sofia.alvarez@lumen.app", phone: "+34 91 123 4567", source: "CRM", date: "Jul 12, 2026" },
    duplicate: { id: "REC-90120", name: "Sofía Álvarez", email: "s.alvarez@lumen.app", phone: "+34 91 123 4567", source: "Imports", date: "Jul 06, 2026" },
  },
];

export const validationRules = [
  { rule: "Valid email format", passed: 124210, failed: 2130, severity: "high" },
  { rule: "Phone number format", passed: 119880, failed: 4660, severity: "medium" },
  { rule: "Required fields present", passed: 126900, failed: 1640, severity: "high" },
  { rule: "No leading/trailing spaces", passed: 127410, failed: 1130, severity: "low" },
  { rule: "Valid country code", passed: 122340, failed: 6200, severity: "medium" },
];

export const activityLog = [
  { time: "10:42 AM", date: "Jul 14, 2026", actor: "Kacie Velasquez", action: "merged 42 duplicate records", target: "CRM dataset", type: "merge" },
  { time: "09:18 AM", date: "Jul 14, 2026", actor: "System", action: "completed scheduled deduplication scan", target: "All sources", type: "scan" },
  { time: "08:05 AM", date: "Jul 14, 2026", actor: "Daniel Cho", action: "imported 3,120 new records", target: "Imports", type: "import" },
  { time: "04:51 PM", date: "Jul 13, 2026", actor: "System", action: "flagged 118 validation warnings", target: "Web Forms", type: "warning" },
  { time: "02:30 PM", date: "Jul 13, 2026", actor: "Priya Raman", action: "updated matching rule set", target: "Duplicate Detection", type: "settings" },
  { time: "11:12 AM", date: "Jul 13, 2026", actor: "Marcus Lee", action: "exported quality report", target: "Overview", type: "export" },
  { time: "09:00 AM", date: "Jul 13, 2026", actor: "System", action: "data quality score increased to 94.7%", target: "Overview", type: "scan" },
];
