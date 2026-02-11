/**
 * Lightweight stub of the vento webAPI client for VentoDesktop.
 * 
 * The real web app uses an OpenAPI-generated client (@schema/WebAPI).
 * Here we only define the methods we need so that imports compile.
 * Replace implementations with real HTTP calls when backend is wired up.
 */

type AnyPromiseFn = (...args: any[]) => Promise<any>;

type RecordingAPI = {
  recordingGetListofRecordingsByUser: AnyPromiseFn;
  recordingDeleteRecording: AnyPromiseFn;
  recordingDeleteMultipleRecordings: AnyPromiseFn;
  recordingAddToFolder: AnyPromiseFn;
  recordingSetPassword: AnyPromiseFn;
  recordingUpdateRecording: AnyPromiseFn;
  recordingUpdateTitle: AnyPromiseFn;
  recordingPatchRecording: AnyPromiseFn;
};

type FolderAPI = {
  folderGetUserFolders: AnyPromiseFn;
  folderCreateFolder: AnyPromiseFn;
  folderUpdateFolder: AnyPromiseFn;
  folderDeleteFolder: AnyPromiseFn;
};

type SearchAPI = {
  searchSearch: AnyPromiseFn;
};

type WebAPI = {
  recording: RecordingAPI;
  folder: FolderAPI;
  search: SearchAPI;
};

function notImplemented(name: string): AnyPromiseFn {
  return async () => {
    throw new Error(`webAPI.${name} is not implemented in VentoDesktop yet`);
  };
}

const webAPI: WebAPI = {
  recording: {
    recordingGetListofRecordingsByUser: notImplemented('recording.recordingGetListofRecordingsByUser'),
    recordingDeleteRecording: notImplemented('recording.recordingDeleteRecording'),
    recordingDeleteMultipleRecordings: notImplemented('recording.recordingDeleteMultipleRecordings'),
    recordingAddToFolder: notImplemented('recording.recordingAddToFolder'),
    recordingSetPassword: notImplemented('recording.recordingSetPassword'),
    recordingUpdateRecording: notImplemented('recording.recordingUpdateRecording'),
    recordingUpdateTitle: notImplemented('recording.recordingUpdateTitle'),
    recordingPatchRecording: notImplemented('recording.recordingPatchRecording'),
  },
  folder: {
    folderGetUserFolders: notImplemented('folder.folderGetUserFolders'),
    folderCreateFolder: notImplemented('folder.folderCreateFolder'),
    folderUpdateFolder: notImplemented('folder.folderUpdateFolder'),
    folderDeleteFolder: notImplemented('folder.folderDeleteFolder'),
  },
  search: {
    searchSearch: notImplemented('search.searchSearch'),
  },
};

export default webAPI;

