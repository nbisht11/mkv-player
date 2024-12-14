import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestServiceService {

  constructor() { }

  private file:any;
  private parsed:any;
  private _outputSource = new BehaviorSubject<any>("");
  outputObservable = this._outputSource.asObservable();
  ffmpegWorker!: Worker;

  getFile() {
    return this.file;
  }
  
  setFile(file:any) {
    this.file = file;
  }

  getParsed(){
    return this.parsed;
  }

  setParsed(parsed:any) {
    this.parsed = parsed;
  }

  async getDefaultVideoAndAllAudioStreams(audioStreamIndex = undefined) {
    let file = this.getFile();
    let parsed = this.getParsed();
    let finalResult:any = {};
    let defaultVideoStream = parsed.streams.filter((stream: any) => {
      return (stream.codec_type == "video" && stream?.disposition?.default == 1)
    });
    let audioStreams =  parsed.streams.filter((stream: any) => {
      return (stream.codec_type == "audio");
    });
    let defaultAudioStreamIndex:any;
    if(audioStreamIndex == undefined){
      let defaultAudioStream = audioStreams.find((stream: any) => {
        return stream?.disposition?.default == 1;
      });
      defaultAudioStreamIndex = audioStreams.findIndex((stream: any) => stream == defaultAudioStream);
    } else {
      defaultAudioStreamIndex = audioStreamIndex;
    }
    const argvs = [
      '-i', '/data/' + file.name,
      '-codec', 'copy',
      '-map', `0:v:${defaultVideoStream[0].index}`,
      "videoPlayback.mp4"
    ]
    if((typeof defaultAudioStreamIndex === 'number') && (defaultAudioStreamIndex > -1)) {
      let audioArgv = ['-map', `0:a:${defaultAudioStreamIndex}`]
      let index = 2;
      for(let arg of audioArgv) {
        argvs.splice(index, 0,arg);
        index++;
      }
    }
    finalResult.audioStreams = audioStreams;
    const ffmpegResult:any = await this.getExtractedStream(file, argvs);
    const resultFile = ffmpegResult.files[0]
    if (resultFile) {
      const contents = resultFile.data
      finalResult.video = { type: 'file', name, contents };
      //this.outputData.emit({ type: 'file', name, contents })
    }
    this._outputSource.next(finalResult);
    //this.outputData.emit(finalResult);
  }

  getExtractedStream (file:any, argv:any) {
    file = structuredClone(file);
    return new Promise((resolve, reject) => {
      this.ffmpegWorker = new Worker(new URL('../../assets/js/ffmpeg-worker-mkve', import.meta.url));
      let stdout = ''
      let stderr = ''
      this.ffmpegWorker.onmessage = (message: any) => {
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
            this.ffmpegWorker?.terminate();
            break
        }
      }
      this.ffmpegWorker.postMessage({
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
