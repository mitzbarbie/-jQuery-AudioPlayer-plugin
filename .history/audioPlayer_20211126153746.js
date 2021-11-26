(function ($, window, document, undefined) {
  $.fn.audioPlayerUtils = function (options) {
    var settings = $.extend({}, options);

    return this.each(function () {
      // developed an initial value of first building on page for HTML DOM init
      var htmlInit =
        '<div class="audioPlayer">\
            <a id="playPauseBtn">\
              <i class="fa fa-play playing" aria-hidden="true" style="color: #fff"></i>\
              <i class="fa fa-pause pausing" aria-hidden="true" style="display: none; color: #4050ab"></i>\
            </a>\
            <div class="startTime">00:00</div>\
            <div id="mainBar">\
              <div id="progressBar">\
                <div id="play-head"></div>\
              </div>\
            </div>\
            <div class="endTime">00:00</div>\
            <a id="volumeBtn">\
              <i class="fa fa-volume-up volume" style="color: #4050ab" aria-hidden="true" ></i>\
              <i class="fa fa-volume-off muting" aria-hidden="true" style="display: none; color: #fd4f1a; margin-right: 8px"></i>\
            </a>\
            <audio id="audioSource" class="audioSource">\
              <source src="" type="audio/mpeg" />\
            </audio>\
          </div>';

      var $this = $(this);
      $this.append(htmlInit);

      var $playPauseBtn = $this.find("#playPauseBtn"),
        $playBtn = $this.find(".playing"),
        $pauseBtn = $this.find(".pausing"),
        $startTime = $this.find(".startTime"),
        $endTime = $this.find(".endTime"),
        $mainBar = $this.find("#mainBar"),
        $progressBar = $this.find("#progressBar"),
        $playHead = $this.find("#play-head"),
        $volumeBtn = $this.find("#volumeBtn"),
        $muteBtn = $this.find(".volume"),
        $unmuteBtn = $this.find(".muting"),
        $audioSource = $this.find("#audioSource")[0];

      $audioSource.src = settings.songs[0];

      var isPlaying = false;
      var audioPlayer, onPlayHead, playerId, mainbar, playHead, timelineWidth;

      playController();
      muteController();
      headBall();

      // Play & Pause Controller / create event using by bind function
      function playController() {
        audioPlayer = $audioSource;
        audioPlayer.addEventListener("timeupdate", progressShow);
        audioPlayer.addEventListener("timeupdate", timeValue);
        $playPauseBtn.bind("click", function (event) {
          if (isPlaying) {
            $audioSource.pause();
            $playBtn.show();
            $pauseBtn.hide();
          } else {
            $audioSource.play();
            $playBtn.hide();
            $pauseBtn.show();
          }

          isPlaying = !isPlaying;
        });
      }

      // Mute & Unmute Controller / create event using by bind function
      function muteController() {
        $volumeBtn.bind("click", function (event) {
          if ($audioSource.muted) {
            $muteBtn.show();
            $unmuteBtn.hide();
          } else {
            $muteBtn.hide();
            $unmuteBtn.show();
          }

          $audioSource.muted = !$audioSource.muted;
        });
      }

      // Calculate current value of time and total value of length
      function calculateCurrentValue(currentTime) {
        var current_hour = parseInt(currentTime / 3600) % 24,
          current_minute = parseInt(currentTime / 60) % 60,
          current_seconds_long = currentTime % 60,
          current_seconds = current_seconds_long.toFixed(),
          current_time =
            (current_minute < 10 ? "0" + current_minute : current_minute) +
            ":" +
            (current_seconds < 10 ? "0" + current_seconds : current_seconds);

        return current_time;
      }

      function calculateTotalValue(length) {
        var minutes = parseInt(Math.floor(length / 60));
        if (isNaN(minutes)) {
          minutes = "00";
        }
        var seconds_int = parseInt(length - minutes * 60);
        if (isNaN(seconds_int)) {
          seconds_int = "00";
        }
        if (seconds_int < 10) {
          seconds_int = "0" + seconds_int;
        }
        var seconds_str = seconds_int.toString();
        var seconds = seconds_str.substr(0, 2);
        var time = minutes + ":" + seconds;

        return time;
      }

      // Calculate the audio live time value (start & end-time)
      function timeValue() {
        var length = audioPlayer.duration;
        var current_time = audioPlayer.currentTime;
        var currentTime = calculateCurrentValue(current_time);
        $startTime.html(currentTime);

        var totalLength = calculateTotalValue(length);
        $endTime.html(totalLength);
      }

      // Calculate the distance of progress-bar duration
      function progressShow() {
        var progressBar = $progressBar[0];
        var width = $mainBar.width();
        var size = width * (audioPlayer.currentTime / audioPlayer.duration);
        progressBar.style.width = size + "px";

        var playhead = $playHead[0];
        playhead.style.marginLeft =
          width * (audioPlayer.currentTime / audioPlayer.duration) + "px";
      }

      // Progress-bar / timeline (loading) & playhead
      function headBall() {
        onPlayHead = null;
        playerId = null;
        mainbar = $mainBar[0];
        playHead = $playHead[0];
        timelineWidth = mainbar.clientWidth - playHead.clientHeight;

        mainbar.addEventListener("click", seek);
        playHead.addEventListener("mousedown", drag);
        document.addEventListener("mouseup", mouseUp);
      }

      function seek(event) {
        var player = $audioSource;
        player.currentTime =
          player.duration * clickPercent(event, mainbar, timelineWidth);
      }

      function clickPercent(event, mainbar, timelineWidth) {
        return (window.scrollX - getPosition(mainbar)) / timelineWidth;
      }

      function getPosition(el) {
        return el.getBoundingClientRect().left;
      }

      // Drag and drag options
      function drag(e) {
        var player = document.getElementById(playerId);
        audioPlayer.addEventListener("timeupdate", progressShow);
        audioPlayer.addEventListener("timeupdate", timeValue);
        onPlayHead = $(this).attr("id");
        playerId = $(this).find("audio").attr("class", "id");
        window.addEventListener("mousemove", dragOpts);
        player.addEventListener("timeupdate", timeUpdate);
      }

      function dragOpts(e) {
        var progressBar = $progressBar[0];
        var newMargLeft = e.clientX - getPosition(mainbar);

        if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
          playHead.style.marginLeft = newMargLeft + "px";
          progressBar.style.width = newMargLeft + "px";
        }
        if (newMargLeft < 0) {
          playHead.style.marginLeft = "0px";
          progressBar.style.width = "0px";
        }
        if (newMargLeft > timelineWidth) {
          playHead.style.marginLeft = timelineWidth + "px";
          progressBar.style.width = timelineWidth + "px";
        }
      }

      // Click (mouse-up & down) on progress-bar
      function mouseUp(e) {
        if (onPlayHead != null) {
          var player = document.getElementById(playerId);
          window.removeEventListener("mousemove", dragOpts);
          player.currentTime =
            player.duration * clickPercent(e, mainbar, timelineWidth);
          audioPlayer.addEventListener("timeupdate", progressShow);
          audioPlayer.addEventListener("timeupdate", timeValue);

          player.addEventListener("timeupdate", timeUpdate);
        }
        onPlayHead = null;
      }

      // Time update after/before drag or click event
      function timeUpdate() {
        var audioSource = document.getElementById(onPlayHead);
        var player = document.getElementById(playerId);
        var playPercent =
          timelineWidth * (player.currentTime / player.duration);
        audioSource.style.marginLeft = playPercent + "px";

        if (player.currentTime == player.duration) {
          player.pause();
        }
      }
    });
  };
})(jQuery, window, document);
