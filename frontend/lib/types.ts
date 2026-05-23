export type ScenarioType =
  | "appointment_reminder"
  | "lead_qualification"
  | "customer_satisfaction"
  | "payment_followup"
  | "event_registration";

export type CallStatusType = "queued" | "in-progress" | "ended" | "failed";

export type ScenarioFieldType = "text" | "date" | "phone";

export interface ScenarioField {
  key: string;
  label: string;
  required: boolean;
  placeholder?: string;
  type?: ScenarioFieldType;
}

export interface ScenarioInfo {
  id: ScenarioType;
  label: string;
  description: string;
  fields: ScenarioField[];
}

export interface CallStatus {
  call_id: string;
  status: CallStatusType;
  phone_number: string;
  scenario: ScenarioType;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  recording_url: string | null;
  ended_reason: string | null;
  cost: number | null;
}

export interface InitiateCallRequest {
  phone_number: string;
  scenario: ScenarioType;
  scenario_config: Record<string, string>;
}

export interface InitiateCallResponse {
  success: boolean;
  call_id: string;
  message?: string;
  status: string;
  phone_number: string;
  scenario: ScenarioType;
}
