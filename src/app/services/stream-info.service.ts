import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreamInfoService {

  constructor(@Inject(DOCUMENT) private document: Document) { }

  getStreamInfo(file: any) {
    return new Promise((resolve, reject) => {
      let getStreamDetailsWorker = new Worker(`${this.document.location.origin}/js/ffprobe-worker-mkve.js`);
      let stdout = ''
      let stderr = ''
      getStreamDetailsWorker.onmessage = async (message: any) => {
        const msg = message.data;
        switch (msg.type) {
          case 'stdout':
            stdout += msg.data + '\n'
            break
          case 'stderr':
            stderr += msg.data + '\n'
            break
          case 'done':
            let parsed;
            try {
              parsed = JSON.parse(stdout)
              if (!parsed.streams || parsed.streams.length === 0) {
                reject(Error('No streams found'));
              }
              resolve(parsed);
            } catch (err) {
              reject(err);
            } finally {
              getStreamDetailsWorker.terminate();
              break;
            }
        }
      };

      getStreamDetailsWorker.postMessage({
        type: 'run',
        arguments: [
          '/data/' + file.name,
          '-print_format', 'json',
          '-show_streams',
          '-show_format',
          '-show_chapters'
        ],
        mounts: [{
          type: 'WORKERFS',
          opts: {
            files: [file]
          },
          mountpoint: '/data'
        }]
      });
    });
  }
}
