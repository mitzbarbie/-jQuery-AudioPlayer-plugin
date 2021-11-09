(function ($) {
  $.fn.audioPlayerUtils = function () {
    var base = $(this);
    var isPlaying = false;
    var audioPlayer, onPlayHead, playerId, timeline, playHead, timelineWidth;

    base.init = function () {
      base.audioContainer();
      base.playController();
      base.muteController();
      base.headBall();
    };

    base.audioContainer = function () {
      base.divAudioPlayer = $("<div></div>").appendTo("body");
      base.divAudioPlayer.prop("id", "audioPlayer");

      base.aPlayBtn = $("<a></a>").appendTo(base.divAudioPlayer);
      base.aPlayBtn.prop("id", "playBtn");

      base.iPlay = $("<i></i>").appendTo(base.aPlayBtn);
      base.iPlay.prop("class", "fa fa-play playing");

      base.iPause = $("<i></i>").appendTo(base.aPlayBtn);
      base.iPause.prop("class", "fa fa-pause pausing");

      base.divStartTime = $("<div></div>").appendTo(base.divAudioPlayer);
      base.divStartTime.prop("id", "startTime");
      base.divStartTime.html("00:00");

      base.divMainBar = $("<div></div>").appendTo(base.divAudioPlayer);
      base.divMainBar.prop("id", "mainBar");

      base.divProgressBar__timeline = $("<div></div>").appendTo(
        base.divMainBar
      );
      base.divProgressBar__timeline.prop("id", "progressBar__timeline");
      $("#progressBar__timeline").append("<div id='play-head'></div>");

      base.divEndTime = $("<div></div>").appendTo(base.divAudioPlayer);
      base.divEndTime.prop("class", "endTime");
      base.divEndTime.html("00:00");

      base.aVolumeBtn = $("<a></a>").appendTo(base.divAudioPlayer);
      base.aVolumeBtn.prop("id", "volumeBtn");

      base.iMute = $("<i></i>").appendTo(base.aVolumeBtn);
      base.iMute.prop("class", "fa fa-volume-up volume");

      base.iUnmute = $("<i></i>").appendTo(base.aVolumeBtn);
      base.iUnmute.prop("class", "fa fa-volume-off muting");
    };

    base.playController = function () {
      audioPlayer = document.getElementById("audioSource");
      audioPlayer.addEventListener("timeupdate", calculateTime);
      $("#playBtn").bind("click", function (event) {
        if (isPlaying) {
          $(".playing").show();
          $("#audioSource")[0].pause();
          $(".pausing").hide();
        } else {
          $("#aUdioSource")[0].play();
          $(".playing").hide();
          $(".pausing").show();
        }

        isPlaying = !isPlaying;
      });
    };

    base.muteController = function () {
      $("#volumeBtn").bind("click", function (event) {
        if ($("#audioSource")[0].muted) {
          $(".volume").show();
          $(".muting").hide();
        } else {
          $(".volume").hide();
          $(".muting").show();
        }

        $("#audioSource")[0].muted = !$("#audioSource")[0].muted;
      });
    };

    base.calculateTime = function () {
      var width = $("#progressBar__timeline").width();
      var length = audioPlayer.duration;
      var current_time = audioPlayer.currentTime;

      var totalLength = calculateTotalValue(length);
      $(".endTime").html(totalLength);

      var currentTime = calculateCurrentValue(current_time);
      $(".startTime").html(currentTime);

      var progressbar = document.getElementById("play-head");
      progressbar.style.marginLeft =
        width * (audioPlayer.currentTime / audioPlayer.duration) + "px";
    };

    base.calculateTotalValue = function (length) {
      var minutes = Math.floor(length / 60);
      var seconds_int = length - minutes * 60;
      if (seconds_int < 10) {
        seconds_int = "0" + seconds_int;
      }
      var seconds_str = seconds_int.toString();
      var seconds = seconds_str.substr(0, 2);
      var time = minutes + ":" + seconds;

      return time;
    };

    base.calculateCurrentValue = function (currentTime) {
      var current_hour = parseInt(currentTime / 3600) % 24,
        current_minute = parseInt(currentTime / 60) % 60,
        current_seconds_long = currentTime % 60,
        current_seconds = current_seconds_long.toFixed(),
        current_time =
          (current_minute < 10 ? "0" + current_minute : current_minute) +
          ":" +
          (current_seconds < 10 ? "0" + current_seconds : current_seconds);

      return current_time;
    };

    base.headBall = function () {
      onPlayHead = null;
      playerId = null;
      timeline = document.getElementById("progressBar__timelne");
      playHead = document.getElementById("play-head");
      timelineWidth = timeline.offsetWidth - playHead.offsetWidth;

      timeline.addEventListener("click", seek);
      playHead.addEventListener("mousedown", drag);
      document.addEventListener("mouseup", mouseUp);
    };

    base.seek = function (event) {
      var player = document.getElementById("audioSource");
      player.currentTime =
        player.duration * clickPercent(event, timeline, timelineWidth);
    };

    base.clickPercent = function (event, timeline, timelineWidth) {
      return (event.clientX - getPosition(timeline)) / timelineWidth;
    };

    base.getPosition = function (el) {
      return el.getBoundingClientRect().left;
    };

    base.drag = function (e) {
      audioPlayer.removeEventListener("timeupdate", calculateTime);
      onPlayHead = $(this).attr("id");
      playerId = $(this).find("audio").attr("id");
      var player = document.getElementById(playerId);
      window.addEventListener("mousemover", dragMovement);
      player.removeEventListener("timeupdate", timeUpdate);
    };

    base.dragMovement = function (e) {
      var player = document.getElementById(onPlayHead);
      var newMargLeft = e.clientX - getPosition(timeline);

      if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playHead.style.marginLeft = newMargLeft + "px";
      }
      if (newMargLeft < 0) {
        playHead.style.marginLeft = "0px";
      }
      if (newMargLeft > timelineWidth) {
        playHead.style.marginLeft = timelineWidth + "px";
      }
    };

    base.mouseUp = function (e) {
      if (onPlayHead != null) {
        var player = document.getElementById(playerId);
        window.removeEventListener("mousemove", dragFunc);
        player.currentTime =
          player.dration * clickPercent(e, timeline, timelineWidth);
        audioPlayer.addEventListener("timeupdate", calculateTime);
        player.addEventListener("timeupdate", timeUpdate);
      }

      onPlayHead = null;
    };

    base.timUpdate = function () {
      var audioSource = document.getElementById(onPlayHead);
      var player = document.getElementById(playerId);
      var playPercent = timelineWidth * (player.currentTime / player.duration);
      audioSource.style.marginLeft = playPercent + "px";

      if (player.currentTime == player.duration) {
        player.pause();
      }
    };

    base.init();
  };
})(jQuery);

//$("body").pluginName();
