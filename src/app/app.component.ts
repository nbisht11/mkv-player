import { Component, OnInit } from '@angular/core';
import { PlayerComponent } from './player/player.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { TestServiceService } from './services/test-service.service';

@Component({
  selector: 'app-root',
  imports: [PlayerComponent, FileUploadComponent],
  providers: [TestServiceService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private testService:TestServiceService){}
  title = 'media-player';
  playerOptions:any = {
    fluid: true,
    aspectRatio: "16:9",
    autoplay: true,
    muted: false,
    sources:[
      {
        src: "assets/MP4.mp4",
        type: "video/mp4"
      }
    ],
    playbackRates: [0.5, 1, 1.5, 2]
    //src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }
  playerData:any ={};
  showPlayer = false;
  ngOnInit(): void {
    console.log("App Initialised")
      this.testService.outputObservable.subscribe((data:any)=> {
        if(data){
          console.log("Received data in parent -> ", data);
          this.playerData = data;
          this.showPlayer = true;
        // const video = new Blob([data[0].data.buffer]);
        // this.playerOptions.sources[0].src = URL.createObjectURL(video);
        // setTimeout(()=> {
        // },2000);
        } 
      }
    )
  }

  getDataFromFile(data:any){
    console.log("Received data in parent -> ", data);
    this.playerData = data;
    // const video = new Blob([data[0].data.buffer]);
    // this.playerOptions.sources[0].src = URL.createObjectURL(video);
    this.showPlayer = true;
  }
}
