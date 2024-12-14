import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { TestServiceService } from '../services/test-service.service';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, OnDestroy, OnChanges {
  
  @ViewChild('target', { static: true }) target!:ElementRef;
  // see options: https://github.com/videojs/video.js/blob/maintutorial-options.html
  @Input() data:any;
  
  options!:any;
  //{fluid: boolean,aspectRatio: string,autoplay: boolean,sources: {src: string,type: string,} [],};
  player: Player|any;
  audioTracks:any = [];
  currentTime:any = null;

  constructor(
    private elementRef: ElementRef,
    private testService: TestServiceService
  ) { }

  ngOnInit() {
    //this.initialisePlayer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.options) {
      this.initialisePlayer();
    }
    this.preProcessData(changes['data'].currentValue);
  }

  initialisePlayer(){
    // instantiate Video.js
    this.options = {
      fluid: true,
      aspectRatio: "16:9",
      autoplay: true,
      muted: true,
      controls: true,
      playbackRates: [0.5, 1, 1.5, 2]
      //src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }
    //this.preProcessData(this.data);
    //console.log("Options -> ", this.options);
    this.player = videojs(
      this.target.nativeElement,
      this.options, 
      function onPlayerReady() {
        console.log('onPlayerReady');
      }
    );
    this.addAudioTracks();
  }

  preProcessData(data:any){
    //add video source
    const video = new Blob([data.video.contents.buffer]);
    this.player.src({
      src: URL.createObjectURL(video),
      type: "video/mp4"
    })
    this.player.load();
    if(this.currentTime) {
      this.player.currentTime(this.currentTime);
    }
    this.player.play();
  }

  addAudioTracks(){
    if(this.data.audioStreams.length > 1) {
      for(let [index, stream] of this.data.audioStreams.entries()) {
        let track = new videojs.AudioTrack({
          id: index,
          label: `Track - ${index + 1} (${stream.tags?.language ?? ''})`,
          language: stream.tags?.language ?? '',
          enabled: stream?.disposition?.default == 1,
        });
        this.player.audioTracks().addTrack(track);
      }
      let audioTrackList = this.player.audioTracks();
      audioTrackList.addEventListener('change', this.onAudioTrackChange.bind(this))
  }
}

  onAudioTrackChange(){
    // Log the currently enabled AudioTrack label.
    this.player.pause();
    this.currentTime = this.player.currentTime();
    let audioTrackList = this.player.audioTracks();
    for (let i = 0; i < audioTrackList.length; i++) {
      let track = audioTrackList[i];
      if (track.enabled) {
        this.testService.getDefaultVideoAndAllAudioStreams(track.id);
      }
    }
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }
}