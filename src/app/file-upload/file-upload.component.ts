import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Dropzone from 'dropzone';

@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements AfterViewInit {
  @ViewChild('dropzoneWrapper') dropzoneWrapper!:ElementRef;
  dzone!:Dropzone;
  
  ngAfterViewInit(): void {
   this.initaliseDropzone();
  }

  initaliseDropzone() {
    this.dzone = new Dropzone(this.dropzoneWrapper.nativeElement, {
      url: 'null',
      autoProcessQueue: false,
      maxFilesize: 2600 ,
      acceptedFiles: '.mp4, .mkv, .mov, .3gp'
    });

    this.dzone.on('addedfile', (file) => {
      console.log('File added: ', file);
    })

    this.dzone.on('success', (file,response) => {
      console.log("File Uploaded Succesfully: ", file, response);
    });

    this.dzone.on('error', (file,errorMessage) => {
      console.log("File Uploaded Succesfully: ", file, errorMessage);
    });


  }
}
