import { Injectable } from '@angular/core';
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StreamExtractionService {

  constructor(private location: Location) { }

  getExtractedStreamForVideoPlayback (file:any, argv:any) {
    file = structuredClone(file);
    return new Promise((resolve, reject) => {
      const workerUrl = this.location.prepareExternalUrl('js/ffmpeg-worker-mkve.js');
      let ffmpegWorker = new Worker(workerUrl);
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
