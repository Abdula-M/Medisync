export type ConsultationStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'patient' | 'doctor';
  text: string;
  timestamp: string;
}

export interface ConsultationFile {
  id: string;
  name: string;
  base64: string;
  uploadedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  datetime: string;
  status: ConsultationStatus;
  symptoms: string;
  conclusion?: string;
  cancelReason?: string;
  chatMessages: ChatMessage[];
  files: ConsultationFile[];
  startedAt?: string;
  durationSeconds?: number;
}
