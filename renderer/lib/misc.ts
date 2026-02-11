import { formatDateSince } from './utils';

// Minimal Recording/User types for desktop usage.
// Replace with real types when backend/schema is integrated.
export type RecordingModel = {
  id: string;
  title?: string;
  createdAt: string;
  [key: string]: any;
};

export type UserModel = {
  id: string;
  email?: string;
  [key: string]: any;
};

export type RecordingModalItem = RecordingModel & {
  isEditable?: boolean;
  recordingTimeStr?: string;
};

/**
 * Very small stub of isUserFreePlan – always returns false for now.
 * Replace with real plan check when payment helper is available.
 */
export const isUserFreePlan = (_user?: UserModel | null) => {
  return false;
};

/**
 * Format date to "x time ago".
 * Re-exported here for parity with the web app.
 */
export { formatDateSince };

/**
 * Convert a RecordingModel to the modal item shape used in the UI.
 * Mirrors the behavior of convertToRecordingModalItem in the web app,
 * but with a simplified editable check.
 */
export const convertToRecordingModalItem = (
  recording: RecordingModel,
  _ventoUser?: UserModel
): RecordingModalItem => {
  const isEditable = true;

  return {
    ...recording,
    isEditable,
    recordingTimeStr: formatDateSince(new Date(recording.createdAt)),
  };
};

/**
 * Lightweight logClientEvent stub.
 * In the web app this sends events to Mixpanel/Amplitude.
 * Here we just log to the console so calls are safe.
 */
export function logClientEvent(name: string, data?: any) {
  // eslint-disable-next-line no-console
  console.log('[event]', name, data ?? {});
}

