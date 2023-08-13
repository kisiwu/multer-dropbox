import { Dropbox, files } from 'dropbox';
import { StorageEngine } from 'multer'

export = multerDropbox;

declare namespace multerDropbox {
  export interface IValueMethod<T> {
    (
      req: Express.Request,
      file: Express.Multer.File,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: (error?: any, value?: T) => void
    ): void;
  }
  export interface CommitInfo {
    filesCommitInfo?: Partial<files.UploadArg> | IValueMethod<Partial<files.UploadArg>>,
    contents?: files.UploadArg['contents'] | IValueMethod<files.UploadArg['contents']>,
    path?: files.CommitInfo['path'] | IValueMethod<files.CommitInfo['path']>,
    mode?: files.CommitInfo['mode'] | IValueMethod<files.CommitInfo['mode']>,
    autorename?: files.CommitInfo['autorename'] | IValueMethod<files.CommitInfo['autorename']>,
    client_modified?: files.CommitInfo['client_modified'] | IValueMethod<files.CommitInfo['client_modified']>,
    mute?: files.CommitInfo['mute'] | IValueMethod<files.CommitInfo['mute']>,
    property_groups?: files.CommitInfo['property_groups'] | IValueMethod<files.CommitInfo['property_groups']>,
    strict_conflict?: files.CommitInfo['strict_conflict'] | IValueMethod<files.CommitInfo['strict_conflict']>
  }
  export interface DropboxStorageEngine extends StorageEngine {
    getFilesCommitInfo(
      req: Express.Request,
      file: Express.Multer.File,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: (error?: any, filesCommitInfo?: Partial<files.UploadArg>) => void
    ): void;
  }
}

declare function multerDropbox(
  client: Dropbox | multerDropbox.IValueMethod<Dropbox>,
  opts: multerDropbox.CommitInfo
): multerDropbox.DropboxStorageEngine;
