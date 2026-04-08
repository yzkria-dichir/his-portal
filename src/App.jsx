import { useState, useEffect, useCallback, useRef } from "react";
import { loadData, saveData, subscribeData } from "./firebase.js";

// ━━━ PALETTE (DICHIR white + blue) ━━━
const P = {
  bg: "#F5F7FA", bgAlt: "#FFFFFF", surface: "#FFFFFF", surfaceHover: "#F0F4F8",
  border: "#E2E8F0", borderLight: "#CBD5E1", accent: "#1B75BB", accentDim: "#E8F2FC",
  green: "#0F9D58", greenDim: "#E6F5EC", amber: "#F5A623", amberDim: "#FEF5E0",
  red: "#E53935", redDim: "#FDECEB", purple: "#7B3FE4", purpleDim: "#F0EAFC",
  text: "#1A2744", textMuted: "#4A5C78", textDim: "#8896AB",
  navy: "#0B1B35", navyLight: "#132B50",
};

// ━━━ DEFAULT DATA ━━━
const DEFAULT_DATA = {
  modules: [
    {
      id: "mp", name: "Patient Registration", shortName: "Registration", icon: "📋", color: "#1B75BB", status: "documented", version: "1.0",
      description: "Patient demographics, MRN management, duplicate detection, merge workflows, family linking, newborn registration, and unknown patient handling.",
      compliance: ["JCI IPSG", "JCI IM", "CBAHI IM", "CBAHI Medico-Legal"],
    },
    { id: "op", name: "Outpatient", shortName: "Outpatient", icon: "📅", color: "#10B981", status: "documented", version: "1.0", description: "Outpatient clinic management, appointment booking, scheduling, calendar management, slot configuration, waitlist management.", compliance: [] },
    { id: "co", name: "Core / Administration", shortName: "Core", icon: "⚙️", color: "#F59E0B", status: "pending", version: "—", description: "System configuration, user management, RBAC, facility setup, lookup tables.", compliance: [] },
    { id: "emergency", name: "Emergency Department", shortName: "ER", icon: "🚑", color: "#EF4444", status: "pending", version: "—", description: "Triage, emergency visits, bed management, acuity classification.", compliance: [] },
    { id: "billing", name: "Billing & Revenue Cycle", shortName: "Billing", icon: "💰", color: "#8B5CF6", status: "pending", version: "—", description: "Charge capture, claims, insurance processing, payment posting.", compliance: [] },
    { id: "clinical", name: "Clinical Documentation", shortName: "Clinical", icon: "🩺", color: "#EC4899", status: "pending", version: "—", description: "Clinical notes, orders, medication administration, nursing documentation.", compliance: [] },
    { id: "pharmacy", name: "Pharmacy", shortName: "Pharmacy", icon: "💊", color: "#06B6D4", status: "pending", version: "—", description: "Medication dispensing, inventory, drug interaction checking.", compliance: [] },
    { id: "lab", name: "Laboratory", shortName: "Lab", icon: "🔬", color: "#84CC16", status: "pending", version: "—", description: "Lab orders, specimen tracking, result entry, LIS integration.", compliance: [] },
    { id: "radiology", name: "Radiology", shortName: "Radiology", icon: "📡", color: "#F97316", status: "pending", version: "—", description: "Imaging orders, scheduling, reporting, PACS integration.", compliance: [] },
  ],
  screens: {
    mp: [
      { id: "s1", name: "Patient Search", icon: "🔍", description: "Search for existing patients using multiple identifiers.", reqIds: ["FR-REG-001"], actors: ["Registration Clerk"], actions: ["Search","Clear","Register New","Edit Selected"],
        wireframe: "\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  \ud83d\udd0d Patient Search                            \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502  Search By: [All \u25be] [________________] [Search]\u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 MRN  \u2502 Name   \u2502 NatID \u2502 DOB  \u2502 Gender\u2502 Status \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 1001 \u2502 Ahmed  \u2502 299.. \u2502 1999 \u2502 Male  \u2502 Active \u2502\n\u2502 1002 \u2502 Sara   \u2502 288.. \u2502 1988 \u2502 Female\u2502 Active \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502   [Register New Patient] [Edit Selected]      \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
        fields: [{ name: "search_query", label: "Search Query", type: "text", required: true, note: "MRN, National ID, Passport, Name, DOB", group: "Search" }, { name: "search_type", label: "Search Type", type: "dropdown", required: false, note: "All | MRN | National ID | Passport | Name | DOB", group: "Search" }],
        behavior: ["Partial and phonetic matching supported","Results sorted by relevance","Clicking result opens patient detail","No results prompts new registration","Duplicate detection runs in background"],
        apiEndpoints: [{ method: "GET", path: "/api/v1/patients/search", params: "?q={query}&type={type}&page&limit", response: "{ patients, total, duplicateWarnings }" }],
      },
      { id: "s2", name: "Patient Registration", icon: "📋", description: "Create new patient records with demographics, IDs, and financial info.", reqIds: ["FR-REG-002","FR-REG-003","FR-REG-004","FR-REG-005","FR-REG-006","FR-REG-007","FR-REG-008","FR-REG-009","FR-REG-010","FR-REG-011","FR-REG-019","FR-REG-030","FR-REG-060"], actors: ["Registration Clerk","HIM Staff"], actions: ["Save & Generate MRN","Save Temporary","Cancel","Print Label","Print Card","Print Wristband"],
        wireframe: "\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  \ud83d\udccb Patient Registration         MRN: [Auto-Generated]  \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502 \u250c\u2500 Name \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502\n\u2502 \u2502 Prefix [\u25be]  First* [____] Family* [________]     \u2502 \u2502\n\u2502 \u2502 \ud83d\udd04 Arabic \u21c4 English Translation                    \u2502 \u2502\n\u2502 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2502\n\u2502 \u250c\u2500 Demographics \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502\n\u2502 \u2502 DOB* [__/__/____]  Gender* [\u25be]  Nationality* [\u25be]  \u2502 \u2502\n\u2502 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2502\n\u2502 \u250c\u2500 Identifiers \u2500\u2500 [+ Add] \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502\n\u2502 \u2502 Type* [\u25be]  Number* [__________]  Expiry [__]    \u2502 \u2502\n\u2502 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2502\n\u2502 \u250c\u2500 Financial \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502\n\u2502 \u2502 Policy Group* [\u25be]  Company [\u25be]  Class [\u25be]        \u2502 \u2502\n\u2502 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2502\n\u2502  \u26a0 DUPLICATE WARNING: 2 matches found [View]        \u2502\n\u2502  [\ud83d\udcbe Save & Generate MRN] [\ud83d\udcdd Save Temp] [Cancel]    \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
        fieldGroups: [
          { section: "Name Information", fieldNames: ["prefix","first_name_en","second_name_en","third_name_en","family_name_en","first_name_ar","family_name_ar"] },
          { section: "Demographics", fieldNames: ["dob","gender","nationality","marital_status","religion","preferred_language"] },
          { section: "Identifiers (Multiple — FR-REG-008)", fieldNames: ["identifier_type","identifier_number","identifier_expiry","identifier_document"] },
          { section: "Contact Information", fieldNames: ["mobile","email"] },
          { section: "Financial Information", fieldNames: ["policy_group","company","policy_class"] },
        ],
        fields: [
          { name: "prefix", label: "Prefix", type: "dropdown", required: false, note: "Mr, Mrs, Ms, Dr, Prof", group: "Name Information" },
          { name: "first_name_en", label: "First Name (EN)", type: "text", required: true, note: "Max 50 chars, alpha", group: "Name Information" },
          { name: "second_name_en", label: "Second Name (EN)", type: "text", required: false, note: "Max 50 chars", group: "Name Information" },
          { name: "third_name_en", label: "Third Name (EN)", type: "text", required: false, note: "", group: "Name Information" },
          { name: "family_name_en", label: "Family Name (EN)", type: "text", required: true, note: "", group: "Name Information" },
          { name: "first_name_ar", label: "First Name (AR)", type: "text", required: false, note: "Auto-translate (FR-REG-007)", group: "Name Information" },
          { name: "family_name_ar", label: "Family Name (AR)", type: "text", required: false, note: "", group: "Name Information" },
          { name: "dob", label: "Date of Birth", type: "date", required: true, note: "Cannot be future", group: "Demographics" },
          { name: "gender", label: "Gender", type: "dropdown", required: true, note: "Male | Female", group: "Demographics" },
          { name: "nationality", label: "Nationality", type: "dropdown", required: true, note: "ISO country code", group: "Demographics" },
          { name: "marital_status", label: "Marital Status", type: "dropdown", required: false, note: "Single|Married|Divorced|Widowed", group: "Demographics" },
          { name: "religion", label: "Religion", type: "dropdown", required: false, note: "Configurable lookup", group: "Demographics" },
          { name: "preferred_language", label: "Preferred Language", type: "dropdown", required: false, note: "Arabic|English|Other", group: "Demographics" },
          { name: "identifier_type", label: "Identifier Type", type: "dropdown", required: true, note: "National ID|Passport|Gov ID. Repeatable.", group: "Identifiers" },
          { name: "identifier_number", label: "Identifier Number", type: "text", required: true, note: "Unique (FR-REG-060)", group: "Identifiers" },
          { name: "identifier_expiry", label: "Expiry Date", type: "date", required: false, note: "FR-REG-031", group: "Identifiers" },
          { name: "identifier_document", label: "Scan/Upload", type: "file", required: false, note: "PDF, JPG, PNG (FR-REG-030)", group: "Identifiers" },
          { name: "mobile", label: "Mobile", type: "tel", required: true, note: "International format", group: "Contact Information" },
          { name: "email", label: "Email", type: "email", required: false, note: "", group: "Contact Information" },
          { name: "policy_group", label: "Policy Group", type: "dropdown", required: true, note: "Cash, Bupa, Tawuniya, etc.", group: "Financial Information" },
          { name: "company", label: "Company", type: "dropdown", required: false, note: "Linked to policy group", group: "Financial Information" },
          { name: "policy_class", label: "Policy/Class", type: "dropdown", required: false, note: "Class A, B, C", group: "Financial Information" },
        ],
        behavior: ["MRN auto-generated, unique, never reused (FR-REG-005)","Real-time duplicate detection (FR-REG-002)","Duplicate warning bar with comparison link (FR-REG-003)","Configurable mandatory fields (FR-REG-009)","Validation rules per identifier type (FR-REG-010)","Arabic\u2194English translation (FR-REG-007)","Multiple identifiers supported (FR-REG-008)","Document upload: PDF, JPG, PNG (FR-REG-030)","All changes audit logged (FR-REG-018)","Role-based permissions (FR-REG-015)","SMS/WhatsApp on registration (FR-REG-076)"],
        apiEndpoints: [
          { method: "POST", path: "/api/v1/patients", params: "Body: { demographics, identifiers[], contacts, financial }", response: "{ patient: { mrn }, duplicateWarnings }" },
          { method: "POST", path: "/api/v1/patients/check-duplicate", params: "Body: { firstName, familyName, dob, nationalId }", response: "{ duplicates, confidence }" },
          { method: "POST", path: "/api/v1/patients/translate-name", params: "Body: { name, from, to }", response: "{ translatedName }" },
        ],
      },
      { id: "s3", name: "Change Patient Details", icon: "✏️", description: "Edit existing patient data with audit logging.", reqIds: ["FR-REG-014","FR-REG-078"], actors: ["Registration Clerk","HIM Staff"], actions: ["Save Changes","Cancel","View Audit History"],
        fields: [{ name: "change_reason", label: "Change Reason", type: "textarea", required: true, note: "Mandatory before save" }],
        behavior: ["Pre-populated with current values","Changed fields highlighted","Reason mandatory","Original values in audit trail","Logged: user, time, workstation, old/new"],
        apiEndpoints: [{ method: "PUT", path: "/api/v1/patients/:mrn", params: "Body: { changes, reason }", response: "{ patient, auditEntry }" }, { method: "GET", path: "/api/v1/patients/:mrn/audit", params: "?page&limit", response: "{ entries, total }" }],
      },
      { id: "s4", name: "Merge Patients", icon: "🔗", description: "Multi-step merge workflow: identify, request, review, execute.", reqIds: ["FR-REG-016","FR-REG-017","FR-REG-020","FR-REG-021","FR-REG-022","FR-REG-023","FR-REG-024","FR-REG-025","FR-REG-026","FR-REG-027","FR-REG-072"], actors: ["Registration Clerk","HIM Staff","Front Desk Supervisor","HIM Supervisor"], actions: ["Initiate Merge","Review","Approve","Reject","Execute","Unmerge"],
        fields: [],
        behavior: ["Step 1: Identify duplicates, read-only comparison","Step 2: Enter justification, select master record","Step 3: Different user reviews, approve/reject","Step 4: System merges after approval, history preserved","Post-merge notification to downstream","Unmerge available to HIM Manager"],
        apiEndpoints: [{ method: "POST", path: "/api/v1/merges", params: "Body: { recordA_mrn, recordB_mrn, master_mrn, justification }", response: "{ mergeRequest }" }, { method: "PUT", path: "/api/v1/merges/:id/review", params: "Body: { decision, reason? }", response: "{ mergeRequest }" }, { method: "POST", path: "/api/v1/merges/:id/execute", params: "", response: "{ mergeResult }" }],
      },
      { id: "s5", name: "Activate / Deactivate MRN", icon: "⚡", description: "Manage MRN active/inactive status.", reqIds: ["FR-REG-028","FR-REG-029"], actors: ["HIM Staff","Supervisor"], actions: ["Change Status","Cancel","View History"],
        fields: [{ name: "new_status", label: "New Status", type: "dropdown", required: true, note: "Active | Inactive" }, { name: "justification", label: "Justification", type: "textarea", required: true, note: "Mandatory for deactivation" }],
        behavior: ["Inactive MRNs blocked from new encounters","Historical data remains accessible","No MRN deletion permitted","All changes audit logged"],
        apiEndpoints: [{ method: "PUT", path: "/api/v1/patients/:mrn/status", params: "Body: { status, justification }", response: "{ patient, auditEntry }" }],
      },
      { id: "s6", name: "Family Linking", icon: "👨‍👩‍👧‍👦", description: "Link MRNs under a family group.", reqIds: ["FR-REG-034","FR-REG-035","FR-REG-036"], actors: ["Registration Clerk","Supervisor"], actions: ["Add Member","Remove","Change Head"],
        fields: [{ name: "head_mrn", label: "Head of Family MRN", type: "text", required: true, note: "Must be active" }, { name: "member_mrn", label: "Member MRN", type: "text", required: true, note: "" }, { name: "relationship", label: "Relationship", type: "dropdown", required: true, note: "Spouse|Son|Daughter|Father|Mother|Sibling|Other" }],
        behavior: ["Head must be active MRN","Configurable relationship types","No clinical data shared by default","Head change requires Supervisor"],
        apiEndpoints: [{ method: "POST", path: "/api/v1/families", params: "Body: { headOfFamilyMrn }", response: "{ family }" }, { method: "POST", path: "/api/v1/families/:id/members", params: "Body: { mrn, relationship }", response: "{ member }" }],
      },
      { id: "s7", name: "Newborn Registration", icon: "👶", description: "Register newborns with mother linking.", reqIds: ["FR-REG-044","FR-REG-045","FR-REG-046","FR-REG-047","FR-REG-048","FR-REG-049","FR-REG-050","FR-REG-051","FR-REG-052","FR-REG-053","FR-REG-054"], actors: ["Registration Clerk","Nurse"], actions: ["Save & Generate MRN","Print ID Band","Verify Mother-Newborn","Update Legal Name"],
        fields: [{ name: "mother_mrn", label: "Mother's MRN", type: "text", required: true, note: "Mandatory (JCI)" }, { name: "temp_name", label: "Temp Name", type: "text", required: true, note: "Auto: Baby of [Mother]" }, { name: "dob", label: "DOB/Time", type: "datetime", required: true, note: "" }, { name: "gender", label: "Gender", type: "dropdown", required: true, note: "Male|Female|Indeterminate" }, { name: "birth_weight", label: "Weight (g)", type: "number", required: true, note: "" }, { name: "birth_order", label: "Birth Order", type: "dropdown", required: false, note: "Twin A/B, Triplet A/B/C" }],
        behavior: ["Unique MRN separate from mother","Mother link mandatory (JCI)","Auto temp name configurable","Birth order mandatory for multiples","ID band needs 2 identifiers (JCI)","Record cannot be deleted (medico-legal)"],
        apiEndpoints: [{ method: "POST", path: "/api/v1/patients/newborn", params: "Body: { motherMrn, gender, dob, birthWeight, birthOrder? }", response: "{ newborn: { mrn, tempName } }" }],
      },
      { id: "s8", name: "Unknown / Mass Registration", icon: "❓", description: "Register unknown/emergency patients.", reqIds: ["FR-REG-012","FR-REG-013","FR-REG-073","FR-REG-074","FR-REG-075"], actors: ["Registration Clerk"], actions: ["Register Unknown","Mass Register","Convert to Permanent"],
        fields: [{ name: "gender", label: "Gender", type: "dropdown", required: true, note: "Male|Female" }, { name: "estimated_age", label: "Estimated Age", type: "number", required: true, note: "" }, { name: "count", label: "# Patients (mass)", type: "number", required: false, note: "For mass registration" }],
        behavior: ["Auto-name: Unknown {Gender} ({Serial}) {Date} {Time}","Temp MRN flagged","Mass creates multiple in one step","Convert triggers full registration","Billing defaults to Cash"],
        apiEndpoints: [{ method: "POST", path: "/api/v1/patients/unknown", params: "Body: { gender, estimatedAge }", response: "{ patient: { mrn, tempName } }" }, { method: "POST", path: "/api/v1/patients/unknown/mass", params: "Body: { count, gender }", response: "{ patients: [...] }" }],
      },
    ],
    op: [
      { id: "s1", name:"Appointment Scheduling Screen",icon: "\uD83D\uDCC5", description: "Search patients and book appointments with calendar view", reqIds: ["FR-OUT-001","FR-OUT-002","FR-OUT-004","FR-OUT-005","FR-OUT-006","FR-OUT-044","FR-OUT-046","FR-OUT-047","FR-OUT-048"], actors: ["Call Center Agent","Front Desk"], actions: ["Search","Book","View Calendar","Drag Reschedule"], fields: [], behavior: ["Patient search by MRN, national ID, name","Book with minimum details when MRN unavailable","Clinic/Doctor/Room-based scheduling","Visit type selection","Drag-and-drop rescheduling","Quick action context menu","Smart slot suggestions"], apiEndpoints: [{ method:"GET",path:"/api/v1/appointments/search",params:"Query: mrn, nationalId, name, date",response:"{ appointments: [...] }" },{ method:"POST",path:"/api/v1/appointments",params:"Body: { patientMrn, clinicId, physicianId, date, time, visitTypeId }",response:"{ appointment: { id, status } }" },{ method:"GET",path:"/api/v1/appointments/suggestions",params:"Query: clinicId, date",response:"{ slots: [...] }" }], fieldGroups: [] },
      { id: "s2", name: "Appointment Management Screen", icon: "\uD83D\uDD0D", description: "Reschedule and cancel appointments with audit logging", reqIds: ["FR-OUT-010","FR-OUT-022","FR-OUT-026","FR-OUT-049"], actors: ["Call Center Agent","Front Desk"], actions: ["Reschedule","Cancel","View History","Waitlist"], fields: [], behavior: ["Modification rules enforced; exceptions logged","No-show tracking","Waitlist management","All changes audit-logged"], apiEndpoints: [{ method:"PUT",path:"/api/v1/appointments/:id/reschedule",params:"Body: { newDate, newTime, reason }",response:"{ appointment }" },{ method:"PUT",path:"/api/v1/appointments/:id/cancel",params:"Body: { reason }",response:"{ status }" },{ method:"POST",path:"/api/v1/waitlist",params:"Body: { patientMrn, clinicId, specialtyId }",response:"{ waitlistEntry }" }], fieldGroups: [] },
      { id: "s3", name: "Bulk Appointment Operations Screen", icon: "\uD83D\uDCCB", description: "Reschedule or cancel multiple appointments in bulk", reqIds: ["FR-OUT-037","FR-OUT-038","FR-OUT-039"], actors: ["Clinic Supervisor"], actions: ["Bulk Reschedule","Bulk Cancel","Notify"], fields: [], behavior: ["Bulk reschedule clinic-to-clinic or physician-to-physician","Reason must be captured","Notifications via SMS/Email/WhatsApp"], apiEndpoints: [{ method:"POST",path:"/api/v1/appointments/bulk-reschedule",params:"Body: { appointmentIds, newClinicId, reason }",response:"{ updated, failed }" },{ method:"POST",path:"/api/v1/appointments/bulk-cancel",params:"Body: { appointmentIds, reason }",response:"{ cancelled }" },{ method:"POST",path:"/api/v1/notifications/bulk",params:"Body: { appointmentIds, channel, templateId }",response:"{ sent }" }], fieldGroups: [] },
      { id: "s4", name: "Patient Check-In Screen", icon: "\u2705", description: "Register patient arrival and complete registration", reqIds: ["FR-OUT-011","FR-OUT-012","FR-OUT-013","FR-OUT-024","FR-OUT-025"], actors: ["Front Desk"], actions: ["Check-In","Complete Registration","Initiate Visit"], fields: [], behavior: ["Check-in at clinic","Complete registration/create MRN if missing","Initiate visit linked to MRN","Block encounter without MRN","Handle walk-ins"], apiEndpoints: [{ method:"POST",path:"/api/v1/visits/check-in",params:"Body: { appointmentId, patientMrn }",response:"{ visit: { id, status } }" },{ method:"POST",path:"/api/v1/visits",params:"Body: { appointmentId, patientMrn, clinicId }",response:"{ visit: { visitId } }" }], fieldGroups: [] },
      { id: "s5", name: "Visit Services & Billing Screen", icon: "\uD83D\uDCB0", description: "Add clinic services, retrieve pricing, generate charges", reqIds: ["FR-OUT-014","FR-OUT-015","FR-OUT-016","FR-OUT-017","FR-OUT-018","FR-OUT-023"], actors: ["Front Desk","HIS System"], actions: ["Add Service","Remove","Generate Charges","Validate"], fields: [], behavior: ["Add clinic services to visit","Pricing from price lists","Auto-generate charges","Billing validation","All actions audit-logged"], apiEndpoints: [{ method:"POST",path:"/api/v1/visits/:id/services",params:"Body: { serviceId, quantity }",response:"{ visitService: { id, amount } }" },{ method:"POST",path:"/api/v1/visits/:id/billing",params:"Body: { visitId }",response:"{ transaction: { id, total } }" }], fieldGroups: [] },
      { id: "s6", name: "Payment Receipt Screen", icon: "\uD83E\uDDFE", description: "Print or generate payment receipts", reqIds: ["FR-OUT-040","FR-OUT-041","FR-OUT-042","FR-OUT-043"], actors: ["Front Desk"], actions: ["Print","Email","Reprint"], fields: [], behavior: ["Visit details, services, amount","Templates per facility","Print/PDF/electronic","Language preference"], apiEndpoints: [{ method:"GET",path:"/api/v1/receipts/:id",params:"Path: transactionId",response:"{ receipt }" },{ method:"POST",path:"/api/v1/receipts/:id/print",params:"Body: { format, language }",response:"{ pdfUrl }" }], fieldGroups: [] },
      { id: "s7", name: "Clinic Configuration Screen", icon: "\u2699\uFE0F", description: "Configure clinics, services, schedules, and rules", reqIds: ["FR-OUT-027","FR-OUT-028","FR-OUT-029","FR-OUT-030","FR-OUT-031","FR-OUT-045"], actors: ["HIS Administrator"], actions: ["Add Clinic","Edit","Deactivate","Assign Specialty"], fields: [], behavior: ["Clinic master config","Operating days/hours","Specialty assignment","Service catalog","Visit type config"], apiEndpoints: [{ method:"GET",path:"/api/v1/clinics",params:"Query: facilityId, specialtyId",response:"{ clinics: [...] }" },{ method:"POST",path:"/api/v1/clinics",params:"Body: { code, name, facilityId, specialtyId, timing }",response:"{ clinic }" },{ method:"PUT",path:"/api/v1/clinics/:id",params:"Body: { ...fields }",response:"{ clinic }" }], fieldGroups: [] },
      { id: "s8", name: "Scheduling Configuration Screen", icon: "\uD83D\uDD27", description: "Define slot durations, capacity, overbooking limits", reqIds: ["FR-OUT-032","FR-OUT-033","FR-OUT-034","FR-OUT-035","FR-OUT-036"], actors: ["HIS Administrator"], actions: ["Configure Slots","Set Capacity","Set Overbooking","Create Schedule"], fields: [], behavior: ["Slot duration per clinic/service","Max appointments per session","Schedule creation","Overbooking limits and flagging"], apiEndpoints: [{ method:"POST",path:"/api/v1/clinic-schedules",params:"Body: { clinicId, dayOfWeek, slotDuration, maxAppts, overbookLimit }",response:"{ schedule }" },{ method:"PUT",path:"/api/v1/clinic-schedules/:id",params:"Body: { ...fields }",response:"{ schedule }" }], fieldGroups: [] },
      { id: "s9", name: "Referral Management Screen", icon: "\uD83D\uDCE8", description: "View, filter, and book referral appointments", reqIds: ["FR-OUT-059","FR-OUT-060","FR-OUT-061","FR-OUT-062","FR-OUT-063","FR-OUT-064","FR-OUT-065","FR-OUT-066","FR-OUT-067","FR-OUT-068","FR-OUT-069"], actors: ["Receptionist"], actions: ["View","Book","Filter","Reschedule","Close"], fields: [], behavior: ["Display unbooked referrals","Filter by specialty/priority/date","Book using OPD rules","Assign practitioner","Auto-update status","Close after encounter"], apiEndpoints: [{ method:"GET",path:"/api/v1/referrals",params:"Query: status, specialtyId, priority, dateFrom",response:"{ referrals: [...] }" },{ method:"POST",path:"/api/v1/referrals/:id/book",params:"Body: { clinicId, physicianId, date, time }",response:"{ appointment, referral }" },{ method:"PUT",path:"/api/v1/referrals/:id/close",params:"Body: { }",response:"{ referral }" }], fieldGroups: [] },
    ],
  },
  requirements: {
    mp: [
      { id:"FR-REG-001",name:"Patient Search",priority:"High",screen:"Patient Search" },{ id:"FR-REG-002",name:"Duplicate Detection",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-003",name:"View Potential Duplicates",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-004",name:"Create Patient Record",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-005",name:"MRN Generation",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-006",name:"Capture Demographics",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-007",name:"Name Translation",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-008",name:"Multiple Identifiers",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-009",name:"Configurable Mandatory Fields",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-010",name:"Validation Rules Config",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-011",name:"Capture Identification",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-012",name:"Temporary Registration",priority:"Low",screen:"Unknown Registration" },{ id:"FR-REG-013",name:"Convert Temporary",priority:"Medium",screen:"Unknown Registration" },{ id:"FR-REG-014",name:"Update Demographics",priority:"High",screen:"Change Patient Details" },{ id:"FR-REG-015",name:"Authorization Control",priority:"High",screen:"All (RBAC)" },{ id:"FR-REG-016",name:"Duplicate Resolution Approval",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-017",name:"Merge Patient Records",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-018",name:"Audit Trail",priority:"High",screen:"All Screens" },{ id:"FR-REG-019",name:"Data Validation",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-020",name:"Identify Duplicates for Merge",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-021",name:"Merge Request Review",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-022",name:"Approve or Reject Merge",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-023",name:"Execute Merge",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-024",name:"Preserve Historical Data",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-025",name:"Designate Master Record",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-026",name:"Merge Audit Logging",priority:"High",screen:"Merge Patients" },{ id:"FR-REG-027",name:"Post-Merge Notification",priority:"Medium",screen:"Merge Patients" },{ id:"FR-REG-028",name:"Activate/Deactivate MRN",priority:"High",screen:"Activate/Deactivate" },{ id:"FR-REG-029",name:"MRN Status Governance",priority:"High",screen:"Activate/Deactivate" },{ id:"FR-REG-030",name:"Document Scan & Upload",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-031",name:"Identifier Expiry Management",priority:"High",screen:"General" },{ id:"FR-REG-032",name:"Expired Identifier Control",priority:"High",screen:"General" },{ id:"FR-REG-033",name:"Identifier Expiry Alerts",priority:"Low",screen:"General" },{ id:"FR-REG-034",name:"Family Linking",priority:"Medium",screen:"Family Linking" },{ id:"FR-REG-035",name:"Head of Family Assignment",priority:"Medium",screen:"Family Linking" },{ id:"FR-REG-036",name:"Family Relationship Mgmt",priority:"Medium",screen:"Family Linking" },{ id:"FR-REG-037",name:"Patient Series Config",priority:"Medium",screen:"Admin Setup" },{ id:"FR-REG-038",name:"MRN Prefix Control",priority:"Medium",screen:"Admin Setup" },{ id:"FR-REG-039",name:"Series Access Control",priority:"Medium",screen:"Admin Setup" },{ id:"FR-REG-040",name:"Patient Label Printing",priority:"Medium",screen:"Patient Registration" },{ id:"FR-REG-041",name:"Patient Card Printing",priority:"Medium",screen:"Patient Registration" },{ id:"FR-REG-042",name:"Wristband Printing",priority:"Medium",screen:"Patient Registration" },{ id:"FR-REG-043",name:"Print Audit Logging",priority:"Medium",screen:"All Print Actions" },{ id:"FR-REG-044",name:"Newborn Registration",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-045",name:"Link Newborn to Mother",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-046",name:"Newborn Demographics",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-047",name:"Newborn Naming Convention",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-048",name:"Multiple Birth Handling",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-049",name:"Assign Newborn MRN",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-050",name:"Newborn ID Band",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-051",name:"Mother-Newborn Verification",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-052",name:"Update Newborn Legal Name",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-053",name:"Newborn Record Protection",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-054",name:"Newborn Audit Trail",priority:"Low",screen:"Newborn Registration" },{ id:"FR-REG-055",name:"Identity Review Queue",priority:"Low",screen:"General" },{ id:"FR-REG-056",name:"Patient Deceased Status",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-057",name:"Deceased Verification",priority:"Low",screen:"Patient Registration" },{ id:"FR-REG-058",name:"Patient Status History",priority:"Medium",screen:"General" },{ id:"FR-REG-059",name:"External ID Mapping",priority:"Medium",screen:"General" },{ id:"FR-REG-060",name:"Identifier Uniqueness",priority:"High",screen:"Patient Registration" },{ id:"FR-REG-061",name:"Preferred Contact Flag",priority:"Low",screen:"Patient Registration" },{ id:"FR-REG-062",name:"Emergency Contact",priority:"Medium",screen:"Patient Registration" },{ id:"FR-REG-063",name:"Privacy Restriction Flag",priority:"Medium",screen:"Patient Registration" },{ id:"FR-REG-064",name:"Confidentiality Indicator",priority:"Medium",screen:"All Screens" },{ id:"FR-REG-065",name:"Alias/Alternate Names",priority:"Low",screen:"Patient Registration" },{ id:"FR-REG-066",name:"VIP Designation",priority:"Medium",screen:"Patient Registration" },{ id:"FR-REG-067",name:"VIP Visibility Control",priority:"Medium",screen:"All Screens" },{ id:"FR-REG-068",name:"VIP Access Justification",priority:"Low",screen:"VIP Screens" },{ id:"FR-REG-069",name:"VIP Access Audit",priority:"Low",screen:"VIP Screens" },{ id:"FR-REG-070",name:"VIP Access Monitoring",priority:"Low",screen:"Reports" },{ id:"FR-REG-071",name:"VIP Status Review",priority:"Low",screen:"Reports" },{ id:"FR-REG-072",name:"Unmerge Patients",priority:"Low",screen:"Merge Patients" },{ id:"FR-REG-073",name:"Unknown Registration",priority:"Medium",screen:"Unknown Registration" },{ id:"FR-REG-074",name:"Mass Registration",priority:"Medium",screen:"Unknown Registration" },{ id:"FR-REG-075",name:"Unknown Patient Name",priority:"Low",screen:"Unknown Registration" },{ id:"FR-REG-076",name:"SMS/WhatsApp Notification",priority:"Low",screen:"Patient Registration" },{ id:"FR-REG-077",name:"Registration Charges",priority:"Low",screen:"Patient Registration" },
    ],
    op: [
      { id:"FR-OUT-001",name:"Search Patient",priority:"High",module:"Outpatient",description:"Search patients by MRN, ID, name",source:"" },{ id:"FR-OUT-002",name:"Book with Minimum Details",priority:"High",module:"Outpatient",description:"Book when MRN not available",source:"" },{ id:"FR-OUT-003",name:"Flag Pending Registration",priority:"High",module:"Outpatient",description:"Flag appointments without MRN",source:"" },{ id:"FR-OUT-004",name:"Capture Appointment Details",priority:"High",module:"Outpatient",description:"Capture clinic, service, date, time",source:"" },{ id:"FR-OUT-005",name:"Clinic-Based Scheduling",priority:"High",module:"Outpatient",description:"Schedule at clinic level",source:"" },{ id:"FR-OUT-006",name:"Doctor-Based Scheduling",priority:"High",module:"Outpatient",description:"Schedule by specific Physician",source:"" },{ id:"FR-OUT-007",name:"Room-Based Scheduling",priority:"High",module:"Outpatient",description:"Schedule by room availability",source:"" },{ id:"FR-OUT-008",name:"Series Visit Booking",priority:"High",module:"Outpatient",description:"Book recurring appointments",source:"" },{ id:"FR-OUT-009",name:"Appointment Confirmation",priority:"High",module:"Outpatient",description:"Generate confirmation notifications",source:"" },{ id:"FR-OUT-010",name:"Appointment Modification",priority:"High",module:"Outpatient",description:"Reschedule and cancel appointments",source:"" },{ id:"FR-OUT-011",name:"Check-In Patient",priority:"High",module:"Outpatient",description:"Register patient arrival at clinic",source:"" },{ id:"FR-OUT-012",name:"Complete Registration",priority:"High",module:"Outpatient",description:"Complete registration at check-in",source:"" },{ id:"FR-OUT-013",name:"Initiate Visit",priority:"High",module:"Outpatient",description:"Create visit linked to MRN",source:"" },{ id:"FR-OUT-014",name:"Add Services",priority:"High",module:"Outpatient",description:"Add clinic services to visit",source:"" },{ id:"FR-OUT-015",name:"Price Retrieval",priority:"High",module:"Outpatient",description:"Retrieve service pricing",source:"" },{ id:"FR-OUT-016",name:"Charge Services",priority:"High",module:"Outpatient",description:"Auto-generate charges for services",source:"" },{ id:"FR-OUT-017",name:"Billing Validation",priority:"High",module:"Outpatient",description:"Validate patient billing status",source:"" },{ id:"FR-OUT-018",name:"Generate Billing",priority:"High",module:"Outpatient",description:"Generate billing transactions",source:"" },{ id:"FR-OUT-019",name:"VIP Flagging",priority:"High",module:"Outpatient",description:"Flag VIP patients",source:"" },{ id:"FR-OUT-020",name:"VIP Access Restrict",priority:"High",module:"Outpatient",description:"Restrict VIP record access",source:"" },{ id:"FR-OUT-021",name:"VIP Confidentiality",priority:"High",module:"Outpatient",description:"Mask VIP appointment visibility",source:"" },{ id:"FR-OUT-022",name:"Audit Appointments",priority:"High",module:"Outpatient",description:"Log all appointment activities",source:"" },{ id:"FR-OUT-023",name:"Audit Billing",priority:"High",module:"Outpatient",description:"Log all billing actions",source:"" },{ id:"FR-OUT-024",name:"Prevent Without MRN",priority:"High",module:"Outpatient",description:"Block visit without valid MRN",source:"" },{ id:"FR-OUT-025",name:"Handle Walk-Ins",priority:"High",module:"Outpatient",description:"Support walk-in visit per clinic config",source:"" },{ id:"FR-OUT-026",name:"No-Show Tracking",priority:"High",module:"Outpatient",description:"Track and flag no-show appointments",source:"" },{ id:"FR-OUT-027",name:"Clinic Configuration",priority:"High",module:"Outpatient",description:"Configure clinics, services, schedules",source:"" },{ id:"FR-OUT-028",name:"Clinic Master",priority:"High",module:"Outpatient",description:"Configure outpatient clinics",source:"" },{ id:"FR-OUT-029",name:"Operational Timing",priority:"High",module:"Outpatient",description:"Define clinic operating days and hours",source:"" },{ id:"FR-OUT-030",name:"Specialty Assignment",priority:"High",module:"Outpatient",description:"Assign specialties to a clinic",source:"" },{ id:"FR-OUT-031",name:"Service Catalog",priority:"High",module:"Outpatient",description:"Configure services offered per clinic",source:"" },{ id:"FR-OUT-032",name:"Slot Duration",priority:"High",module:"Outpatient",description:"Define slot durations per clinic",source:"" },{ id:"FR-OUT-033",name:"Capacity Config",priority:"High",module:"Outpatient",description:"Define max appointments per session",source:"" },{ id:"FR-OUT-034",name:"Schedule Creation",priority:"High",module:"Outpatient",description:"Create clinic schedules from timing",source:"" },{ id:"FR-OUT-035",name:"Overbooking Config",priority:"High",module:"Outpatient",description:"Configure overbooking limits per clinic",source:"" },{ id:"FR-OUT-036",name:"Overbooking Flagging",priority:"High",module:"Outpatient",description:"Flag overbooked appointments",source:"" },{ id:"FR-OUT-037",name:"Bulk Rescheduling",priority:"High",module:"Outpatient",description:"Bulk reschedule appointments",source:"" },{ id:"FR-OUT-038",name:"Bulk Cancellation",priority:"High",module:"Outpatient",description:"Cancel multiple appointments at once",source:"" },{ id:"FR-OUT-039",name:"Bulk Notification",priority:"High",module:"Outpatient",description:"Notify patients of appointment changes",source:"" },{ id:"FR-OUT-040",name:"Receipt Template",priority:"High",module:"Outpatient",description:"Configure receipt templates",source:"" },{ id:"FR-OUT-041",name:"Print Receipt",priority:"High",module:"Outpatient",description:"Print or generate payment receipt",source:"" },{ id:"FR-OUT-042",name:"Output Formats",priority:"High",module:"Outpatient",description:"Print, PDF, or electronic receipts",source:"" },{ id:"FR-OUT-043",name:"Language Preference",priority:"High",module:"Outpatient",description:"Receipts in preferred language",source:"" },{ id:"FR-OUT-044",name:"Visit Type Selection",priority:"High",module:"Outpatient",description:"Select visit type when booking",source:"" },{ id:"FR-OUT-045",name:"Visit Type Config",priority:"High",module:"Outpatient",description:"Configure visit types and rules",source:"" },{ id:"FR-OUT-046",name:"Drag-Drop Reschedule",priority:"High",module:"Outpatient",description:"Drag-and-drop rescheduling",source:"" },{ id:"FR-OUT-047",name:"Quick Action Menu",priority:"High",module:"Outpatient",description:"Context menu on appointment slot",source:"" },{ id:"FR-OUT-048",name:"Smart Suggestions",priority:"High",module:"Outpatient",description:"Suggest best available slots",source:"" },{ id:"FR-OUT-049",name:"Waitlist",priority:"High",module:"Outpatient",description:"Waitlist when no slots available",source:"" },{ id:"FR-OUT-050",name:"Kiosk Integration",priority:"High",module:"Outpatient",description:"Integrate with kiosk system",source:"" },{ id:"FR-OUT-051",name:"Built-in Kiosk",priority:"High",module:"Outpatient",description:"Touch screen kiosk solution",source:"" },{ id:"FR-OUT-052",name:"Queue Visibility",priority:"High",module:"Outpatient",description:"Display estimated waiting time",source:"" },{ id:"FR-OUT-053",name:"Load Balancing",priority:"High",module:"Outpatient",description:"Suggest alternative clinics",source:"" },{ id:"FR-OUT-054",name:"No-Show Scoring",priority:"High",module:"Outpatient",description:"Predict no-show risk from history",source:"" },{ id:"FR-OUT-055",name:"Auto-Close Visits",priority:"High",module:"Outpatient",description:"Automatically close visits after period",source:"" },{ id:"FR-OUT-056",name:"Advance Payment",priority:"High",module:"Outpatient",description:"Capture advance payments",source:"" },{ id:"FR-OUT-057",name:"Refund Mgmt",priority:"High",module:"Outpatient",description:"Process refunds for cancelled visits",source:"" },{ id:"FR-OUT-058",name:"Visit Cancel",priority:"High",module:"Outpatient",description:"Cancel services or visits if not performed",source:"" },{ id:"FR-OUT-059",name:"View Referrals",priority:"High",module:"Outpatient",description:"Display unbooked referrals",source:"" },{ id:"FR-OUT-060",name:"Filter Referrals",priority:"High",module:"Outpatient",description:"Filter by specialty, priority, date",source:"" },{ id:"FR-OUT-061",name:"Referral Details",priority:"High",module:"Outpatient",description:"View referral order",source:"" },{ id:"FR-OUT-062",name:"Book Referral",priority:"High",module:"Outpatient",description:"Schedule referral appointment",source:"" },{ id:"FR-OUT-063",name:"Assign Practitioner",priority:"High",module:"Outpatient",description:"Assign practitioner if not predefined",source:"" },{ id:"FR-OUT-064",name:"Assign Clinic",priority:"High",module:"Outpatient",description:"Select clinic and location",source:"" },{ id:"FR-OUT-065",name:"Select Date-Time",priority:"High",module:"Outpatient",description:"Schedule visit date and time",source:"" },{ id:"FR-OUT-066",name:"Notify Patient",priority:"High",module:"Outpatient",description:"Send appointment confirmation",source:"" },{ id:"FR-OUT-067",name:"Update Referral Status",priority:"High",module:"Outpatient",description:"Update status to Booked",source:"" },{ id:"FR-OUT-068",name:"Reschedule Referral",priority:"High",module:"Outpatient",description:"Modify booked referral",source:"" },{ id:"FR-OUT-069",name:"Close Referral",priority:"High",module:"Outpatient",description:"Mark referral as completed",source:"" },
    ],
  },
  dbCollections: {
    mp: [
      { id: "c1", name: "MP_patients", description: "Core patient master record", indices: ["mrn (unique)","{ firstName, familyName, dob }","status","isVip"], fields: [
        { field: "_id", type: "ObjectId", desc: "Auto" },{ field: "mrn", type: "String", desc: "Unique, auto-generated" },{ field: "status", type: "String", desc: "Enum: active, inactive, deceased, temporary" },{ field: "name.firstName.en", type: "String", desc: "Required" },{ field: "name.familyName.en", type: "String", desc: "Required" },{ field: "name.firstName.ar", type: "String", desc: "" },{ field: "demographics.dob", type: "Date", desc: "Required" },{ field: "demographics.gender", type: "String", desc: "Enum: male, female" },{ field: "demographics.nationality", type: "String", desc: "ISO code" },{ field: "identifiers[].type", type: "String", desc: "national_id, passport, etc." },{ field: "identifiers[].number", type: "String", desc: "Unique within type" },{ field: "identifiers[].expiryDate", type: "Date", desc: "FR-REG-031" },{ field: "contact.mobile", type: "String", desc: "Required" },{ field: "financial.policyGroup", type: "String", desc: "Required" },{ field: "isVip", type: "Boolean", desc: "FR-REG-066" },{ field: "isDeceased", type: "Boolean", desc: "FR-REG-056" },{ field: "privacyFlag", type: "Boolean", desc: "FR-REG-063" },{ field: "registeredBy", type: "String", desc: "userId" },{ field: "createdAt", type: "Date", desc: "Mongoose timestamp" },
      ]},
      { id: "c2", name: "MP_auditTrail", description: "Immutable registration action log", indices: ["patientMrn","userId","timestamp"], fields: [
        { field: "_id", type: "ObjectId", desc: "Auto" },{ field: "patientMrn", type: "String", desc: "Indexed" },{ field: "userId", type: "String", desc: "" },{ field: "action", type: "String", desc: "Enum: create, update, merge, etc." },{ field: "changes", type: "Object", desc: "{ field: { old, new } }" },{ field: "reason", type: "String", desc: "Required for some actions" },{ field: "timestamp", type: "Date", desc: "Immutable, server-set" },{ field: "workstation", type: "String", desc: "Machine/IP" },
      ]},
      { id: "c3", name: "MP_mergeRequests", description: "Merge workflow records", indices: ["status","masterMrn"], fields: [
        { field: "_id", type: "ObjectId", desc: "" },{ field: "masterMrn", type: "String", desc: "Designated master" },{ field: "duplicateMrns", type: "String[]", desc: "MRNs to merge" },{ field: "justification", type: "String", desc: "Required" },{ field: "status", type: "String", desc: "pending|approved|rejected|executed" },{ field: "initiatedBy", type: "String", desc: "" },{ field: "reviewedBy", type: "String", desc: "Must differ from initiator" },{ field: "preservedData", type: "Object", desc: "Snapshot of merged records" },
      ]},
      { id: "c4", name: "MP_familyGroups", description: "Family/household linking", indices: ["headOfFamilyMrn"], fields: [
        { field: "headOfFamilyMrn", type: "String", desc: "Must be active" },{ field: "members[].mrn", type: "String", desc: "" },{ field: "members[].relationship", type: "String", desc: "Configurable" },
      ]},
      { id: "c5", name: "MP_patientDocuments", description: "Scanned ID documents", indices: ["patientMrn"], fields: [
        { field: "patientMrn", type: "String", desc: "" },{ field: "type", type: "String", desc: "national_id, passport, etc." },{ field: "filePath", type: "String", desc: "S3 key" },{ field: "uploadedBy", type: "String", desc: "" },
      ]},
      { id: "c6", name: "MP_lookupTables", description: "Configurable dropdown values", indices: ["category"], fields: [
        { field: "category", type: "String", desc: "nationality, religion, etc." },{ field: "code", type: "String", desc: "" },{ field: "label.en", type: "String", desc: "" },{ field: "label.ar", type: "String", desc: "" },{ field: "parentCode", type: "String", desc: "For cascading lookups" },
      ]},
      { id: "c7", name: "MP_patientSeries", description: "MRN series configuration (FR-REG-037\u2013039)", indices: ["prefix (unique)"], fields: [
        { field: "_id", type: "ObjectId", desc: "Auto" },{ field: "prefix", type: "String", desc: "e.g., PAT, NB, TMP" },{ field: "description", type: "String", desc: "" },{ field: "currentSequence", type: "Number", desc: "Auto-incrementing" },{ field: "format", type: "String", desc: "e.g., {prefix}{seq:6}" },{ field: "allowedRoles", type: "String[]", desc: "Role-based access" },{ field: "allowedFacilities", type: "String[]", desc: "Location-based" },{ field: "isActive", type: "Boolean", desc: "" },
      ]},
      { id: "c8", name: "MP_registrationCharges", description: "Charges for new MRN registration (FR-REG-077)", indices: ["patientMrn","chargedAt"], fields: [
        { field: "_id", type: "ObjectId", desc: "Auto" },{ field: "patientMrn", type: "String", desc: "" },{ field: "chargeType", type: "String", desc: "'new_mrn_registration'" },{ field: "amount", type: "Number", desc: "" },{ field: "currency", type: "String", desc: "" },{ field: "policyGroup", type: "String", desc: "" },{ field: "billingStatus", type: "String", desc: "Enum: pending, charged, waived" },{ field: "chargedBy", type: "String", desc: "userId" },{ field: "chargedAt", type: "Date", desc: "" },
      ]},
      { id: "c9", name: "MP_notifications", description: "SMS/WhatsApp notifications to patients (FR-REG-076)", indices: ["patientMrn","status","sentAt"], fields: [
        { field: "_id", type: "ObjectId", desc: "Auto" },{ field: "patientMrn", type: "String", desc: "" },{ field: "channel", type: "String", desc: "Enum: sms, whatsapp" },{ field: "templateId", type: "String", desc: "" },{ field: "content", type: "String", desc: "Rendered message" },{ field: "recipientPhone", type: "String", desc: "" },{ field: "status", type: "String", desc: "Enum: queued, sent, delivered, failed" },{ field: "sentAt", type: "Date | null", desc: "" },{ field: "metadata", type: "Object", desc: "Delivery provider response" },
      ]},
    ],
    co: [
      { id: "c1", name: "CO_Core_List", description: "Central list management table for all configurable lookup lists", indices: ["List_ID (unique)", "Item_ID"], fields: [
        { field: "List_ID", type: "VARCHAR", desc: "Unique identifier for each list", constraints: "PRIMARY KEY" },
        { field: "List_Long_Desc", type: "VARCHAR", desc: "List Long description", constraints: "NOT NULL" },
        { field: "List_Short_Desc", type: "VARCHAR", desc: "List Short description", constraints: "NOT NULL" },
        { field: "Item_ID", type: "VARCHAR", desc: "Unique identifier for each item inside the list", constraints: "NOT NULL" },
        { field: "Item_DDF_Meaning", type: "VARCHAR", desc: "Dichir Define Field. This to guarantee the behavior of this item base on condition already added to the system", constraints: "NULL" },
        { field: "Item_Long_Desc", type: "VARCHAR", desc: "Item Long description", constraints: "NOT NULL" },
        { field: "Item_Short_Desc", type: "VARCHAR", desc: "Item Short description", constraints: "NOT NULL" },
        { field: "Parent_Item_ID", type: "VARCHAR", desc: "This will handle the relation of items (parent & Child)", constraints: "NULL" },
        { field: "List_Active_Ind", type: "CHAR(1)", desc: "Y if this list active and can be accessible from application screens and N if not", constraints: "DEFAULT Y" },
        { field: "Item_Active_Ind", type: "CHAR(1)", desc: "Y if this item active and can be accessible from application screens and N if not", constraints: "DEFAULT Y" },
      ]},
      { id: "c2", name: "CO_Alias_Type", description: "Alias type definitions for alternative naming and coding across the system", indices: ["Alias_Type_ID (unique)"], fields: [
        { field: "Alias_Type_ID", type: "VARCHAR", desc: "Unique identifier for each Alias", constraints: "PRIMARY KEY" },
        { field: "Alias_Long_Desc", type: "VARCHAR", desc: "Alias long description", constraints: "NOT NULL" },
        { field: "Alias_Short_Desc", type: "VARCHAR", desc: "Alias short description", constraints: "" },
        { field: "Active_Ind", type: "CHAR(1)", desc: "Y if this active and can be accessible from application screens and N if not", constraints: "DEFAULT Y" },
      ]},
      { id: "c3", name: "CO_Alias_Formats", description: "Alias format configuration for auto-generation rules and patterns", indices: ["Alias_Dtl_ID (unique)", "Alias_Type_ID"], fields: [
        { field: "Alias_Dtl_ID", type: "VARCHAR", desc: "Unique identifier for each Alias", constraints: "PRIMARY KEY" },
        { field: "Alias_Type_ID", type: "VARCHAR", desc: "", constraints: "FK" },
        { field: "Alias_Format_Desc", type: "VARCHAR", desc: "", constraints: "" },
        { field: "Start_Value", type: "VARCHAR", desc: "Start value of the alias", constraints: "NOT NULL" },
        { field: "Max_Value", type: "VARCHAR", desc: "Max value for the alias", constraints: "NOT NULL" },
        { field: "Auto_Increment", type: "CHAR(1)", desc: "Y if this alias will increase automatically by fixed value and N if not", constraints: "NOT NULL" },
        { field: "Increment_By", type: "NUMBER", desc: "The number that the alias will automatically increment with", constraints: "" },
        { field: "Alias_Regex_Patt", type: "VARCHAR", desc: "Use specific pattern for alias", constraints: "" },
        { field: "Active_Ind", type: "CHAR(1)", desc: "Y if this active and can be accessible from application screens and N if not", constraints: "DEFAULT Y" },
      ]},
      { id: "c4", name: "CO_Facility_Alias", description: "Links alias formats to specific facilities for location-based numbering", indices: ["Facility_Alias_Dtl (unique)", "Alias_Dtl_ID", "Facility_ID"], fields: [
        { field: "Facility_Alias_Dtl", type: "VARCHAR", desc: "Unique identifier for each Alias", constraints: "PRIMARY KEY" },
        { field: "Alias_Dtl_ID", type: "VARCHAR", desc: "", constraints: "FK" },
        { field: "Facility_ID", type: "VARCHAR", desc: "", constraints: "" },
        { field: "Active_Ind", type: "CHAR(1)", desc: "Y if this active and can be accessible from application screens and N if not", constraints: "DEFAULT Y" },
      ]},
    ],
    op: [
      { id: "c1", name: "OP_Appointments", description: "Core appointment records", indices: ["Appointment_ID (unique)","Patient_MRN","Clinic_ID","Appointment_Date"], fields: [
        { field: "Appointment_ID", type: "VARCHAR", desc: "Unique appointment identifier", constraints: "PRIMARY KEY" },{ field: "Patient_MRN", type: "VARCHAR", desc: "Patient medical record number", constraints: "FK NOT NULL" },{ field: "Clinic_ID", type: "VARCHAR", desc: "Target clinic", constraints: "FK NOT NULL" },{ field: "Physician_ID", type: "VARCHAR", desc: "Assigned physician (nullable for clinic-based)", constraints: "FK" },{ field: "Appointment_Date", type: "DATE", desc: "Scheduled date", constraints: "NOT NULL" },{ field: "Appointment_Time", type: "TIME", desc: "Scheduled time slot", constraints: "NOT NULL" },{ field: "Visit_Type_ID", type: "VARCHAR", desc: "New, Follow-Up, Consultation, Procedure, Tele-Visit", constraints: "FK NOT NULL" },{ field: "Status", type: "VARCHAR", desc: "Scheduled, Checked-In, Completed, Cancelled, No-Show", constraints: "NOT NULL DEFAULT Scheduled" },{ field: "Is_Walk_In", type: "CHAR(1)", desc: "Y if walk-in, N if scheduled", constraints: "DEFAULT N" },{ field: "Is_Overbooked", type: "CHAR(1)", desc: "Y if overbooked slot", constraints: "DEFAULT N" },{ field: "Is_Pending_Reg", type: "CHAR(1)", desc: "Y if booked without MRN", constraints: "DEFAULT N" },{ field: "Series_ID", type: "VARCHAR", desc: "Link to recurring series if applicable", constraints: "" },{ field: "Referral_ID", type: "VARCHAR", desc: "Link to referral if booked from referral", constraints: "FK" },{ field: "Cancel_Reason", type: "VARCHAR", desc: "Reason for cancellation", constraints: "" },{ field: "Reschedule_Reason", type: "VARCHAR", desc: "Reason for rescheduling", constraints: "" },{ field: "No_Show_Score", type: "NUMBER", desc: "Predictive no-show risk score", constraints: "" },
      ]},
      { id: "c2", name: "OP_Visits", description: "Outpatient visit/encounter records", indices: ["Visit_ID (unique)","Patient_MRN","Appointment_ID"], fields: [
        { field: "Visit_ID", type: "VARCHAR", desc: "Unique visit identifier", constraints: "PRIMARY KEY" },{ field: "Appointment_ID", type: "VARCHAR", desc: "Linked appointment", constraints: "FK NOT NULL" },{ field: "Patient_MRN", type: "VARCHAR", desc: "Patient MRN (required)", constraints: "FK NOT NULL" },{ field: "Clinic_ID", type: "VARCHAR", desc: "Visit clinic", constraints: "FK NOT NULL" },{ field: "Check_In_Time", type: "TIMESTAMP", desc: "Patient arrival time", constraints: "" },{ field: "Visit_Start_Time", type: "TIMESTAMP", desc: "Encounter start", constraints: "" },{ field: "Visit_End_Time", type: "TIMESTAMP", desc: "Encounter end", constraints: "" },{ field: "Status", type: "VARCHAR", desc: "Checked-In, In-Progress, Completed, Auto-Closed", constraints: "NOT NULL" },{ field: "Auto_Close_Reason", type: "VARCHAR", desc: "If auto-closed", constraints: "" },{ field: "Is_VIP", type: "CHAR(1)", desc: "Inherited from patient record", constraints: "DEFAULT N" },
      ]},
      { id: "c3", name: "OP_Visit_Services", description: "Services added to outpatient visits", indices: ["Visit_Service_ID (unique)","Visit_ID","Service_ID"], fields: [
        { field: "Visit_Service_ID", type: "VARCHAR", desc: "Unique identifier", constraints: "PRIMARY KEY" },{ field: "Visit_ID", type: "VARCHAR", desc: "Parent visit", constraints: "FK NOT NULL" },{ field: "Service_ID", type: "VARCHAR", desc: "Service from catalog", constraints: "FK NOT NULL" },{ field: "Quantity", type: "NUMBER", desc: "Service quantity", constraints: "DEFAULT 1" },{ field: "Unit_Price", type: "NUMBER", desc: "Price at time of service", constraints: "NOT NULL" },{ field: "Total_Amount", type: "NUMBER", desc: "Quantity x Unit Price", constraints: "NOT NULL" },{ field: "Status", type: "VARCHAR", desc: "Pending, Charged, Cancelled", constraints: "NOT NULL DEFAULT Pending" },{ field: "Cancel_Reason", type: "VARCHAR", desc: "If cancelled", constraints: "" },
      ]},
      { id: "c4", name: "OP_Billing_Transactions", description: "Billing records linked to visits", indices: ["Transaction_ID (unique)","Visit_ID","Patient_MRN"], fields: [
        { field: "Transaction_ID", type: "VARCHAR", desc: "Unique billing transaction", constraints: "PRIMARY KEY" },{ field: "Visit_ID", type: "VARCHAR", desc: "Parent visit", constraints: "FK NOT NULL" },{ field: "Patient_MRN", type: "VARCHAR", desc: "Patient", constraints: "FK NOT NULL" },{ field: "Total_Amount", type: "NUMBER", desc: "Total billed amount", constraints: "NOT NULL" },{ field: "Patient_Share", type: "NUMBER", desc: "Patient co-pay amount", constraints: "" },{ field: "Insurance_Share", type: "NUMBER", desc: "Insurance portion", constraints: "" },{ field: "Payment_Status", type: "VARCHAR", desc: "Pending, Paid, Partial, Refunded", constraints: "NOT NULL" },{ field: "Advance_Amount", type: "NUMBER", desc: "Advance payment if any", constraints: "DEFAULT 0" },{ field: "Refund_Amount", type: "NUMBER", desc: "Refunded amount if any", constraints: "DEFAULT 0" },{ field: "Receipt_Number", type: "VARCHAR", desc: "Generated receipt number", constraints: "" },
      ]},
      { id: "c5", name: "OP_Clinics", description: "Clinic master configuration", indices: ["Clinic_ID (unique)","Clinic_Code (unique)"], fields: [
        { field: "Clinic_ID", type: "VARCHAR", desc: "Unique clinic identifier", constraints: "PRIMARY KEY" },{ field: "Clinic_Code", type: "VARCHAR", desc: "Unique clinic code", constraints: "UNIQUE NOT NULL" },{ field: "Clinic_Name", type: "VARCHAR", desc: "Clinic name", constraints: "NOT NULL" },{ field: "Facility_ID", type: "VARCHAR", desc: "Parent facility", constraints: "FK NOT NULL" },{ field: "Specialty_ID", type: "VARCHAR", desc: "Primary specialty", constraints: "FK" },{ field: "Operating_Days", type: "VARCHAR", desc: "e.g. Sun-Thu", constraints: "" },{ field: "Start_Time", type: "TIME", desc: "Opening time", constraints: "" },{ field: "End_Time", type: "TIME", desc: "Closing time", constraints: "" },{ field: "Allow_Walk_In", type: "CHAR(1)", desc: "Y/N", constraints: "DEFAULT N" },{ field: "Active_Ind", type: "CHAR(1)", desc: "Y/N", constraints: "DEFAULT Y" },
      ]},
      { id: "c6", name: "OP_Clinic_Schedules", description: "Clinic schedule and slot configuration", indices: ["Schedule_ID (unique)","Clinic_ID"], fields: [
        { field: "Schedule_ID", type: "VARCHAR", desc: "Unique schedule identifier", constraints: "PRIMARY KEY" },{ field: "Clinic_ID", type: "VARCHAR", desc: "Parent clinic", constraints: "FK NOT NULL" },{ field: "Physician_ID", type: "VARCHAR", desc: "Physician if doctor-based", constraints: "FK" },{ field: "Day_Of_Week", type: "VARCHAR", desc: "Sun, Mon, Tue, etc.", constraints: "NOT NULL" },{ field: "Slot_Duration_Min", type: "NUMBER", desc: "Minutes per slot", constraints: "NOT NULL" },{ field: "Max_Appointments", type: "NUMBER", desc: "Capacity per session", constraints: "NOT NULL" },{ field: "Overbooking_Limit", type: "NUMBER", desc: "Max overbooked slots", constraints: "DEFAULT 0" },{ field: "Effective_From", type: "DATE", desc: "Schedule start date", constraints: "NOT NULL" },{ field: "Effective_To", type: "DATE", desc: "Schedule end date", constraints: "" },{ field: "Active_Ind", type: "CHAR(1)", desc: "", constraints: "DEFAULT Y" },
      ]},
      { id: "c7", name: "OP_Clinic_Services", description: "Services offered per clinic", indices: ["Clinic_Service_ID (unique)","Clinic_ID","Service_ID"], fields: [
        { field: "Clinic_Service_ID", type: "VARCHAR", desc: "Unique identifier", constraints: "PRIMARY KEY" },{ field: "Clinic_ID", type: "VARCHAR", desc: "Parent clinic", constraints: "FK NOT NULL" },{ field: "Service_ID", type: "VARCHAR", desc: "Service from master catalog", constraints: "FK NOT NULL" },{ field: "Default_Price", type: "NUMBER", desc: "Default price for this service", constraints: "" },{ field: "Active_Ind", type: "CHAR(1)", desc: "", constraints: "DEFAULT Y" },
      ]},
      { id: "c8", name: "OP_Visit_Types", description: "Visit type configuration", indices: ["Visit_Type_ID (unique)"], fields: [
        { field: "Visit_Type_ID", type: "VARCHAR", desc: "Unique identifier", constraints: "PRIMARY KEY" },{ field: "Type_Name", type: "VARCHAR", desc: "New, Follow-Up, Consultation, Procedure, Tele-Visit", constraints: "NOT NULL" },{ field: "Default_Duration_Min", type: "NUMBER", desc: "Default slot duration", constraints: "" },{ field: "Billing_Impact", type: "VARCHAR", desc: "Billing rules for this type", constraints: "" },{ field: "Eligibility_Rules", type: "VARCHAR", desc: "Eligibility conditions", constraints: "" },{ field: "Active_Ind", type: "CHAR(1)", desc: "", constraints: "DEFAULT Y" },
      ]},
      { id: "c9", name: "OP_Waitlist", description: "Patient appointment waitlist", indices: ["Waitlist_ID (unique)","Patient_MRN","Clinic_ID"], fields: [
        { field: "Waitlist_ID", type: "VARCHAR", desc: "Unique identifier", constraints: "PRIMARY KEY" },{ field: "Patient_MRN", type: "VARCHAR", desc: "Patient", constraints: "FK NOT NULL" },{ field: "Clinic_ID", type: "VARCHAR", desc: "Requested clinic", constraints: "FK NOT NULL" },{ field: "Specialty_ID", type: "VARCHAR", desc: "Requested specialty", constraints: "FK" },{ field: "Priority", type: "VARCHAR", desc: "Normal, Urgent", constraints: "DEFAULT Normal" },{ field: "Requested_Date", type: "DATE", desc: "Preferred date", constraints: "" },{ field: "Status", type: "VARCHAR", desc: "Waiting, Booked, Expired", constraints: "NOT NULL DEFAULT Waiting" },
      ]},
      { id: "c10", name: "OP_Referrals", description: "Inbound referral tracking", indices: ["Referral_ID (unique)","Patient_MRN","Status"], fields: [
        { field: "Referral_ID", type: "VARCHAR", desc: "Unique referral identifier", constraints: "PRIMARY KEY" },{ field: "Patient_MRN", type: "VARCHAR", desc: "Patient", constraints: "FK NOT NULL" },{ field: "Referring_Physician_ID", type: "VARCHAR", desc: "Who referred", constraints: "FK" },{ field: "Target_Specialty_ID", type: "VARCHAR", desc: "Target specialty", constraints: "FK NOT NULL" },{ field: "Target_Clinic_ID", type: "VARCHAR", desc: "Target clinic if specified", constraints: "FK" },{ field: "Priority", type: "VARCHAR", desc: "Routine, Urgent", constraints: "DEFAULT Routine" },{ field: "Status", type: "VARCHAR", desc: "Pending, Booked, Completed, Cancelled", constraints: "NOT NULL DEFAULT Pending" },{ field: "Appointment_ID", type: "VARCHAR", desc: "Linked appointment once booked", constraints: "FK" },{ field: "Referral_Date", type: "DATE", desc: "Date referred", constraints: "NOT NULL" },{ field: "Notes", type: "VARCHAR", desc: "Clinical notes", constraints: "" },
      ]},
      { id: "c11", name: "OP_Audit_Trail", description: "Outpatient module audit log", indices: ["Audit_ID (unique)","Entity_Type","Entity_ID","Action_Date"], fields: [
        { field: "Audit_ID", type: "VARCHAR", desc: "Unique audit entry", constraints: "PRIMARY KEY" },{ field: "Entity_Type", type: "VARCHAR", desc: "Appointment, Visit, Billing, Referral", constraints: "NOT NULL" },{ field: "Entity_ID", type: "VARCHAR", desc: "ID of the entity", constraints: "NOT NULL" },{ field: "Action", type: "VARCHAR", desc: "Create, Update, Cancel, Check-In, Close", constraints: "NOT NULL" },{ field: "Old_Value", type: "VARCHAR", desc: "Previous value", constraints: "" },{ field: "New_Value", type: "VARCHAR", desc: "New value", constraints: "" },{ field: "Action_Date", type: "TIMESTAMP", desc: "When action occurred", constraints: "NOT NULL" },{ field: "Action_By_ID", type: "VARCHAR", desc: "User who performed action", constraints: "NOT NULL" },
      ]},
    ],
  },
  reports: {
    mp: [
      { id: "r1", name: "Registered Patients", description: "All patients excl. VIP", endpoint: "GET /api/v1/reports/registered-patients", filters: ["Date From/To","National ID","MRN Status","Gender","Nationality","Facility","Reg Type"], columns: ["MRN","DOB","Gender","Nationality","ID","Mobile","Status","Reg Date","Type","User","Facility"] },
      { id: "r2", name: "VIP Patients", description: "Restricted VIP list", endpoint: "GET /api/v1/reports/vip-patients", filters: ["Date","ID","Status","Gender","Nationality"], columns: ["MRN","DOB","Gender","Nationality","ID","Mobile","Status","Reg Date","Type","User","Facility"] },
      { id: "r3", name: "Family Links", description: "Family group structures", endpoint: "GET /api/v1/reports/family-links", filters: ["Head MRN","Facility","Date Linked"], columns: ["Head MRN","Head Name","Member MRN","Member Name","Relationship","Status","Date","Linked By"] },
      { id: "r4", name: "Registration Audit", description: "Activity audit trail", endpoint: "GET /api/v1/reports/registration-audit", filters: ["User","Action","Date","MRN"], columns: ["Date/Time","User","Action","MRN","Name","Field","Old","New","Workstation"] },
      { id: "r5", name: "Merge Activity", description: "Merge requests and outcomes", endpoint: "GET /api/v1/reports/merge-activity", filters: ["Date","Master MRN"], columns: ["Master MRN","Name","Merged MRN","Names","User","Date"] },
      { id: "r6", name: "Expired Identifiers", description: "Expired/expiring IDs", endpoint: "GET /api/v1/reports/expired-ids", filters: ["ID Type","Expiry Status","MRN"], columns: ["MRN","Name","Type","Number","Expiry"] },
      { id: "r7", name: "VIP Access Log", description: "VIP record access log", endpoint: "GET /api/v1/reports/vip-access", filters: ["Date","VIP MRN","User","Access Type"], columns: ["Date","VIP MRN","Name","Access Type","User","Workstation"] },
    ],
    op: [
      { id: "r1", name: "Outpatient Appointments", description: "All appointment activity", endpoint: "GET /api/v1/reports/outpatient-appointments", filters: ["Date","Clinic","Specialty","Visit type","Status","MRN"], columns: ["Appt ID","Date","Clinic","Specialty","Type","MRN","Patient","Status","Created by","Created date"] },
      { id: "r2", name: "Appointment Availability", description: "Slot availability", endpoint: "GET /api/v1/reports/appointment-availability", filters: ["Date","Speciality","Clinic"], columns: ["Clinic","Specialty","Total","Booked","Overbooked","First available"] },
      { id: "r3", name: "Check-In & Visit Completion", description: "Visit tracking", endpoint: "GET /api/v1/reports/check-in-visit", filters: ["Date","Clinic","Speciality","Status"], columns: ["MRN","Patient","Appt date","Arrival","Start","End","Status","Wait","Duration"] },
    ],
  },
  userGuides: {
    mp: [
      { id: "g1", title: "Registering a New Patient", role: "Registration Clerk", steps: ["Click 'Patient Search'","Search by Name, ID, MRN, or DOB","If found, click to view/edit","If not found, click 'Register New Patient'","Fill required fields: Name, DOB, Gender, Nationality, Mobile, Policy","Add identifier and scan document","Review duplicate warnings","Click 'Save & Generate MRN'","Print label/card/wristband","Patient receives SMS/WhatsApp"] },
      { id: "g2", title: "Unknown/Emergency Patients", role: "Registration Clerk", steps: ["Navigate to 'Unknown Registration'","Select Gender and Estimated Age","Billing defaults to Cash","Click 'Register Unknown'","For mass: enter count, click 'Mass Register'","When stabilized: search temp MRN, click 'Convert to Permanent'"] },
      { id: "g3", title: "Merging Duplicates", role: "Clerk then Supervisor", steps: ["Clerk: search suspect duplicates","Select 2+ records, click 'Initiate Merge'","Compare side-by-side, select Master","Enter justification, submit","Supervisor: open Pending Requests","Review and Approve/Reject","System executes, preserves all history"] },
      { id: "g4", title: "Registering a Newborn", role: "Clerk / Nurse", steps: ["Open 'Newborn Registration'","Enter Mother's MRN","Name auto-fills as 'Baby of [Mother]'","Enter DOB, Gender, Weight","Multiple birth: check box, select order","Save & Generate MRN","Print ID band (2 identifiers)","Later: Update Legal Name"] },
    ],
    op: [
      { id: "g1", title: "Booking an Appointment", role: "Call Center Agent / Front Desk", steps: ["Open Appointment Scheduling Screen","Search patient by MRN, National ID, or Name","If no MRN, book with minimum details (flagged as pending registration)","Select Clinic, Physician (optional), and Visit Type","Choose date and time from available slots","System checks capacity and overbooking limits","Confirm appointment - patient receives SMS/Email notification","For series visits: select recurring option and define schedule"] },
      { id: "g2", title: "Patient Check-In and Visit", role: "Front Desk", steps: ["Open Patient Check-In Screen","Search patient by MRN or appointment","If pending registration, complete registration and generate MRN","Click Check-In to register arrival","System initiates outpatient visit linked to MRN","Navigate to Visit Services & Billing Screen","Add clinic services to the visit","System retrieves pricing and generates charges","Validate billing (approvals, patient share)","Generate billing transaction"] },
      { id: "g3", title: "Rescheduling and Cancellation", role: "Call Center Agent / Front Desk", steps: ["Open Appointment Management Screen","Search appointment by patient or date","To reschedule: drag-and-drop on calendar or use Reschedule action","Select new date/time, system validates scheduling rules","To cancel: click Cancel, enter reason","Patient notified of changes via SMS/Email/WhatsApp","For bulk operations: open Bulk Operations Screen","Select multiple appointments, choose Reschedule or Cancel","Enter reason (mandatory for bulk reschedule)","Send bulk notifications"] },
      { id: "g4", title: "Clinic and Schedule Configuration", role: "HIS Administrator", steps: ["Open Clinic Configuration Screen","Add new clinic: enter code, name, facility, specialty","Set operating days and hours","Assign services from the service catalog","Open Scheduling Configuration Screen","Define slot durations per clinic or service","Set maximum appointments per session","Configure overbooking limits","Create clinic schedule from operational timing","Configure visit types with duration and billing rules"] },
      { id: "g5", title: "Managing Referrals", role: "Receptionist", steps: ["Open Referral Management Screen","View list of unbooked referrals","Filter by specialty, priority, or date","Click on referral to view order details","Click Book Appointment to schedule","Assign practitioner based on availability","Select clinic and location","Choose appointment date and time","System sends confirmation notification to patient","Referral status auto-updates to Booked","After encounter, referral marked as Completed"] },
    ],
  },
};

// Storage is now handled by Firebase (see firebase.js)

// ━━━ DICHIR LOGO ━━━
const DichirLogo = ({ h = 28, light = true }) => (
  <svg height={h} viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="4" width="32" height="32" rx="6" fill="#1B75BB" />
    <path d="M8 12h6c4.4 0 8 3.6 8 8s-3.6 8-8 8H8V12zm3.5 3v10h2.5c2.8 0 5-2.2 5-5s-2.2-5-5-5h-2.5z" fill="#FFF"/>
    <text x="38" y="27" fontFamily="'DM Sans',system-ui,sans-serif" fontSize="19" fontWeight="800" letterSpacing="1.5" fill={light?"#FFF":"#0B1B35"}>DICHIR</text>
  </svg>
);

// ━━━ PAGINATION ━━━
const PAGE_SIZE = 10;
const pgSlice = (arr, p) => (arr||[]).slice((p-1)*PAGE_SIZE, p*PAGE_SIZE);
const pgTotal = (arr) => Math.max(1, Math.ceil((arr||[]).length / PAGE_SIZE));
const Pager = ({ items, page, setPage }) => {
  const n = (items||[]).length, tp = pgTotal(items);
  if (n <= PAGE_SIZE) return null;
  const f = (page-1)*PAGE_SIZE+1, t = Math.min(page*PAGE_SIZE, n);
  const bs = (d) => ({ padding:"3px 8px", borderRadius:4, border:"1px solid "+P.border, background:d?"transparent":P.accentDim, color:d?P.textDim:P.accent, cursor:d?"default":"pointer", fontSize:11, fontWeight:600, opacity:d?0.4:1 });
  return (
    <div style={{ padding:"8px 12px", borderTop:"1px solid "+P.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:11, color:P.textDim }}>{f}–{t} of {n}</span>
      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
        <button onClick={()=>setPage(1)} disabled={page<=1} style={bs(page<=1)}>«</button>
        <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page<=1} style={bs(page<=1)}>‹</button>
        <span style={{ padding:"3px 8px", fontSize:11, fontWeight:600, color:P.accent }}>{page}/{tp}</span>
        <button onClick={()=>setPage(Math.min(tp,page+1))} disabled={page>=tp} style={bs(page>=tp)}>›</button>
        <button onClick={()=>setPage(tp)} disabled={page>=tp} style={bs(page>=tp)}>»</button>
      </div>
    </div>
  );
};

