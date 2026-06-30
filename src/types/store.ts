import type { QuerySnapshot, DocumentSnapshot } from "firebase/firestore";

export type UserRole = "super_admin" | "technician";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
  status?: "active" | "inactive";
  createdAt?: string;
  totalTickets?: number;
  avgCsat?: number;
  tenureDays?: number;
  companyId?: string;
  companyName?: string;
}

export interface TicketAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Ticket {
  id: string;
  ticketSequenceId: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  requesterId?: string;
  requesterName?: string;
  requesterEmail?: string;
  department?: string;
  assignedToId: string | null;
  assignedToName: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  tags?: string[];
  csatScore?: number;
  attachments?: TicketAttachment[];
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isSending?: boolean;
  attachments?: string[];
}

// Ensure formatting utility type-signatures use proper unknown/strict abstractions instead of 'any':
export type SanitizeSnapshotFn = <T>(snapshot: QuerySnapshot) => T[];
export type FormatDateTimeFn = (timestamp: DocumentSnapshot | Date | string | unknown) => string;
export type SerializeTimestampFn = (date: Date | unknown) => string;
