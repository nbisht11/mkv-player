import { Component } from '@angular/core';
import { PlayerComponent } from './player/player.component';

@Component({
  selector: 'app-root',
  imports: [PlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
}
