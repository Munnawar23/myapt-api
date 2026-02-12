-- Add ALLOWED_ENTRY to the gate_passes_status_enum
ALTER TYPE gate_passes_status_enum ADD VALUE IF NOT EXISTS 'ALLOWED_ENTRY';
