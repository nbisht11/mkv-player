import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, OnDestroy {
  
  @ViewChild('target', { static: true }) target!:ElementRef;
  // see options: https://github.com/videojs/video.js/blob/maintutorial-options.html
  
  @Input() options!: {fluid: boolean,aspectRatio: string,autoplay: boolean,sources: {src: string,type: string,} [],};
  player!: Player;

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit() {
    // instantiate Video.js
    console.log("Options -> ", this.options);
    this.player = videojs(
      this.target.nativeElement,
      this.options, 
      function onPlayerReady() {
        console.log('onPlayerReady');
      }
    );
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }
}