// ━━━ SMALL COMPONENTS ━━━
const Badge = ({ text, color = P.accent }) => <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: color + "18", color, letterSpacing: "0.5px", textTransform: "uppercase", border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>{text}</span>;
const PriorityBadge = ({ p: priority }) => { const c = { High: P.red, Medium: P.amber, Low: P.purple }; return <Badge text={priority} color={c[priority] || P.textDim} />; };
const MethodBadge = ({ m }) => { const c = { GET: P.green, POST: P.accent, PUT: P.amber, DELETE: P.red }; return <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800, background: (c[m]||P.accent)+"18", color: c[m]||P.accent, fontFamily: "monospace" }}>{m}</span>; };

const Btn = ({ children, onClick, color = P.accent, small, danger, ghost, style: sx = {} }) => (
  <button onClick={onClick} style={{ padding: small ? "4px 10px" : "7px 14px", borderRadius: 6, border: ghost ? `1px solid ${danger ? P.red : color}40` : "none", background: ghost ? "transparent" : danger ? P.redDim : color + "20", color: danger ? P.red : color, cursor: "pointer", fontSize: small ? 10.5 : 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.1s", ...sx }}>{children}</button>
);

const Input = ({ value, onChange, placeholder, style: sx = {}, area }) => {
  const shared = { padding: "8px 12px", borderRadius: 7, border: `1px solid ${P.border}`, background: "#F8FAFC", color: P.text, fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit", ...sx };
  return area ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...shared, resize: "vertical" }} /> : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={shared} />;
};

const Select = ({ value, onChange, options, style: sx = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "8px 12px", borderRadius: 7, border: `1px solid ${P.border}`, background: "#F8FAFC", color: P.text, fontSize: 13, outline: "none", ...sx }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ━━━ MODAL ━━━
const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(11,27,53,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", border: `1px solid ${P.border}`, borderRadius: 14, padding: 0, width: wide ? 700 : 520, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(11,27,53,0.15)" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: P.textDim, cursor: "pointer", fontSize: 18, padding: 4 }}>×</button>
      </div>
      <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>{children}</div>
    </div>
  </div>
);

