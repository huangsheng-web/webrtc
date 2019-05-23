<template>
  <div class="vl_map_ring">
    <video id="localVideo" autoplay="autoplay" muted></video>
    <video id="remoteVideo" autoplay="autoplay"></video>
    <video style="width: 0; height: 0;" class="vl_map_sing" src="../assets/8521.mp3" autoplay></video>
    <div class="control" style="z-index: 99;position: absolute;bottom: 10px;left: 20px;">
      <el-button type="primary">切换</el-button>
      <el-button type="primary">取消</el-button>
      <el-button type="primary">静音</el-button>
    </div>
  </div>
</template>
<script>
  import {socketio} from '@/utils/util.js'
  export default {
    props: ['myNo'],
    data() {
      return {
        myId: '',
        Pc: null
      }
    },
    created () {
      this.initPeer()
    },
    mounted () {
      this.init();
    },
    methods: {
      init () {
        this.ws = socketio.connect('http://10.116.64.108:8383');
        this.ws.emit('firstConnect', this.myNo)
        // 收到pc端的通话请求
        this.ws.on('inviteMe', (data) => {
          let r = window.confirm('收到PC端的通话请求')
          if (r) {
            this.createMedia().then(() => {
              this.ws.emit('joinRoom', {type: 1, room: data.room})
            });
            // 监听A的ICE候选信息
            this.pc.onicecandidate = event => {
              if (event.candidate) {
                this.ws.emit('sendCandidate', {room: data.room, candidate: event.candidate})
              }
            };
          } else {
            this.ws.emit('joinRoom', {type: 0, room: data.room})
          }
        })
        // 收到ICE onCandidate
        this.ws.on('onCandidate', (data) => {
          console.log(data)
          this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        })
        // 收到offer
        this.ws.on('onOffer', (data) => {
          // 创建answer
          this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp), () => {
            this.pc.createAnswer().then(offer => {
              this.ws.emit('sendAnswer', {room: data.room, offer: offer})
              return this.pc.setLocalDescription(new RTCSessionDescription(offer))
            })
          });
        })
        // 房间所有人测试
        this.ws.on('rooms', (data) => {
          console.log(data)
        })
      },
      createMedia () {
        return navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
          this.localStream = stream;
          let locVideo = document.getElementById('localVideo')
          if ('srcObject' in locVideo) {
            locVideo.srcObject = stream;
          } else {
            locVideo.src = window.URL.createObjectURL(stream)
          }
          // 添加到轨道
          stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
        })
      },
      initPeer () {
        let PeerConnection = (window.PeerConnection ||
            window.webkitPeerConnection00 ||
            window.webkitRTCPeerConnection ||
            window.mozRTCPeerConnection)
        this.pc = new PeerConnection(this.iceServer);
        // 检测到远程流
        this.pc.ontrack = event => {
          const stream = event.streams[0];
          let remVideo = document.getElementById('remoteVideo')
          if ('srcObject' in remVideo) {
            remVideo.srcObject = stream;
          } else {
            remVideo.src = window.URL.createObjectURL(stream)
          }
        }
        // 监听ICE连接状态
        this.pc.oniceconnectionstatechange = evt => {
          // console.log(evt.target.iceConnectionState)
        }
      }
    },
    watch: {}
  }
</script>
<style scoped>
  .vl_map_ring {
    width: 280px;
    height: 496px;
    background: #36404E;
    position: relative;
  }
  .vl_map_ring #remoteVideo {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
  }
  .vl_map_ring .top {
    width: 100%;
    height: 46px;
    display: flex;
  }
  .vl_map_ring .top img {
    width: 46px;
    height: 46px;
  }
  .vl_map_ring .top div h4 {

  }
</style>
