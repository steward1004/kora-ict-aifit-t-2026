// MyCalm Sleep Stories 재생 및 제어 스크립트

document.addEventListener('DOMContentLoaded', () => {
  const storyList = [
    {
      id: 'story01',
      title: '평온한 숲속의 밤하늘 🌌',
      file: 'assets/audio/story01.wav',
      durationText: '0:05 (데모)'
    },
    {
      id: 'story02',
      title: '따뜻한 모닥불과 빗소리 🔥🌧️',
      file: 'assets/audio/story02.wav',
      durationText: '0:05 (데모)'
    },
    {
      id: 'story03',
      title: '파도 소리와 해변의 휴식 🌊',
      file: 'assets/audio/story03.wav',
      durationText: '0:05 (데모)'
    }
  ];

  const container = document.getElementById('stories-container');
  let activeAudio = null;
  let activeCard = null;
  let activeInterval = null;

  // 초 단위를 MM:SS 형식으로 변환하는 유틸리티
  function formatTime(secs) {
    if (isNaN(secs)) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  // 기존에 가동 중인 타임 인터벌 정지
  function clearActiveInterval() {
    if (activeInterval) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
  }

  // 동적으로 카드 생성 및 이벤트 바인딩
  storyList.forEach(story => {
    const card = document.createElement('div');
    card.className = 'glass-card story-card';
    card.dataset.id = story.id;

    card.innerHTML = `
      <div class="story-info">
        <span class="story-title">${story.title}</span>
        <span class="story-duration" id="duration-${story.id}">${story.durationText}</span>
      </div>
      <div class="story-controls">
        <button class="btn-play-story" id="play-btn-${story.id}" title="재생">
          <!-- Play Icon -->
          <svg viewBox="0 0 24 24" id="icon-play-${story.id}">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <!-- Pause Icon (hidden by default) -->
          <svg viewBox="0 0 24 24" id="icon-pause-${story.id}" style="display: none;">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <div class="playback-progress-container">
          <div class="progress-track" id="track-${story.id}">
            <div class="progress-fill" id="fill-${story.id}"></div>
          </div>
          <span class="time-tooltip" id="time-${story.id}">00:00</span>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Audio 객체 초기화 (각 카드별로 생성하여 개별 오프라인 로드 지연 방지)
    const audio = new Audio(story.file);
    const playBtn = document.getElementById(`play-btn-${story.id}`);
    const iconPlay = document.getElementById(`icon-play-${story.id}`);
    const iconPause = document.getElementById(`icon-pause-${story.id}`);
    const progressTrack = document.getElementById(`track-${story.id}`);
    const progressFill = document.getElementById(`fill-${story.id}`);
    const timeDisplay = document.getElementById(`time-${story.id}`);

    // 재생 완료 (Ended) 이벤트 바인딩 - 중요 조건: 끝까지 재생 완료 시에만 기록
    audio.addEventListener('ended', () => {
      clearActiveInterval();
      
      // UI 리셋
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      card.classList.remove('active');
      progressFill.style.width = '0%';
      timeDisplay.textContent = '00:00';
      
      // 스토리지에 완독 로깅
      logActivity('story', { storyId: story.id, title: story.title });
      
      alert(`🎵 [${story.title}] 이야기를 끝까지 감상하셨습니다. 평온한 밤 보내세요!`);
    });

    // 트랙 클릭으로 원하는 부분으로 이동 (Seeking)
    progressTrack.addEventListener('click', (e) => {
      if (audio.duration) {
        const rect = progressTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPercent = clickX / width;
        audio.currentTime = clickPercent * audio.duration;
        progressFill.style.width = (clickPercent * 100) + '%';
      }
    });

    // 재생 버튼 이벤트
    playBtn.addEventListener('click', () => {
      // 1. 현재 클릭한 오디오가 이미 재생 중인 경우 -> 일시정지 처리
      if (activeAudio === audio && !audio.paused) {
        audio.pause();
        clearActiveInterval();
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        card.classList.remove('active');
        return;
      }

      // 2. 다른 오디오가 재생 중이었다면 정지시키고 리셋
      if (activeAudio && activeAudio !== audio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        clearActiveInterval();
        
        // 이전 카드 UI 리셋
        if (activeCard) {
          activeCard.classList.remove('active');
          const prevId = activeCard.dataset.id;
          document.getElementById(`icon-play-${prevId}`).style.display = 'block';
          document.getElementById(`icon-pause-${prevId}`).style.display = 'none';
          document.getElementById(`fill-${prevId}`).style.width = '0%';
          document.getElementById(`time-${prevId}`).textContent = '00:00';
        }
      }

      // 3. 새로운 오디오 재생
      activeAudio = audio;
      activeCard = card;
      card.classList.add('active');
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';

      audio.play().catch(err => {
        console.error('Audio play blocked or failed:', err);
        alert('브라우저 정책으로 인해 사운드 재생을 위해서는 사용자의 터치/클릭이 필요합니다. 다시 한번 눌러주세요.');
        
        // 에러 시 UI 환원
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        card.classList.remove('active');
      });

      // 진행 상황을 표시하는 인터벌 타이머 기동 (100ms 단위로 정밀 추적)
      activeInterval = setInterval(() => {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          progressFill.style.width = percent + '%';
          timeDisplay.textContent = formatTime(audio.currentTime);
          
          // 오디오 로딩 완료 시 총 재생시간 동적 표기 보완
          const durationEl = document.getElementById(`duration-${story.id}`);
          if (durationEl && durationEl.textContent.indexOf('데모') !== -1) {
            durationEl.textContent = formatTime(audio.duration);
          }
        }
      }, 100);
    });
  });
});
