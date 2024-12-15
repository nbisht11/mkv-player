import { Inject, Injectable } from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StreamExtractionService {

  constructor(@Inject(DOCUMENT) private document: Document) { }

  getExtractedStreamForVideoPlayback (file:any, argv:any) {
    file = structuredClone(file);
    return new Promise((resolve, reject) => {
      let ffmpegWorker = new Worker(`${this.document.location.origin}/js/ffmpeg-worker-mkve.js`);
      let stdout = ''
      let stderr = ''
      ffmpegWorker.onmessage = (message: any) => {
        const msg = message.data
        switch (msg.type) {
          case 'stdout':
            stdout += msg.data + '\n'
            break
          case 'stderr':
            stderr += msg.data + '\n'
            break
          case 'done':
            const files = msg.data.MEMFS
            resolve({ files, stdout, stderr })
            ffmpegWorker.terminate();
            break
        }
      }
      ffmpegWorker.postMessage({
        type: 'run',
        arguments: argv,
        mounts: [{
          type: 'WORKERFS',
          opts: {
            files: [file]
          },
          mountpoint: '/data'
        }]
      })
    })
  }
}
