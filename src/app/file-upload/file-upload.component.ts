import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import Dropzone from 'dropzone';
import { TestServiceService } from '../services/test-service.service';

@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements AfterViewInit {

  constructor(private testService: TestServiceService){}
  @ViewChild('dropzoneWrapper') dropzoneWrapper!: ElementRef;
  @Output() outputData = new EventEmitter();
  dzone!: Dropzone;
  getStreamDetailsWorker!: Worker;
  ffmpegWorker!: Worker;
  reader: FileReader = new FileReader();

  ngAfterViewInit(): void {
    this.initaliseDropzone();
    this.getStreamDetailsWorker = new Worker(new URL('../../assets/js/ffprobe-worker-mkve', import.meta.url));
    this.reader.onload = this.sendFileToWorker.bind(this);
  }

  sendFileToWorker(file: any) {
    this.getStreamDetailsWorker.onmessage = (data: any) => {
      console.log("page got message:", data);
    };
    this.getStreamDetailsWorker.postMessage(file.target.result);
  }

  initaliseDropzone() {
    this.dzone = new Dropzone(this.dropzoneWrapper.nativeElement, {
      url: 'null',
      autoProcessQueue: false,
      maxFilesize: 2600,
      acceptedFiles: '.mp4, .mkv, .mov, .3gp'
    });

    this.dzone.on('addedfile', (file) => {
      this.testService.setFile(file);
      let stdout = ''
      let stderr = ''
      this.getStreamDetailsWorker.onmessage = async (message: any) => {
        const msg = message.data;
        switch (msg.type) {
          case 'stdout':
            stdout += msg.data + '\n'
            break
          case 'stderr':
            stderr += msg.data + '\n'
            break
          case 'done':
            let parsed, error;
            let finalData:any = {};
            try {
              parsed = JSON.parse(stdout)
              if (!parsed.streams || parsed.streams.length === 0) {
                throw Error('No streams found')
              }
              this.testService.setParsed(parsed);
              this.testService.getDefaultVideoAndAllAudioStreams();
              //this.outputData.emit(finalData);
            } catch (err) {
              error = err
            } finally {
              break
            }
        }
      };
      //this.reader.readAsDataURL(file);
      this.getStreamDetailsWorker.postMessage({
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

    this.dzone.on('success', (file, response) => {
      console.log("File Uploaded Succesfully: ", file, response);
    });

    this.dzone.on('error', (file, errorMessage) => {
      console.log("File Uploaded Succesfully: ", file, errorMessage);
    });

  }
}