const FormRow = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.textDim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
    {children}
  </div>
);

const ConfirmDelete = ({ what, onConfirm, onCancel }) => (
  <Modal title="Confirm Delete" onClose={onCancel}>
    <p style={{ color: P.textMuted, fontSize: 14, marginBottom: 20 }}>Are you sure you want to delete <b style={{ color: P.red }}>{what}</b>? This cannot be undone.</p>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Btn ghost onClick={onCancel}>Cancel</Btn>
      <Btn danger onClick={onConfirm}>Delete</Btn>
    </div>
  </Modal>
);

// ━━━ TABS ━━━
const TABS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "screens", label: "Screens", icon: "◻" },
  { id: "database", label: "Tables", icon: "⬡" },
  { id: "api", label: "API", icon: "⟡" },
  { id: "reports", label: "Reports", icon: "▤" },
  { id: "matrix", label: "Matrix", icon: "▦" },
  { id: "guides", label: "User Guide", icon: "◈" },
];

// ━━━ MAIN APP ━━━
export default function HISDocPortal() {
  const [data, setData] = useState(null);
  const [activeMod, setActiveMod] = useState("mp");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeIdx, setActiveIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [filterPri, setFilterPri] = useState("All");
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pgReqs, setPgReqs] = useState(1);
  const [pgFields, setPgFields] = useState(1);
  const [pgDbFields, setPgDbFields] = useState(1);
  const [pgBehavior, setPgBehavior] = useState(1);
  const [pgReps, setPgReps] = useState(1);
  const [pgApi, setPgApi] = useState(1);
  const [pgGuideSteps, setPgGuideSteps] = useState(1);
  const [dbEngine, setDbEngine] = useState("PostgreSQL");
  const fileRef = useRef(null);

  // ━━━ FIREBASE STORAGE (Real-time sync) ━━━
  const skipNextSync = useRef(false);
  useEffect(() => {
    // Load initial data
    (async () => {
      try {
        const stored = await loadData();
        if (stored) { setData(stored); }
        else { setData(DEFAULT_DATA); await saveData(DEFAULT_DATA); }
      } catch { setData(DEFAULT_DATA); }
    })();
    // Subscribe to real-time changes from other users
    const unsub = subscribeData((newData) => {
      if (skipNextSync.current) { skipNextSync.current = false; return; }
      setData(newData);
    });
    return () => unsub();
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    skipNextSync.current = true;
    try { await saveData(newData); } catch (e) { console.error("Save failed:", e); alert("⚠️ Save failed — changes not persisted.\n\n" + (e?.message || e)); }
  }, []);

  const resetAll = useCallback(async () => { await save(DEFAULT_DATA); setActiveMod("mp"); setActiveTab("overview"); }, [save]);

  if (!data) return <div style={{ background: P.bg, color: P.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading...</div>;

  const mod = data.modules.find(m => m.id === activeMod) || data.modules[0];
  const isPending = mod.status === "pending";
  const screens = data.screens[activeMod] || [];
  const reqs = data.requirements[activeMod] || [];
  const cols = data.dbCollections[activeMod] || [];
  const reps = data.reports[activeMod] || [];
  const guides = data.userGuides[activeMod] || [];
  const stats = { total: reqs.length, high: reqs.filter(r => r.priority === "High").length, med: reqs.filter(r => r.priority === "Medium").length, low: reqs.filter(r => r.priority === "Low").length };
  const filteredReqs = reqs.filter(r => { const ms = !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase()); const mp = filterPri === "All" || r.priority === filterPri; return ms && mp; });

  // ━━━ CRUD HELPERS ━━━
  const updateModule = (id, updates) => { const nd = { ...data, modules: data.modules.map(m => m.id === id ? { ...m, ...updates } : m) }; save(nd); };
  const addModule = (m) => { save({ ...data, modules: [...data.modules, m], screens: { ...data.screens, [m.id]: [] }, requirements: { ...data.requirements, [m.id]: [] }, dbCollections: { ...data.dbCollections, [m.id]: [] }, reports: { ...data.reports, [m.id]: [] }, userGuides: { ...data.userGuides, [m.id]: [] } }); };
  const deleteModule = (id) => { const nd = { ...data, modules: data.modules.filter(m => m.id !== id) }; ["screens","requirements","dbCollections","reports","userGuides"].forEach(k => { nd[k] = { ...data[k] }; delete nd[k][id]; }); save(nd); if (activeMod === id) setActiveMod(nd.modules[0]?.id || ""); };

  const addItem = (key, item) => save({ ...data, [key]: { ...data[key], [activeMod]: [...(data[key][activeMod] || []), item] } });
  const updateItem = (key, idx, updates) => { const arr = [...(data[key][activeMod] || [])]; arr[idx] = { ...arr[idx], ...updates }; save({ ...data, [key]: { ...data[key], [activeMod]: arr } }); };
  const deleteItem = (key, idx) => { const arr = [...(data[key][activeMod] || [])]; arr.splice(idx, 1); save({ ...data, [key]: { ...data[key], [activeMod]: arr } }); };

  // ━━━ EXCEL IMPORT (using npm xlsx package) ━━━
  const getXL = (cb) => {
    import("xlsx").then(mod => cb(mod)).catch(() => alert("Failed to load xlsx library."));
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (!file) return;
    getXL((XL) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
        const wb = XL.read(new Uint8Array(ev.target.result), { type: "array" });
        const reqWs = wb.Sheets["Requirements"];
        const reqRows = reqWs ? XL.utils.sheet_to_json(reqWs, { defval: "" }) : [];
        const newReqs = reqRows.filter(r => r["Req ID"]).map(r => ({
          id: String(r["Req ID"]).trim(), name: String(r["Function Name"]||"").trim(),
          priority: String(r["Priority"]||"Medium").trim(), module: mod.name,
          description: String(r["Description"]||"").trim(), source: String(r["Business Rules / Notes"]||"").trim(),
          actors: [], screen: "",
        }));
        const scrWs = wb.Sheets["Screens to function"] || wb.Sheets["Screens to Function"];
        const scrRows = scrWs ? XL.utils.sheet_to_json(scrWs, { defval: "" }) : [];
        const sMap = {}; const sOrder = [];
        let curScreen = ""; // forward-fill for merged "Screen" cells
        scrRows.forEach(r => {
          const cell = String(r["Screen"]||"").trim();
          if (cell) curScreen = cell;
          const sn = curScreen;
          // Skip rows with no screen context AND no function content
          const fname = String(r["Function Name"]||"").trim();
          const fdesc = String(r["Description"]||"").trim();
          const fbr = String(r["Business Rules / Notes"]||"").trim();
          if (!sn) return;
          if (!fname && !fdesc && !fbr && !String(r["Req ID"]||"").trim()) return;
          if (!sMap[sn]) { sMap[sn] = { name: sn, rids: [], acts: [], fns: [] }; sOrder.push(sn); }
          const rid = String(r["Req ID"]||"").trim();
          if (rid && sMap[sn].rids.indexOf(rid)<0) sMap[sn].rids.push(rid);
          const act = String(r["Actor"]||"").trim();
          if (act && sMap[sn].acts.indexOf(act)<0) sMap[sn].acts.push(act);
          sMap[sn].fns.push({ n: fname, d: fdesc, b: fbr });
        });
        // ─── Backfill requirement actors / screen from Screens-to-function sheet ───
        const reqActors = {}; const reqScreen = {};
        sOrder.forEach(sn => {
          const s = sMap[sn];
          s.rids.forEach(rid => {
            if (!reqActors[rid]) reqActors[rid] = [];
            s.acts.forEach(a => { if (reqActors[rid].indexOf(a) < 0) reqActors[rid].push(a); });
            if (!reqScreen[rid]) reqScreen[rid] = sn;
          });
        });
        newReqs.forEach(r => {
          if (reqActors[r.id]) r.actors = reqActors[r.id];
          if (reqScreen[r.id]) r.screen = reqScreen[r.id];
        });

        // ─── Auto-derive fields & tables from Requirements + Screens to function ───
        const slug = (str) => String(str||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"") || "field";
        const inferUiType = (txt) => {
          const t = String(txt||"").toLowerCase();
          if (/\b(date|dob|expiry|expir|birth)\b/.test(t)) return "date";
          if (/\btime\b/.test(t)) return "time";
          if (/\bemail\b/.test(t)) return "email";
          if (/\b(phone|mobile|tel)\b/.test(t)) return "tel";
          if (/\b(upload|scan|attach|document|file|photo|image)\b/.test(t)) return "file";
          if (/\b(amount|price|fee|cost|weight|qty|quantity|count|score|number|age|total)\b/.test(t)) return "number";
          if (/\b(select|choose|dropdown|type|status|category|gender|nationality|specialty|clinic|priority)\b/.test(t)) return "dropdown";
          if (/\b(flag|active|enable|disable|allow|is_)\b/.test(t)) return "boolean";
          if (/\b(notes?|description|reason|justification|comment|remarks?)\b/.test(t)) return "textarea";
          return "text";
        };
        const inferSqlType = (uiType) => {
          if (uiType === "number") return "NUMBER";
          if (uiType === "date") return "DATE";
          if (uiType === "time") return "TIME";
          if (uiType === "boolean") return "CHAR(1)";
          if (uiType === "textarea") return "VARCHAR(2000)";
          return "VARCHAR(255)";
        };
        // Map Req ID -> requirement (from Requirements sheet) for richer context
        const reqById = {};
        newReqs.forEach(r => { reqById[r.id] = r; });

        const ic = ["\uD83D\uDCCB","\uD83D\uDD0D","\u2699\uFE0F","\uD83D\uDCCA","\u26A1","\uD83D\uDC65","\uD83D\uDC76","\u2753","\uD83D\uDCDD","\uD83D\uDCC5"];
        const newScr = sOrder.map(n => sMap[n]).map((s,i) => {
          // Generate one field per function listed for this screen.
          const seen = {};
          const fields = [];
          s.fns.forEach(f => {
            const label = f.n || (f.d ? f.d.split(".")[0] : "Field");
            let name = slug(label);
            if (seen[name]) { let k=2; while (seen[name+"_"+k]) k++; name = name+"_"+k; }
            seen[name] = true;
            const blob = (f.n||"")+" "+(f.d||"")+" "+(f.b||"");
            fields.push({
              name,
              label,
              type: inferUiType(blob),
              required: false,
              note: [f.d, f.b].filter(Boolean).join(" \u2014 "),
              group: "General",
            });
          });
          const fieldGroups = fields.length
            ? [{ section: "General", fieldNames: fields.map(f => f.name) }]
            : [];
          return {
            id:"s"+(i+1), name:s.name, icon:ic[i%ic.length], description:s.fns[0]?s.fns[0].d:"",
            reqIds:s.rids, actors:s.acts, actions:[], fields,
            behavior:s.fns.map(f=>(f.n?f.n+": ":"")+f.b).filter(Boolean), apiEndpoints:[], fieldGroups,
          };
        });

        // Generate one DB table per screen using its derived fields.
        const modPrefix = String(activeMod||"MOD").toUpperCase();
        const newTbls = newScr.map((s,i) => {
          const tblBase = s.name.replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"") || ("Screen"+(i+1));
          const tblName = modPrefix + "_" + tblBase;
          const tblFields = [
            { field: "id", type: "VARCHAR(36)", desc: "Primary key (UUID)", constraints: "PRIMARY KEY" },
          ];
          s.fields.forEach(f => {
            tblFields.push({
              field: f.name,
              type: inferSqlType(f.type),
              desc: f.note || f.label,
              constraints: f.required ? "NOT NULL" : "",
            });
          });
          tblFields.push({ field: "created_at", type: "TIMESTAMP", desc: "Record creation timestamp", constraints: "NOT NULL" });
          tblFields.push({ field: "created_by", type: "VARCHAR(64)", desc: "Created by user", constraints: "" });
          tblFields.push({ field: "updated_at", type: "TIMESTAMP", desc: "Last update timestamp", constraints: "" });
          tblFields.push({ field: "updated_by", type: "VARCHAR(64)", desc: "Last updated by user", constraints: "" });
          return {
            id: "c"+(i+1),
            name: tblName,
            description: s.description || (s.name + " data"),
            indices: ["id (unique)"],
            fields: tblFields,
          };
        });
        const repWs = wb.Sheets["Reports"]; const newReps = [];
        if (repWs) {
          const rng = XL.utils.decode_range(repWs["!ref"]||"A1");
          for (let ci=rng.s.c;ci<=rng.e.c;ci+=2){
            const nc=repWs[XL.utils.encode_cell({r:0,c:ci})]; const rn=nc?String(nc.v||"").trim():""; if(!rn)continue;
            const fl=[],co=[];
            for(let ri=2;ri<=rng.e.r;ri++){const fc=repWs[XL.utils.encode_cell({r:ri,c:ci})];const cc=repWs[XL.utils.encode_cell({r:ri,c:ci+1})];if(fc&&fc.v)fl.push(String(fc.v).trim());if(cc&&cc.v)co.push(String(cc.v).trim());}
            newReps.push({id:"r"+(newReps.length+1),name:rn,description:rn,endpoint:"GET /api/v1/reports/"+rn.toLowerCase().split(" ").join("-"),filters:fl,columns:co});
          }
        }
        save({...data,
          screens:{...data.screens,[activeMod]:newScr.length?newScr:data.screens[activeMod]||[]},
          requirements:{...data.requirements,[activeMod]:newReqs.length?newReqs:data.requirements[activeMod]||[]},
          reports:{...data.reports,[activeMod]:newReps.length?newReps:data.reports[activeMod]||[]},
          dbCollections:{...data.dbCollections,[activeMod]:newTbls.length?newTbls:data.dbCollections[activeMod]||[]},
          modules:data.modules.map(m=>m.id===activeMod?{...m,status:"documented",version:m.version==="\u2014"?"1.0":m.version}:m),
        });
        setActiveTab("screens");
        const totalFields = newScr.reduce((n,s)=>n+(s.fields?s.fields.length:0),0);
        alert("Imported "+mod.name+":\n"+newScr.length+" screens, "+totalFields+" fields, "+newReqs.length+" requirements, "+newTbls.length+" tables, "+newReps.length+" reports");
        } catch(err) { alert("Import error: " + err.message); }
      };
      reader.readAsArrayBuffer(file);
    });
  };
  const downloadTemplate = () => { getXL((XL) => {
    const wb=XL.utils.book_new();
    const w1=XL.utils.aoa_to_sheet([["Req ID","Function Name","Description","Actor","Priority","Business Rules / Notes"],["FR-XXX-001","Sample","System shall...","Clerk","High","Details"]]);
    w1["!cols"]=[{wch:14},{wch:24},{wch:50},{wch:20},{wch:10},{wch:50}];XL.utils.book_append_sheet(wb,w1,"Requirements");
    const w2=XL.utils.aoa_to_sheet([["Screen","Req ID","Function Name","Description","Actor","Priority","Business Rules / Notes"],["Screen","FR-XXX-001","Sample","System shall...","Clerk","High","Details"]]);
    w2["!cols"]=[{wch:22},{wch:14},{wch:24},{wch:50},{wch:20},{wch:10},{wch:50}];XL.utils.book_append_sheet(wb,w2,"Screens to function");
    const w3=XL.utils.aoa_to_sheet([["Report 1",null,"Report 2",null],["Filters","Columns","Filters","Columns"],["Date","Col1","Date","Col1"]]);
    w3["!cols"]=[{wch:30},{wch:24},{wch:30},{wch:24}];XL.utils.book_append_sheet(wb,w3,"Reports");
    const out=XL.write(wb,{bookType:"xlsx",type:"array"});
    const b=new Blob([out],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="HIS_Module_Template.xlsx";
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);
  }); };

  // ━━━ SQL GENERATOR ━━━
  const DB_ENGINES = ["PostgreSQL","MySQL","Oracle","SQL Server","SQLite","MariaDB"];
  const sqlTypeMap = {
    PostgreSQL: {String:"VARCHAR(255)",Number:"NUMERIC",Date:"TIMESTAMP",Boolean:"BOOLEAN",ObjectId:"UUID",Object:"JSONB"},
    MySQL: {String:"VARCHAR(255)",Number:"DECIMAL(18,2)",Date:"DATETIME",Boolean:"TINYINT(1)",ObjectId:"CHAR(36)",Object:"JSON"},
    Oracle: {String:"VARCHAR2(255)",Number:"NUMBER(18,2)",Date:"TIMESTAMP",Boolean:"NUMBER(1)",ObjectId:"RAW(16)",Object:"CLOB"},
    "SQL Server": {String:"NVARCHAR(255)",Number:"DECIMAL(18,2)",Date:"DATETIME2",Boolean:"BIT",ObjectId:"UNIQUEIDENTIFIER",Object:"NVARCHAR(MAX)"},
    SQLite: {String:"TEXT",Number:"REAL",Date:"TEXT",Boolean:"INTEGER",ObjectId:"TEXT",Object:"TEXT"},
    MariaDB: {String:"VARCHAR(255)",Number:"DECIMAL(18,2)",Date:"DATETIME",Boolean:"TINYINT(1)",ObjectId:"CHAR(36)",Object:"JSON"},
  };
  const qI = (e, n) => {
    const s = n.split("[").join("_").split("]").join("_").split(".").join("_").split(" ").join("_");
    if (e === "SQL Server") return "[" + s + "]";
    if (e === "Oracle") return '"' + s.toUpperCase() + '"';
    if (e === "MySQL" || e === "MariaDB") { const bt = String.fromCharCode(96); return bt + s + bt; }
    return '"' + s + '"';
  };
  const mT = (e, t) => ((sqlTypeMap[e] || sqlTypeMap.PostgreSQL)[t]) || (sqlTypeMap[e] || sqlTypeMap.PostgreSQL).String || "TEXT";
  const genSQL = (tbl, eng) => {
    const tn = qI(eng, tbl.name);
    const flds = (tbl.fields || []).filter(f => f.field && f.field !== "_id");
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const br = "-- " + "=".repeat(60);
    const L = [br, "-- Table: " + tbl.name, "-- Desc: " + (tbl.description || ""), "-- Engine: " + eng, "-- Generated: " + now, br, ""];
    if (eng === "Oracle") { L.push("BEGIN EXECUTE IMMEDIATE 'DROP TABLE " + tn + " CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;"); L.push("/"); }
    else if (eng === "SQL Server") { L.push("IF OBJECT_ID('" + tbl.name + "','U') IS NOT NULL DROP TABLE " + tn + ";"); L.push("GO"); }
    else { L.push("DROP TABLE IF EXISTS " + tn + (eng === "MySQL" || eng === "MariaDB" ? "" : " CASCADE") + ";"); }
    L.push(""); L.push("CREATE TABLE " + tn + " (");
    const cd = [];
    const pk = qI(eng, "id");
    if (eng === "Oracle") cd.push("  " + pk + " RAW(16) DEFAULT SYS_GUID() PRIMARY KEY");
    else if (eng === "SQL Server") cd.push("  " + pk + " UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY");
    else if (eng === "PostgreSQL") cd.push("  " + pk + " UUID DEFAULT gen_random_uuid() PRIMARY KEY");
    else if (eng === "SQLite") cd.push("  " + pk + " TEXT PRIMARY KEY");
    else cd.push("  " + pk + " CHAR(36) NOT NULL PRIMARY KEY");
    flds.forEach(f => {
      const nn = (f.desc && f.desc.toLowerCase().indexOf("required") >= 0) ? " NOT NULL" : "";
      const ct = f.constraints ? " " + f.constraints : "";
      cd.push("  " + qI(eng, f.field) + " " + mT(eng, f.type) + nn + ct + (f.desc ? " -- " + f.desc : ""));
    });
    // Audit columns
    const aD = qI(eng, "Added_Date"); const aB = qI(eng, "Added_By_ID"); const mD = qI(eng, "Modified_Date"); const mB = qI(eng, "Modified_By_ID");
    if (eng === "Oracle") {
      cd.push("  " + aD + " TIMESTAMP DEFAULT SYSTIMESTAMP"); cd.push("  " + aB + " VARCHAR2(100)");
      cd.push("  " + mD + " TIMESTAMP DEFAULT SYSTIMESTAMP"); cd.push("  " + mB + " VARCHAR2(100)");
    } else if (eng === "SQL Server") {
      cd.push("  " + aD + " DATETIME2 DEFAULT GETUTCDATE()"); cd.push("  " + aB + " NVARCHAR(100)");
      cd.push("  " + mD + " DATETIME2 DEFAULT GETUTCDATE()"); cd.push("  " + mB + " NVARCHAR(100)");
    } else if (eng === "SQLite") {
      cd.push("  " + aD + " TEXT DEFAULT CURRENT_TIMESTAMP"); cd.push("  " + aB + " TEXT");
      cd.push("  " + mD + " TEXT DEFAULT CURRENT_TIMESTAMP"); cd.push("  " + mB + " TEXT");
    } else {
      cd.push("  " + aD + " TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); cd.push("  " + aB + " VARCHAR(100)");
      cd.push("  " + mD + " TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); cd.push("  " + mB + " VARCHAR(100)");
    }
    L.push(cd.join(",\n")); L.push(");");
    if (eng === "SQL Server") L.push("GO");
    L.push("");
    (tbl.indices || []).forEach((ix, ii) => {
      const cl = ix.toLowerCase().split("(unique)").join("").split("{").join("").split("}").join("").trim();
      const un = ix.toLowerCase().indexOf("unique") >= 0;
      const ic = cl.split(",").map(x => qI(eng, x.trim())).join(", ");
      L.push("CREATE " + (un ? "UNIQUE " : "") + "INDEX " + qI(eng, "idx_" + tbl.name + "_" + (ii + 1)) + " ON " + tn + " (" + ic + ");");
    });
    if (eng === "Oracle" || eng === "PostgreSQL") {
      if (tbl.description) L.push("COMMENT ON TABLE " + tn + " IS '" + tbl.description.split("'").join("''") + "';");
    }
    return L.join("\n");
  };
  const genAllSQL = (eng) => {
    const br = "-- " + "=".repeat(60);
    const h = [br, "-- Module: " + mod.name, "-- Engine: " + eng, "-- Tables: " + cols.length, "-- Generated: " + new Date().toISOString().slice(0, 19).replace("T", " "), br, ""].join("\n");
    return h + cols.map(t => genSQL(t, eng)).join("\n\n");
  };
  const dlSQL = (sql, fn) => {
    const b = new Blob([sql], { type: "text/sql" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = u; a.download = fn;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
  };

  // ━━━ EDIT MODALS ━━━
  const ModuleModal = ({ initial, onSave, onClose }) => {
    const [f, setF] = useState(initial || { id: "", name: "", shortName: "", icon: "📦", color: "#3B82F6", status: "pending", version: "—", description: "", compliance: [] });
    const [compText, setCompText] = useState((initial?.compliance || []).join(", "));
    return (
      <Modal title={initial ? "Edit Module" : "Add Module"} onClose={onClose}>
        <FormRow label="ID (unique, no spaces)"><Input value={f.id} onChange={v => setF({ ...f, id: v.replace(/\s/g,"_").toLowerCase() })} placeholder="e.g. scheduling" /></FormRow>
        <FormRow label="Name"><Input value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="Full module name" /></FormRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <FormRow label="Short Name"><Input value={f.shortName} onChange={v => setF({ ...f, shortName: v })} /></FormRow>
          <FormRow label="Icon (emoji)"><Input value={f.icon} onChange={v => setF({ ...f, icon: v })} /></FormRow>
          <FormRow label="Color"><input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} style={{ width: "100%", height: 36, border: "none", cursor: "pointer" }} /></FormRow>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormRow label="Status"><Select value={f.status} onChange={v => setF({ ...f, status: v })} options={["documented","pending"]} /></FormRow>
          <FormRow label="Version"><Input value={f.version} onChange={v => setF({ ...f, version: v })} /></FormRow>
        </div>
        <FormRow label="Description"><Input area value={f.description} onChange={v => setF({ ...f, description: v })} /></FormRow>
        <FormRow label="Compliance (comma-separated)"><Input value={compText} onChange={setCompText} placeholder="JCI IPSG, CBAHI IM" /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { onSave({ ...f, compliance: compText.split(",").map(s => s.trim()).filter(Boolean) }); onClose(); }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const ReqModal = ({ initial, idx, onClose }) => {
    const [f, setF] = useState(initial || { id: "", name: "", priority: "High", screen: "", description: "", source: "", actors: [] });
    const [actorText, setActorText] = useState(Array.isArray(initial?.actors) ? initial.actors.join(", ") : (initial?.actors || ""));
    return (
      <Modal title={initial ? "Edit Requirement" : "Add Requirement"} onClose={onClose}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormRow label="Req ID"><Input value={f.id} onChange={v => setF({ ...f, id: v })} placeholder="FR-XXX-000" /></FormRow>
          <FormRow label="Priority"><Select value={f.priority} onChange={v => setF({ ...f, priority: v })} options={["High","Medium","Low"]} /></FormRow>
        </div>
        <FormRow label="Function Name"><Input value={f.name} onChange={v => setF({ ...f, name: v })} /></FormRow>
        <FormRow label="Description"><Input area value={f.description || ""} onChange={v => setF({ ...f, description: v })} /></FormRow>
        <FormRow label="Actors (comma-sep)"><Input value={actorText} onChange={setActorText} placeholder="Clerk, Nurse, Physician" /></FormRow>
        <FormRow label="Business Rule"><Input area value={f.source || ""} onChange={v => setF({ ...f, source: v })} /></FormRow>
        <FormRow label="Screen"><Input value={f.screen} onChange={v => setF({ ...f, screen: v })} /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { const payload = { ...f, actors: actorText.split(",").map(s => s.trim()).filter(Boolean) }; idx != null ? updateItem("requirements", idx, payload) : addItem("requirements", payload); onClose(); }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const ScreenModal = ({ initial, idx, onClose }) => {
    const [f, setF] = useState(initial || { id: "s" + Date.now(), name: "", icon: "📄", description: "", reqIds: [], actors: [], actions: [], fields: [], behavior: [], apiEndpoints: [], status: "active" });
    const [reqText, setReqText] = useState((initial?.reqIds || []).join(", "));
    const [actorText, setActorText] = useState((initial?.actors || []).join(", "));
    const [actionText, setActionText] = useState((initial?.actions || []).join(", "));
    const [behaviorText, setBehaviorText] = useState((initial?.behavior || []).join(""));
    const [groupText, setGroupText] = useState((initial?.fieldGroups || []).map(g => `${g.section}: ${g.fieldNames.join(", ")}`).join(""));
    return (
      <Modal title={initial ? "Edit Screen" : "Add Screen"} onClose={onClose} wide>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px", gap: 10 }}>
          <FormRow label="Icon"><Input value={f.icon} onChange={v => setF({ ...f, icon: v })} /></FormRow>
          <FormRow label="Screen Name"><Input value={f.name} onChange={v => setF({ ...f, name: v })} /></FormRow>
          <FormRow label="Status"><Select value={f.status || "active"} onChange={v => setF({ ...f, status: v })} options={["active", "disabled"]} /></FormRow>
        </div>
        <FormRow label="Description"><Input area value={f.description} onChange={v => setF({ ...f, description: v })} /></FormRow>
        <FormRow label="Requirement IDs (comma-sep)"><Input value={reqText} onChange={setReqText} placeholder="FR-REG-001, FR-REG-002" /></FormRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormRow label="Actors (comma-sep)"><Input value={actorText} onChange={setActorText} /></FormRow>
          <FormRow label="Actions (comma-sep)"><Input value={actionText} onChange={setActionText} /></FormRow>
        </div>
        <FormRow label="Field Groups (one per line: Section Name: field1, field2)"><Input area value={groupText} onChange={setGroupText} style={{ minHeight: 60, fontFamily: "monospace", fontSize: 12 }} /></FormRow>
        <FormRow label="Business Rules (one per line)"><Input area value={behaviorText} onChange={setBehaviorText} style={{ minHeight: 100 }} /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => {
            const fieldGroups = groupText.split("\n").filter(Boolean).map(line => { const [sec, ...rest] = line.split(":"); return { section: sec.trim(), fieldNames: rest.join(":").split(",").map(s=>s.trim()).filter(Boolean) }; }).filter(g => g.section && g.fieldNames.length);
            const obj = { ...f, fieldGroups, reqIds: reqText.split(",").map(s=>s.trim()).filter(Boolean), actors: actorText.split(",").map(s=>s.trim()).filter(Boolean), actions: actionText.split(",").map(s=>s.trim()).filter(Boolean), behavior: behaviorText.split("\n").filter(Boolean) };
            idx != null ? updateItem("screens", idx, obj) : addItem("screens", obj); onClose();
          }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const FieldModal = ({ screenIdx, fieldIdx, initial, defaultGroup, onClose }) => {
    const tableNames = cols.map(c => c.name);
    const defaultTable = tableNames[0] || "MP_patients";
    const [f, setF] = useState(initial || { name: "", label: "", type: "text", required: false, note: "", targetTable: defaultTable, group: defaultGroup || "" });
    const existingGroups = [...new Set((screens[screenIdx]?.fields || []).map(fld => fld.group).filter(Boolean))];
    return (
      <Modal title={initial ? "Edit Field" : "Add Field"} onClose={onClose}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormRow label="Field Name"><Input value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="field_name" /></FormRow>
          <FormRow label="Label"><Input value={f.label} onChange={v => setF({ ...f, label: v })} /></FormRow>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <FormRow label="Type"><Select value={f.type} onChange={v => setF({ ...f, type: v })} options={["text","dropdown","date","datetime","number","tel","email","file","textarea","checkbox"]} /></FormRow>
          <FormRow label="Required"><Select value={f.required ? "Yes" : "No"} onChange={v => setF({ ...f, required: v === "Yes" })} options={["Yes","No"]} /></FormRow>
          <FormRow label="Target Table"><Select value={f.targetTable || defaultTable} onChange={v => setF({ ...f, targetTable: v })} options={tableNames.length ? tableNames : [defaultTable]} /></FormRow>
        </div>
        <FormRow label="Group">
          <div>
            <Input value={f.group || ""} onChange={v => setF({ ...f, group: v })} placeholder="Type a new group or pick one below…" />
            {existingGroups.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>
                {existingGroups.map(g => (
                  <button key={g} type="button" onClick={() => setF({ ...f, group: g })} style={{ padding: "3px 11px", borderRadius: 10, fontSize: 11, fontWeight: 600, border: `1px solid ${f.group === g ? P.purple : P.border}`, background: f.group === g ? P.purpleDim : "transparent", color: f.group === g ? P.purple : P.textMuted, cursor: "pointer" }}>{g}</button>
                ))}
              </div>
            )}
          </div>
        </FormRow>
        <FormRow label="Validation / Notes"><Input area value={f.note} onChange={v => setF({ ...f, note: v })} /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => {
            const fieldData = { ...f, targetTable: f.targetTable || defaultTable };
            const tm = { text:"String", dropdown:"String", date:"Date", datetime:"Date", number:"Number", tel:"String", email:"String", file:"ObjectId", textarea:"String", checkbox:"Boolean" };
            const sc = [...screens]; const s = { ...sc[screenIdx] }; const flds = [...(s.fields || [])];
            const oldField = fieldIdx != null ? flds[fieldIdx] : null;
            if (fieldIdx != null) flds[fieldIdx] = fieldData; else flds.push(fieldData);
            s.fields = flds; sc[screenIdx] = s;
            // Sync field to target DB table
            const dbArr = [...cols];
            const tblIdx = dbArr.findIndex(t => t.name === fieldData.targetTable);
            if (tblIdx >= 0) {
              const tbl = { ...dbArr[tblIdx], fields: [...(dbArr[tblIdx].fields || [])] };
              // Remove old entry if editing and table changed
              if (oldField) {
                const oldTblIdx = dbArr.findIndex(t => t.name === (oldField.targetTable || defaultTable));
                if (oldTblIdx >= 0 && oldTblIdx !== tblIdx) {
                  const oldTbl = { ...dbArr[oldTblIdx], fields: [...(dbArr[oldTblIdx].fields || [])] };
                  oldTbl.fields = oldTbl.fields.filter(df => !(df.screen === s.name && df.field === oldField.name));
                  dbArr[oldTblIdx] = oldTbl;
                }
                // Remove old entry from same table
                tbl.fields = tbl.fields.filter(df => !(df.screen === s.name && df.field === (oldField.name)));
              }
              // Remove existing entry with same screen+field name
              tbl.fields = tbl.fields.filter(df => !(df.screen === s.name && df.field === fieldData.name));
              tbl.fields.push({ field: fieldData.name, type: tm[fieldData.type] || "String", desc: fieldData.note || fieldData.label, screen: s.name });
              dbArr[tblIdx] = tbl;
            }
            save({ ...data, screens: { ...data.screens, [activeMod]: sc }, dbCollections: { ...data.dbCollections, [activeMod]: dbArr } }); onClose();
          }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const EndpointModal = ({ screenIdx, epIdx, initial, onClose }) => {
    const [f, setF] = useState(initial || { method: "GET", path: "", params: "", response: "" });
    return (
      <Modal title={initial ? "Edit Endpoint" : "Add Endpoint"} onClose={onClose}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
          <FormRow label="Method"><Select value={f.method} onChange={v => setF({ ...f, method: v })} options={["GET","POST","PUT","DELETE","PATCH"]} /></FormRow>
          <FormRow label="Path"><Input value={f.path} onChange={v => setF({ ...f, path: v })} placeholder="/api/v1/..." /></FormRow>
        </div>
        <FormRow label="Parameters"><Input value={f.params} onChange={v => setF({ ...f, params: v })} /></FormRow>
        <FormRow label="Response"><Input value={f.response} onChange={v => setF({ ...f, response: v })} /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => {
            const sc = [...screens]; const s = { ...sc[screenIdx] }; const eps = [...(s.apiEndpoints || [])];
            if (epIdx != null) eps[epIdx] = f; else eps.push(f);
            s.apiEndpoints = eps; sc[screenIdx] = s;
            save({ ...data, screens: { ...data.screens, [activeMod]: sc } }); onClose();
          }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const CollectionModal = ({ initial, idx, onClose }) => {
    const [f, setF] = useState(initial || { id: "c"+Date.now(), name: "", description: "", indices: [], fields: [] });
    const [idxText, setIdxText] = useState((initial?.indices||[]).join(", "));
    return (
      <Modal title={initial ? "Edit Table" : "Add Table"} onClose={onClose}>
        <FormRow label="Table Name"><Input value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="collectionName" /></FormRow>
        <FormRow label="Description"><Input area value={f.description} onChange={v => setF({ ...f, description: v })} /></FormRow>
        <FormRow label="Indices (comma-sep)"><Input value={idxText} onChange={setIdxText} placeholder='mrn (unique), status' /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { const obj = { ...f, indices: idxText.split(",").map(s=>s.trim()).filter(Boolean) }; idx != null ? updateItem("dbCollections", idx, obj) : addItem("dbCollections", obj); onClose(); }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const DbFieldModal = ({ colIdx, fieldIdx, initial, onClose }) => {
    const [f, setF] = useState(initial || { field: "", type: "", desc: "", constraints: "" });
    return (
      <Modal title={initial ? "Edit Field" : "Add Field"} onClose={onClose}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormRow label="Column Name"><Input value={f.field} onChange={v => setF({ ...f, field: v })} placeholder="column_name" /></FormRow>
          <FormRow label="Data Type"><Input value={f.type} onChange={v => setF({ ...f, type: v })} placeholder="VARCHAR, TIMESTAMP, NUMBER, etc." /></FormRow>
        </div>
        <FormRow label="Description"><Input value={f.desc} onChange={v => setF({ ...f, desc: v })} /></FormRow>
        <FormRow label="Constraints"><Input value={f.constraints || ""} onChange={v => setF({ ...f, constraints: v })} placeholder="e.g. NOT NULL, DEFAULT CURRENT_TIMESTAMP, UNIQUE" /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => {
            const arr = [...cols]; const c = { ...arr[colIdx] }; const flds = [...(c.fields||[])];
            if (fieldIdx != null) flds[fieldIdx] = f; else flds.push(f);
            c.fields = flds; arr[colIdx] = c;
            save({ ...data, dbCollections: { ...data.dbCollections, [activeMod]: arr } }); onClose();
          }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const ReportModal = ({ initial, idx, onClose }) => {
    const [f, setF] = useState(initial || { id: "r"+Date.now(), name: "", description: "", endpoint: "", filters: [], columns: [] });
    const [filText, setFilText] = useState((initial?.filters||[]).join(", "));
    const [colText, setColText] = useState((initial?.columns||[]).join(", "));
    return (
      <Modal title={initial ? "Edit Report" : "Add Report"} onClose={onClose}>
        <FormRow label="Report Name"><Input value={f.name} onChange={v => setF({ ...f, name: v })} /></FormRow>
        <FormRow label="Description"><Input area value={f.description} onChange={v => setF({ ...f, description: v })} /></FormRow>
        <FormRow label="API Endpoint"><Input value={f.endpoint} onChange={v => setF({ ...f, endpoint: v })} placeholder="GET /api/v1/reports/..." /></FormRow>
        <FormRow label="Filters (comma-sep)"><Input area value={filText} onChange={setFilText} /></FormRow>
        <FormRow label="Columns (comma-sep)"><Input area value={colText} onChange={setColText} /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { const obj = { ...f, filters: filText.split(",").map(s=>s.trim()).filter(Boolean), columns: colText.split(",").map(s=>s.trim()).filter(Boolean) }; idx != null ? updateItem("reports", idx, obj) : addItem("reports", obj); onClose(); }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  const GuideModal = ({ initial, idx, onClose }) => {
    const [f, setF] = useState(initial || { id: "g"+Date.now(), title: "", role: "", steps: [] });
    const [stepText, setStepText] = useState((initial?.steps||[]).join(""));
    return (
      <Modal title={initial ? "Edit Guide" : "Add Guide"} onClose={onClose}>
        <FormRow label="Title"><Input value={f.title} onChange={v => setF({ ...f, title: v })} /></FormRow>
        <FormRow label="Role"><Input value={f.role} onChange={v => setF({ ...f, role: v })} placeholder="Registration Clerk" /></FormRow>
        <FormRow label="Steps (one per line)"><Input area value={stepText} onChange={setStepText} style={{ minHeight: 160 }} /></FormRow>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { const obj = { ...f, steps: stepText.split("\n").filter(Boolean) }; idx != null ? updateItem("userGuides", idx, obj) : addItem("userGuides", obj); onClose(); }}>Save</Btn>
        </div>
      </Modal>
    );
  };

  // ━━━ TABLE HELPER ━━━
  const TH = ({ children }) => <th style={{ textAlign: "left", padding: "8px 10px", color: P.textDim, fontWeight: 700, fontSize: 10, textTransform: "uppercase", borderBottom: `2px solid ${P.border}`, background: "#F8FAFC" }}>{children}</th>;
  const TD = ({ children, mono, bold, color: c, style: sx }) => <td style={{ padding: "7px 10px", fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit", fontSize: mono ? 11.5 : 12.5, fontWeight: bold ? 700 : 400, color: c || P.text, ...sx }}>{children}</td>;

  const deleteFieldFromScreen = (sIdx, fIdx) => { const sc = [...screens]; const s = { ...sc[sIdx] }; const flds = [...(s.fields||[])]; flds.splice(fIdx, 1); s.fields = flds; sc[sIdx] = s; save({ ...data, screens: { ...data.screens, [activeMod]: sc } }); };
  const deleteEpFromScreen = (sIdx, eIdx) => { const sc = [...screens]; const s = { ...sc[sIdx] }; const eps = [...(s.apiEndpoints||[])]; eps.splice(eIdx, 1); s.apiEndpoints = eps; sc[sIdx] = s; save({ ...data, screens: { ...data.screens, [activeMod]: sc } }); };
  const deleteDbField = (cIdx, fIdx) => { const arr = [...cols]; const c = { ...arr[cIdx] }; const flds = [...(c.fields||[])]; flds.splice(fIdx, 1); c.fields = flds; arr[cIdx] = c; save({ ...data, dbCollections: { ...data.dbCollections, [activeMod]: arr } }); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* ━━━ SIDEBAR ━━━ */}
      <aside style={{ width: collapsed ? 54 : 220, minWidth: collapsed ? 54 : 220, background: P.navy, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", transition: "all 0.2s", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: collapsed ? "12px 6px" : "16px 14px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {!collapsed && <div><DichirLogo h={22} light /><div style={{ fontSize: 9, fontWeight: 700, color: "#5BA7E6", marginTop: 2 }}>HIS Docs CMS</div></div>}{collapsed && <DichirLogo h={18} light />}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", color: P.textDim, cursor: "pointer", fontSize: 14 }}>{collapsed ? "\u25b8" : "\u25c2"}</button>
        </div>
        <div style={{ padding: "8px 6px", flex: 1 }}>
          {!collapsed && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", marginBottom: 6 }}><span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "#5BA7E6", textTransform: "uppercase" }}>Modules</span><Btn small onClick={() => setModal({ type: "addModule" })} color={P.green}>+ Add</Btn></div>}
          {data.modules.map(m => (
            <button key={m.id} onClick={() => { setActiveMod(m.id); setActiveTab(m.status==="pending"?"overview":"overview"); setActiveIdx(0); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed?0:8, padding: collapsed?"8px 0":"7px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: activeMod===m.id?700:500, background: activeMod===m.id?"#1B75BB25":"transparent", color: activeMod===m.id?"#FFFFFF":"#8896AB", transition: "all 0.15s", marginBottom: 1, textAlign: "left", justifyContent: collapsed?"center":"flex-start" }}>
              <span style={{ fontSize: collapsed?16:14 }}>{m.icon}</span>
              {!collapsed && <><span style={{ flex: 1 }}>{m.shortName}</span><span style={{ width: 6, height: 6, borderRadius: "50%", background: m.status==="documented"?P.green:P.textDim, flexShrink: 0 }} /></>}
            </button>
          ))}
        </div>
        {!collapsed && <div style={{ padding: "10px 14px", borderTop: "1px solid #1B3A5C", fontSize: 10, color: "#5BA7E6" }}><Btn small danger ghost onClick={resetAll} style={{ width: "100%", justifyContent: "center" }}>Reset to Default</Btn><div style={{ fontSize: 9, color: "#5BA7E6", marginTop: 6 }}>© 2026 DICHIR</div></div>}
      </aside>

      {/* ━━━ MAIN ━━━ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Tab Bar */}
        <header style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.border}`, padding: "0 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 10, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16, borderRight: `1px solid ${P.border}`, height: 44 }}>
            <span style={{ fontSize: 18 }}>{mod.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{mod.name}</span>
            {mod.status==="documented" && <Badge text={`v${mod.version}`} color={P.green} />}
            {isPending && <Badge text="Pending" color={P.textDim} />}
            <Btn small ghost onClick={() => setModal({ type: "editModule", module: mod })} style={{ padding: "3px 8px" }}>✎</Btn>
            {data.modules.length > 1 && <Btn small danger ghost onClick={() => setConfirmDel({ what: mod.name, onConfirm: () => { deleteModule(mod.id); setConfirmDel(null); } })} style={{ padding: "3px 8px" }}>×</Btn>}
          </div>
          <div style={{ display: "flex", height: 44 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setActiveIdx(0); setPgReqs(1); setPgFields(1); setPgDbFields(1); setPgBehavior(1); setPgReps(1); setPgApi(1); setPgGuideSteps(1); }} style={{ padding: "0 14px", border: "none", borderBottom: activeTab===t.id?`2px solid ${mod.color}`:"2px solid transparent", background: "none", color: activeTab===t.id?P.text:P.textDim, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 10, opacity: 0.6 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "24px 32px", overflowY: "auto", maxWidth: 1080 }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div><h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>{mod.name}</h1><p style={{ color: P.textMuted, fontSize: 13, margin: 0 }}>{mod.description}</p></div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn onClick={downloadTemplate} color={P.accent} small>Download Template</Btn>
                  <Btn onClick={() => fileRef.current && fileRef.current.click()} color={P.green} small>Import Excel</Btn>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: "none" }} />
                </div>
              </div>
              {isPending && <div style={{ textAlign: "center", padding: "40px", background: P.surface, border: "2px dashed "+P.border, borderRadius: 14, margin: "20px 0" }}><div style={{ fontSize: 40, marginBottom: 12 }}>{mod.icon}</div><h3 style={{ color: P.text, fontWeight: 700, margin: "0 0 8px" }}>No documentation yet</h3><p style={{ color: P.textMuted, fontSize: 13, maxWidth: 420, margin: "0 auto 16px" }}>Upload an Excel file (3 sheets: Requirements, Screens to function, Reports) to populate this module.</p><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><Btn onClick={downloadTemplate} color={P.accent}>Download Template</Btn><Btn onClick={() => fileRef.current && fileRef.current.click()} color={P.green}>Upload Excel</Btn></div></div>}
              {!isPending && <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                  {[{ l:"Requirements",v:stats.total,c:mod.color },{ l:"High",v:stats.high,c:P.red },{ l:"Medium",v:stats.med,c:P.amber },{ l:"Low",v:stats.low,c:P.purple }].map((s,i) => (
                    <div key={i} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: 10, color: P.textDim, fontWeight: 700, textTransform: "uppercase" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {screens.map((s,i) => { const isDisabled = (s.status || "active") === "disabled"; return <div key={i} onClick={() => { setActiveTab("screens"); setActiveIdx(i); }} style={{ background: isDisabled ? P.redDim : P.surface, border: `1px solid ${isDisabled ? P.red+"55" : P.border}`, borderRadius: 10, padding: "14px 18px", cursor: "pointer", opacity: isDisabled ? 0.75 : 1 }}><div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 16 }}>{s.icon}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</span><span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 8, background: isDisabled ? P.red+"22" : P.greenDim, color: isDisabled ? P.red : P.green, textTransform: "uppercase" }}>{isDisabled ? "Disabled" : "Active"}</span></div><div style={{ fontSize: 11.5, color: P.textDim }}>{s.description}</div></div>; })}
                </div>
                {mod.compliance?.length > 0 && <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>{mod.compliance.map((s,i) => <Badge key={i} text={s} color={P.green} />)}</div>}
              </>}
            </div>
          )}

          {/* SCREENS */}
          {activeTab === "screens" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Screens</h1>
                <Btn onClick={() => setModal({ type: "addScreen" })} color={P.green}>+ Add Screen</Btn>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {screens.map((s,i) => {
                  const isDisabled = (s.status || "active") === "disabled";
                  return <button key={i} onClick={() => { setActiveIdx(i); setPgFields(1); setPgBehavior(1); }} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${activeIdx===i?mod.color:isDisabled?P.red+"66":P.border}`, background: activeIdx===i?mod.color+"18":isDisabled?P.redDim:"transparent", color: activeIdx===i?mod.color:isDisabled?P.red:P.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 600, opacity: isDisabled ? 0.7 : 1 }}>{s.icon} {s.name}{isDisabled ? " ⊘" : ""}</button>;
                })}
              </div>
              {screens[activeIdx] && (() => { const sc = screens[activeIdx]; const groups = sc.fieldGroups || []; const hasGroups = groups.length > 0;
                const groupedFields = hasGroups ? groups.map(g => ({ section: g.section, fields: (sc.fields||[]).filter(f => g.fieldNames.includes(f.name)) })) : [{ section: null, fields: sc.fields || [] }];
                const ungroupedFields = hasGroups ? (sc.fields||[]).filter(f => !groups.some(g => g.fieldNames.includes(f.name))) : [];
                const addBehavior = (text) => { const s2 = [...screens]; const s = { ...s2[activeIdx] }; s.behavior = [...(s.behavior||[]), text]; s2[activeIdx] = s; save({ ...data, screens: { ...data.screens, [activeMod]: s2 } }); };
                const editBehavior = (bi, text) => { const s2 = [...screens]; const s = { ...s2[activeIdx] }; const b = [...(s.behavior||[])]; b[bi] = text; s.behavior = b; s2[activeIdx] = s; save({ ...data, screens: { ...data.screens, [activeMod]: s2 } }); };
                const deleteBehavior = (bi) => { const s2 = [...screens]; const s = { ...s2[activeIdx] }; const b = [...(s.behavior||[])]; b.splice(bi,1); s.behavior = b; s2[activeIdx] = s; save({ ...data, screens: { ...data.screens, [activeMod]: s2 } }); };
                return (
                <div>
                  {/* Header */}
                  <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{sc.icon} {sc.name}</h2>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: (sc.status || "active") === "active" ? P.greenDim : P.redDim, color: (sc.status || "active") === "active" ? P.green : P.red, textTransform: "uppercase", letterSpacing: "0.5px" }}>{(sc.status || "active") === "active" ? "Active" : "Disabled"}</span>
                        </div>
                        <p style={{ color: P.textMuted, fontSize: 12.5, margin: 0 }}>{sc.description}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small ghost onClick={() => { const s2 = [...screens]; const toggled = { ...s2[activeIdx], status: (s2[activeIdx].status || "active") === "active" ? "disabled" : "active" }; s2[activeIdx] = toggled; save({ ...data, screens: { ...data.screens, [activeMod]: s2 } }); }} style={{ color: (sc.status || "active") === "active" ? P.red : P.green }}>{(sc.status || "active") === "active" ? "⊘ Disable" : "✓ Enable"}</Btn>
                        <Btn small ghost onClick={() => setModal({ type: "editScreen", screen: sc, idx: activeIdx })}>✎ Edit</Btn>
                        <Btn small danger ghost onClick={() => setConfirmDel({ what: sc.name, onConfirm: () => { deleteItem("screens", activeIdx); setActiveIdx(0); setConfirmDel(null); } })}>✕</Btn>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>{sc.reqIds?.map(id => <Badge key={id} text={id} />)}</div>
                    <div style={{ fontSize: 12, color: P.textDim, marginTop: 8 }}><b>Actors:</b> {sc.actors?.join(", ")} · <b>Actions:</b> {sc.actions?.join(" · ")}</div>
                  </div>
                  {/* Screen Layout — driven from Field Definitions */}
                  <div style={{ background: P.surface, border: "1px solid "+P.border, borderRadius: 10, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Badge text="Layout" color={P.purple} /><span style={{ fontSize: 13, fontWeight: 600 }}>Screen Layout</span></div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small ghost onClick={() => { const s2 = [...screens]; s2[activeIdx] = { ...s2[activeIdx] }; save({ ...data, screens: { ...data.screens, [activeMod]: s2 } }); }}>{"\u21BB"} Refresh</Btn>
                        <Btn small onClick={() => setModal({ type: "addField", screenIdx: activeIdx })} color={P.green}>+ Add Field</Btn>
                      </div>
                    </div>
                    {(sc.fields||[]).length === 0 ? <p style={{ color: P.textDim, fontSize: 12, fontStyle: "italic", textAlign: "center", padding: 20 }}>No fields yet. Add fields to see the screen layout.</p> : (() => {
                      const grp = {};
                      (sc.fields||[]).forEach((f,fi) => { const g = f.group || "Ungrouped"; if (!grp[g]) grp[g] = []; grp[g].push({ ...f, _idx: fi }); });
                      const typeLabel = (t) => t === "dropdown" ? "Dropdown" : t === "date" ? "Date" : t === "datetime" ? "DateTime" : t === "number" ? "Number" : t === "tel" ? "Tel" : t === "email" ? "Email" : t === "file" ? "File Upload" : t === "checkbox" ? "Checkbox" : t === "textarea" ? "TextArea" : "Text";
                      return (
                        <div style={{ background: "#0B1B35", borderRadius: 8, padding: 20, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 2, overflowX: "auto" }}>
                          <div style={{ color: "#5BA7E6", fontWeight: 700, fontSize: 13 }}>{sc.name}:</div>
                          {Object.entries(grp).map(([gName, fields], gi) => (
                            <div key={gi}>
                              <div style={{ display: "flex", alignItems: "center", paddingLeft: 28 }}>
                                <span style={{ color: "#80CBC4", fontWeight: 700, flex: 1 }}>{gName}:</span>
                                <button onClick={() => setModal({ type: "addField", screenIdx: activeIdx, defaultGroup: gName === "Ungrouped" ? "" : gName })} style={{ background: "none", border: "1px solid #80CBC455", color: "#80CBC4", cursor: "pointer", fontSize: 10, padding: "1px 8px", borderRadius: 4, opacity: 0.7, fontFamily: "inherit" }}>+ Add</button>
                              </div>
                              {fields.map((f, fi) => (
                                <div key={fi} style={{ display: "flex", alignItems: "center", paddingLeft: 56, color: "#E0E0E0" }}>
                                  <span style={{ minWidth: 180, whiteSpace: "nowrap" }}>{f.label || f.name}</span>
                                  <span style={{ color: "#546E7A", margin: "0 6px" }}>:</span>
                                  <span style={{ color: "#FFD54F", whiteSpace: "nowrap" }}>{typeLabel(f.type)}</span>
                                  {f.note && <span style={{ color: "#78909C", whiteSpace: "nowrap" }}>{" | "}{f.note}</span>}
                                  {f.required && <span style={{ color: "#EF5350", marginLeft: 4 }}>*</span>}
                                  <span style={{ marginLeft: "auto", display: "flex", gap: 2, flexShrink: 0 }}>
                                    <button onClick={() => setModal({ type: "editField", screenIdx: activeIdx, fieldIdx: f._idx, field: sc.fields[f._idx] })} style={{ background: "none", border: "none", color: "#5BA7E6", cursor: "pointer", fontSize: 11, padding: "0 4px", opacity: 0.6 }}>{"\u270E"}</button>
                                    <button onClick={() => deleteFieldFromScreen(activeIdx, f._idx)} style={{ background: "none", border: "none", color: "#EF5350", cursor: "pointer", fontSize: 11, padding: "0 4px", opacity: 0.6 }}>{"\u2715"}</button>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Fields with Grouping */}
                  <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Badge text="Fields" color={P.amber} /><span style={{ fontSize: 13, fontWeight: 600 }}>Field Definitions</span></div><Btn small onClick={() => setModal({ type: "addField", screenIdx: activeIdx })} color={P.green}>+ Add</Btn></div>
                    {(sc.fields||[]).length === 0 ? <p style={{ color: P.textDim, fontSize: 12, fontStyle: "italic" }}>No fields defined yet.</p> : (
                      <>
                        {groupedFields.map((g, gi) => (
                          <div key={gi} style={{ marginBottom: 16 }}>
                            {g.section && <div style={{ fontSize: 11, fontWeight: 700, color: mod.color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 4, borderBottom: `1px solid ${P.border}` }}>{g.section}</div>}
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              {gi === 0 && <thead><tr><TH>Field</TH><TH>Label</TH><TH>Type</TH><TH>Req</TH><TH>Group</TH><TH>Table</TH><TH>Notes</TH><TH></TH></tr></thead>}
                              <tbody>{g.fields.map((f,fi) => { const realIdx = (sc.fields||[]).indexOf(f); return (
                                <tr key={fi} style={{ borderBottom: `1px solid ${P.border}15` }}>
                                  <TD mono color="#1565C0">{f.name}</TD><TD bold>{f.label}</TD>
                                  <TD><span style={{ padding: "1px 6px", borderRadius: 4, background: P.border, fontSize: 10, fontFamily: "monospace" }}>{f.type}</span></TD>
                                  <TD color={f.required ? P.red : P.textDim}>{f.required ? "*" : "—"}</TD>
                                  <TD>{f.group ? <span style={{ padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: P.purpleDim, color: P.purple, fontFamily: "monospace" }}>{f.group}</span> : <span style={{ color: P.textDim, fontSize: 11 }}>—</span>}</TD>
                                  <TD><span style={{ padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: P.greenDim, color: P.green, fontFamily: "monospace" }}>{f.targetTable || "MP_patients"}</span></TD>
                                  <TD color={P.textMuted}>{f.note}</TD>
                                  <TD><div style={{ display: "flex", gap: 4 }}><Btn small ghost onClick={() => setModal({ type: "editField", screenIdx: activeIdx, fieldIdx: realIdx, field: f })}>✎</Btn><Btn small danger ghost onClick={() => deleteFieldFromScreen(activeIdx, realIdx)}>✕</Btn></div></TD>
                                </tr>
                              ); })}</tbody>
                            </table>
                          </div>
                        ))}
                        {ungroupedFields.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: P.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Other Fields</div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <tbody>{ungroupedFields.map((f,fi) => { const realIdx = (sc.fields||[]).indexOf(f); return (
                                <tr key={fi} style={{ borderBottom: `1px solid ${P.border}15` }}>
                                  <TD mono color="#1565C0">{f.name}</TD><TD bold>{f.label}</TD>
                                  <TD><span style={{ padding: "1px 6px", borderRadius: 4, background: P.border, fontSize: 10, fontFamily: "monospace" }}>{f.type}</span></TD>
                                  <TD color={f.required ? P.red : P.textDim}>{f.required ? "*" : "—"}</TD>
                                  <TD><span style={{ padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: P.greenDim, color: P.green, fontFamily: "monospace" }}>{f.targetTable || "MP_patients"}</span></TD>
                                  <TD color={P.textMuted}>{f.note}</TD>
                                  <TD><div style={{ display: "flex", gap: 4 }}><Btn small ghost onClick={() => setModal({ type: "editField", screenIdx: activeIdx, fieldIdx: realIdx, field: f })}>✎</Btn><Btn small danger ghost onClick={() => deleteFieldFromScreen(activeIdx, realIdx)}>✕</Btn></div></TD>
                                </tr>
                              ); })}</tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {/* Behavior - Interactive */}
                  <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Badge text="Behavior" color={P.green} /><span style={{ fontSize: 13, fontWeight: 600 }}>Business Rules</span></div>
                      <Btn small onClick={() => { const t = prompt("Enter new business rule:"); if (t) addBehavior(t); }} color={P.green}>+ Add Rule</Btn>
                    </div>
                    {(sc.behavior||[]).length === 0 && <p style={{ color: P.textDim, fontSize: 12, fontStyle: "italic" }}>No rules defined.</p>}
                    {(sc.behavior||[]).map((b,i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "6px 8px", background: P.bg, borderRadius: 5, fontSize: 12, marginBottom: 4, color: P.textMuted, alignItems: "center" }}>
                        <span style={{ color: P.green, fontWeight: 800, fontSize: 10, minWidth: 18 }}>{String(i+1).padStart(2,"0")}</span>
                        <span style={{ flex: 1 }}>{b}</span>
                        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                          <Btn small ghost onClick={() => { const t = prompt("Edit rule:", b); if (t !== null) editBehavior(i, t); }} style={{ padding: "2px 6px" }}>✎</Btn>
                          <Btn small danger ghost onClick={() => deleteBehavior(i)} style={{ padding: "2px 6px" }}>✕</Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* API */}
                  <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Badge text="API" color={P.accent} /><span style={{ fontSize: 13, fontWeight: 600 }}>Endpoints</span></div><Btn small onClick={() => setModal({ type: "addEndpoint", screenIdx: activeIdx })} color={P.green}>+ Add</Btn></div>
                    {(sc.apiEndpoints||[]).length === 0 && <p style={{ color: P.textDim, fontSize: 12, fontStyle: "italic" }}>No endpoints defined.</p>}
                    {(sc.apiEndpoints||[]).map((ep,i) => (
                      <div key={i} style={{ background: P.bg, borderRadius: 7, padding: 12, border: `1px solid ${P.border}`, marginBottom: 6 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MethodBadge m={ep.method} /><code style={{ fontSize: 12, color: "#1565C0", fontFamily: "monospace" }}>{ep.path}</code></div>
                          <div style={{ display: "flex", gap: 4 }}><Btn small ghost onClick={() => setModal({ type: "editEndpoint", screenIdx: activeIdx, epIdx: i, ep })}>✎</Btn><Btn small danger ghost onClick={() => deleteEpFromScreen(activeIdx, i)}>✕</Btn></div>
                        </div>
                        {ep.params && <div style={{ fontSize: 11, color: P.textDim, marginTop: 4 }}><b>Params:</b> <code>{ep.params}</code></div>}
                        {ep.response && <div style={{ fontSize: 11, color: P.textDim, marginTop: 2 }}><b>Response:</b> <code style={{ color: P.green }}>{ep.response}</code></div>}
                      </div>
                    ))}
                  </div>
                </div>
              ); })()}
            </div>
          )}

          {/* DATABASE */}
          {activeTab === "database" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Database Tables</h1>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={dbEngine} onChange={e => setDbEngine(e.target.value)} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid " + P.border, background: "#F8FAFC", color: P.text, fontSize: 12, fontWeight: 600, outline: "none" }}>
                    {DB_ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <Btn onClick={() => { if (!cols[activeIdx]) return; dlSQL(genSQL(cols[activeIdx], dbEngine), cols[activeIdx].name + "_" + dbEngine.toLowerCase().split(" ").join("_") + ".sql"); }} color={P.accent} small>Export Table SQL</Btn>
                  <Btn onClick={() => { if (!cols.length) return; dlSQL(genAllSQL(dbEngine), activeMod + "_all_" + dbEngine.toLowerCase().split(" ").join("_") + ".sql"); }} color={P.purple} small>Export All SQL</Btn>
                  <Btn onClick={() => setModal({ type: "addCollection" })} color={P.green}>+ Add Table</Btn>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {cols.map((c,i) => <button key={i} onClick={() => { setActiveIdx(i); setPgDbFields(1); }} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${activeIdx===i?P.green:P.border}`, background: activeIdx===i?P.greenDim:"transparent", color: activeIdx===i?P.green:P.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>{c.name}</button>)}
              </div>
              {cols[activeIdx] && (() => { const col = cols[activeIdx]; return (
                <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div><h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace", color: P.green, margin: "0 0 2px" }}>{col.name}</h2><p style={{ color: P.textMuted, fontSize: 12, margin: 0 }}>{col.description}</p></div>
                    <div style={{ display: "flex", gap: 6 }}><Btn small ghost onClick={() => setModal({ type: "editCollection", col, idx: activeIdx })}>✎</Btn><Btn small danger ghost onClick={() => setConfirmDel({ what: col.name, onConfirm: () => { deleteItem("dbCollections", activeIdx); setActiveIdx(0); setConfirmDel(null); } })}>×</Btn></div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>{col.indices?.map((idx,i) => <span key={i} style={{ padding: "3px 9px", borderRadius: 5, fontSize: 11, background: P.amberDim, color: P.amber, fontFamily: "monospace" }}>{idx}</span>)}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 10, fontWeight: 800, color: P.accent, textTransform: "uppercase", letterSpacing: "1px" }}>Schema</span><Btn small onClick={() => setModal({ type: "addDbField", colIdx: activeIdx })} color={P.green}>+ Add Field</Btn></div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><TH>Column Name</TH><TH>Data Type</TH><TH>Description</TH><TH>Constraints</TH><TH>Screen</TH><TH></TH></tr></thead>
                    <tbody>{pgSlice(col.fields||[], pgDbFields).map((f,fi) => { const rfi = (col.fields||[]).indexOf(f); return (
                      <tr key={fi} style={{ borderBottom: "1px solid "+P.border+"12" }}>
                        <TD mono color="#1565C0">{f.field}</TD>
                        <TD><span style={{ padding: "1px 6px", borderRadius: 4, background: P.border, fontSize: 10, fontFamily: "monospace" }}>{f.type}</span></TD>
                        <TD color={P.textMuted}>{f.desc}</TD>
                        <TD>{f.constraints ? <span style={{ fontSize: 10, fontFamily: "monospace", color: P.amber }}>{f.constraints}</span> : <span style={{ color: P.textDim, fontSize: 11 }}>{"\u2014"}</span>}</TD>
                        <TD>{f.screen ? <Badge text={f.screen} color={mod.color} /> : <span style={{ color: P.textDim, fontSize: 11 }}>{"\u2014"}</span>}</TD>
                        <TD><div style={{ display: "flex", gap: 4 }}><Btn small ghost onClick={() => setModal({ type: "editDbField", colIdx: activeIdx, fieldIdx: rfi, field: f })}>✎</Btn><Btn small danger ghost onClick={() => deleteDbField(activeIdx, rfi)}>{"\u00D7"}</Btn></div></TD>
                      </tr>
                    ); })}</tbody>
                  </table>
                  <Pager items={col.fields||[]} page={pgDbFields} setPage={setPgDbFields} />
                  <div style={{ marginTop: 14, borderTop: "1px solid "+P.border, paddingTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: P.textDim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Audit Columns (auto-included)</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {[{ field:"Added_Date", type:"TIMESTAMP", desc:"First time the record added to our system", constraints:"DEFAULT CURRENT_TIMESTAMP" },
                          { field:"Added_By_ID", type:"VARCHAR", desc:"The person id who added this row", constraints:"DEFAULT LOGIN_USER_ID" },
                          { field:"Modified_Date", type:"TIMESTAMP", desc:"The time of any update happens to this record", constraints:"DEFAULT CURRENT_TIMESTAMP" },
                          { field:"Modified_By_ID", type:"VARCHAR", desc:"The person id who lastly updated this row", constraints:"DEFAULT LOGIN_USER_ID" }
                        ].map((f,fi) => (
                          <tr key={fi} style={{ borderBottom: "1px solid "+P.border+"12", background: P.surfaceHover }}>
                            <TD mono color="#78909C">{f.field}</TD>
                            <TD><span style={{ padding: "1px 6px", borderRadius: 4, background: P.border, fontSize: 10, fontFamily: "monospace" }}>{f.type}</span></TD>
                            <TD color={P.textMuted}>{f.desc}</TD>
                            <TD><span style={{ fontSize: 10, fontFamily: "monospace", color: P.amber }}>{f.constraints}</span></TD>
                            <TD><span style={{ color: P.textDim, fontSize: 10 }}>system</span></TD>
                            <TD></TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>


              ); })()}
            </div>
          )}

          {/* API */}
          {activeTab === "api" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>API Reference</h1>
              {screens.map((sc,si) => (
                <div key={si} style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{sc.icon} {sc.name}</h2>
                  {(sc.apiEndpoints||[]).map((ep,i) => (
                    <div key={i} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: 14, marginBottom: 6 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><MethodBadge m={ep.method} /><code style={{ fontSize: 12.5, color: "#1565C0", fontFamily: "monospace", fontWeight: 600 }}>{ep.path}</code></div>
                      {ep.params && <div style={{ fontSize: 11.5, color: P.textDim }}><b>Params:</b> <code>{ep.params}</code></div>}
                      {ep.response && <div style={{ fontSize: 11.5, color: P.textDim }}><b>Response:</b> <code style={{ color: P.green }}>{ep.response}</code></div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Reports</h1>
                <Btn onClick={() => setModal({ type: "addReport" })} color={P.green}>+ Add Report</Btn>
              </div>
              {reps.map((r,i) => (
                <div key={i} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 18, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div><h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px" }}>{r.name}</h3><p style={{ color: P.textMuted, fontSize: 12, margin: "0 0 8px" }}>{r.description}</p></div>
                    <div style={{ display: "flex", gap: 6 }}><Btn small ghost onClick={() => setModal({ type: "editReport", report: r, idx: i })}>✎</Btn><Btn small danger ghost onClick={() => setConfirmDel({ what: r.name, onConfirm: () => { deleteItem("reports", i); setConfirmDel(null); } })}>×</Btn></div>
                  </div>
                  <code style={{ fontSize: 11, color: P.green, display: "block", marginBottom: 10, padding: "4px 8px", background: P.bg, borderRadius: 4 }}>{r.endpoint}</code>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 800, color: P.amber, textTransform: "uppercase", marginBottom: 4 }}>Filters</div>{r.filters?.map((f,fi) => <div key={fi} style={{ fontSize: 11.5, color: P.textMuted, padding: "2px 0" }}>• {f}</div>)}</div>
                    <div><div style={{ fontSize: 10, fontWeight: 800, color: P.accent, textTransform: "uppercase", marginBottom: 4 }}>Columns</div>{r.columns?.map((c,ci) => <div key={ci} style={{ fontSize: 11.5, color: P.textMuted, padding: "2px 0" }}>• {c}</div>)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MATRIX */}
          {activeTab === "matrix" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Requirements Matrix</h1>
                <Btn onClick={() => setModal({ type: "addReq" })} color={P.green}>+ Add Requirement</Btn>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <Input value={search} onChange={v => { setSearch(v); setPgReqs(1); }} placeholder="Search..." style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 4 }}>{["All","High","Medium","Low"].map(p => <button key={p} onClick={() => { setFilterPri(p); setPgReqs(1); }} style={{ padding: "6px 11px", borderRadius: 5, border: `1px solid ${filterPri===p?mod.color:P.border}`, background: filterPri===p?mod.color+"18":"transparent", color: filterPri===p?mod.color:P.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{p}</button>)}</div>
              </div>
              <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><TH>ID</TH><TH>Function</TH><TH>Description</TH><TH>Actors</TH><TH>Business Rule</TH><TH>Priority</TH><TH>Screen</TH><TH></TH></tr></thead>
                  <tbody>{pgSlice(filteredReqs, pgReqs).map((r,i) => { const realIdx = reqs.indexOf(r); const actorsTxt = Array.isArray(r.actors) ? r.actors.join(", ") : (r.actors || ""); return (
                    <tr key={i} style={{ borderBottom: `1px solid ${P.border}15` }}>
                      <TD mono color="#A5F3FC" bold>{r.id}</TD>
                      <TD bold>{r.name}</TD>
                      <TD color={P.textMuted}><div style={{ maxWidth: 280, whiteSpace: "normal", lineHeight: 1.4 }}>{r.description || ""}</div></TD>
                      <TD color={P.textMuted}><div style={{ maxWidth: 160, whiteSpace: "normal", lineHeight: 1.4 }}>{actorsTxt}</div></TD>
                      <TD color={P.textMuted}><div style={{ maxWidth: 320, whiteSpace: "normal", lineHeight: 1.4 }}>{r.source || ""}</div></TD>
                      <TD><PriorityBadge p={r.priority} /></TD>
                      <TD color={P.textMuted}>{r.screen}</TD>
                      <TD><div style={{ display: "flex", gap: 4 }}><Btn small ghost onClick={() => setModal({ type: "editReq", req: r, idx: realIdx })}>✎</Btn><Btn small danger ghost onClick={() => setConfirmDel({ what: r.id, onConfirm: () => { deleteItem("requirements", realIdx); setConfirmDel(null); } })}>×</Btn></div></TD>
                    </tr>
                  ); })}</tbody>
                </table>
                <div style={{ padding: "8px 12px", fontSize: 11, color: P.textDim, borderTop: `1px solid ${P.border}` }}>{filteredReqs.length} of {reqs.length}</div>
                <Pager items={filteredReqs} page={pgReqs} setPage={setPgReqs} />
              </div>
            </div>
          )}

          {/* GUIDES */}
          {activeTab === "guides" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>User Guides</h1>
                <Btn onClick={() => setModal({ type: "addGuide" })} color={P.green}>+ Add Guide</Btn>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {guides.map((g,i) => <button key={i} onClick={() => setActiveIdx(i)} style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${activeIdx===i?mod.color:P.border}`, background: activeIdx===i?mod.color+"18":"transparent", color: activeIdx===i?mod.color:P.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{g.title}</button>)}
              </div>
              {guides[activeIdx] && (() => { const g = guides[activeIdx]; return (
                <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div><h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{g.title}</h2><Badge text={`Role: ${g.role}`} color={mod.color} /></div>
                    <div style={{ display: "flex", gap: 6 }}><Btn small ghost onClick={() => setModal({ type: "editGuide", guide: g, idx: activeIdx })}>✎ Edit</Btn><Btn small danger ghost onClick={() => setConfirmDel({ what: g.title, onConfirm: () => { deleteItem("userGuides", activeIdx); setActiveIdx(0); setConfirmDel(null); } })}>×</Btn></div>
                  </div>
                  {g.steps?.map((s,i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i<g.steps.length-1?`1px solid ${P.border}15`:"none" }}>
                      <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: mod.color+"18", border: `2px solid ${mod.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: mod.color, flexShrink: 0 }}>{i+1}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: P.textMuted, paddingTop: 3 }}>{s}</div>
                    </div>
                  ))}
                </div>
              ); })()}
            </div>
          )}

        </main>
      </div>

      {/* ━━━ MODALS ━━━ */}
      {modal?.type === "addModule" && <ModuleModal onSave={m => addModule(m)} onClose={() => setModal(null)} />}
      {modal?.type === "editModule" && <ModuleModal initial={modal.module} onSave={m => updateModule(modal.module.id, m)} onClose={() => setModal(null)} />}
      {modal?.type === "addReq" && <ReqModal onClose={() => setModal(null)} />}
      {modal?.type === "editReq" && <ReqModal initial={modal.req} idx={modal.idx} onClose={() => setModal(null)} />}
      {modal?.type === "addScreen" && <ScreenModal onClose={() => setModal(null)} />}
      {modal?.type === "editScreen" && <ScreenModal initial={modal.screen} idx={modal.idx} onClose={() => setModal(null)} />}
      {modal?.type === "addField" && <FieldModal screenIdx={modal.screenIdx} defaultGroup={modal.defaultGroup} onClose={() => setModal(null)} />}
      {modal?.type === "editField" && <FieldModal screenIdx={modal.screenIdx} fieldIdx={modal.fieldIdx} initial={modal.field} onClose={() => setModal(null)} />}
      {modal?.type === "addEndpoint" && <EndpointModal screenIdx={modal.screenIdx} onClose={() => setModal(null)} />}
      {modal?.type === "editEndpoint" && <EndpointModal screenIdx={modal.screenIdx} epIdx={modal.epIdx} initial={modal.ep} onClose={() => setModal(null)} />}
      {modal?.type === "addCollection" && <CollectionModal onClose={() => setModal(null)} />}
      {modal?.type === "editCollection" && <CollectionModal initial={modal.col} idx={modal.idx} onClose={() => setModal(null)} />}
      {modal?.type === "addDbField" && <DbFieldModal colIdx={modal.colIdx} onClose={() => setModal(null)} />}
      {modal?.type === "editDbField" && <DbFieldModal colIdx={modal.colIdx} fieldIdx={modal.fieldIdx} initial={modal.field} onClose={() => setModal(null)} />}
      {modal?.type === "addReport" && <ReportModal onClose={() => setModal(null)} />}
      {modal?.type === "editReport" && <ReportModal initial={modal.report} idx={modal.idx} onClose={() => setModal(null)} />}
      {modal?.type === "addGuide" && <GuideModal onClose={() => setModal(null)} />}
      {modal?.type === "editGuide" && <GuideModal initial={modal.guide} idx={modal.idx} onClose={() => setModal(null)} />}
      {/* End modals */}
      {confirmDel && <ConfirmDelete what={confirmDel.what} onConfirm={confirmDel.onConfirm} onCancel={() => setConfirmDel(null)} />}
    </div>
  );
}
