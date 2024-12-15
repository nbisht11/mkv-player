import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import Dropzone, { DropzoneFile } from 'dropzone';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { StreamInfoService } from '../../services/stream-info.service';
import { StreamExtractionService } from '../../services/stream-extraction.service';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements AfterViewInit {

  constructor(
    private streamInfoService: StreamInfoService,
    private streamExtractionService: StreamExtractionService,
    private cdref: ChangeDetectorRef
  ) { }

  @ViewChild('dropzoneWrapper', { static: false }) dropzoneWrapper!: ElementRef;
  @ViewChild('videoJsWrapper', { static: false }) videoJsWrapper!: ElementRef;
  showPlayer = false;
  dzone!: Dropzone;
  uploadedFile!: DropzoneFile;
  audioStreams: any = [];
  defaultVideoStreamIndex!: number;
  defaultAudioStreamIndex!: number;
  player!: Player | any;
  currentTime!: number;
  audioTracksAdded = false;
  loadingSpinnerFlag = false;
  loadingSpinnerMessage = "Hello World";

  ngAfterViewInit(): void {
    this.initaliseDropzone();
  }

  initaliseDropzone() {
    this.dzone = new Dropzone(this.dropzoneWrapper.nativeElement, {
      url: 'null',
      autoProcessQueue: false,
      maxFiles: 1,
      maxFilesize: 2600,
      acceptedFiles: '.mp4, .mkv, .mov, .3gp'
    });

    this.dzone.on('addedfile', (file) => {
      file.previewElement.innerHTML = "";
      this.uploadedFile = file;
      this.showLoadingSpinner(`Loading file: ${file.name}`);
      this.streamInfoService.getStreamInfo(file).then((parsed: any) => {
        this.processStreamInfo(parsed);
      })
    });
  }

  processStreamInfo(parsed: any) {
    let videoStreams = parsed.streams.filter((stream: any) => {
      return (stream.codec_type == "video");
    });
    this.audioStreams = parsed.streams.filter((stream: any) => {
      return (stream.codec_type == "audio");
    });
    this.defaultVideoStreamIndex = videoStreams.findIndex((stream: any) => {
      return stream?.disposition?.default == 1;
    });
    this.defaultAudioStreamIndex = this.audioStreams.findIndex((stream: any) => {
      return stream?.disposition?.default == 1;
    });
    this.getVideoAndInitalisePlayer();
  }

  getVideoAndInitalisePlayer(audioStreamIndex?: number) {
    this.showLoadingSpinner(audioStreamIndex != undefined ? 'Processing change' : 'Processing streams');
    const argv = [
      '-i', '/data/' + this.uploadedFile.name,
      '-codec', 'copy',
      '-map', `0:v:${this.defaultVideoStreamIndex}`,
      "videoPlayback.mp4"
    ]
    audioStreamIndex = (audioStreamIndex && typeof audioStreamIndex === 'number') ? audioStreamIndex : this.defaultAudioStreamIndex;
    if (audioStreamIndex > -1) {
      let audioArgv = ['-map', `0:a:${audioStreamIndex}`]
      let index = 2;
      for (let arg of audioArgv) {
        argv.splice(index, 0, arg);
        index++;
      }
    }
    this.streamExtractionService.getExtractedStreamForVideoPlayback(this.uploadedFile, argv).then((data: any) => {
      const resultFile = data.files[0];
      this.showPlayer = true;
      this.cdref.detectChanges();
      this.initialisePlayer(resultFile);
    });
  }

  initialisePlayer(data: any) {
    // instantiate Video.js
    let videoJsOptions = {
      fluid: true,
      aspectRatio: "16:9",
      autoplay: true,
      controls: true,
      playbackRates: [0.5, 1, 1.5, 2]
    };
    this.player = videojs(
      this.videoJsWrapper.nativeElement,
      videoJsOptions,
      function onPlayerReady() {
        this.volume(0.5);
        this.trigger('volumechange');
      }
    );
    const video = new Blob([data.data.buffer]);
    this.player.src({
      src: URL.createObjectURL(video),
      type: "video/mp4"
    });
    this.addAudioTracks();
    this.hideLoadingSpinner();
    this.player.load();
    if (this.currentTime) {
      this.player.currentTime(this.currentTime);
    }
    this.player.play();
  }

  addAudioTracks() {
    if (this.audioStreams.length > 1 && !this.audioTracksAdded) {
      for (let [index, stream] of this.audioStreams.entries()) {
        let track = new videojs.AudioTrack({
          id: index,
          label: `Track - ${index + 1} (${stream.tags?.language ?? ''})`,
          language: stream.tags?.language ?? '',
          enabled: stream?.disposition?.default == 1,
        });
        this.player.audioTracks().addTrack(track);
      }
      this.audioTracksAdded = true;
      let audioTrackList = this.player.audioTracks();
      audioTrackList.addEventListener('change', this.onAudioTrackChange.bind(this));
    }
  }

  onAudioTrackChange() {
    this.player.pause();
    this.currentTime = this.player.currentTime();
    let audioTrackList = this.player.audioTracks();
    for (let i = 0; i < audioTrackList.length; i++) {
      let track = audioTrackList[i];
      if (track.enabled) {
        this.getVideoAndInitalisePlayer(i);
      }
    }
  }

  showLoadingSpinner(message: string) {
    this.loadingSpinnerMessage = message;
    this.loadingSpinnerFlag = true;
  }

  hideLoadingSpinner() {
    this.loadingSpinnerFlag = false;
    this.loadingSpinnerMessage = '';
  }

}
