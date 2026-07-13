// MyCalm 4-7-8 호흡 세션 제어 스크립트

document.addEventListener('DOMContentLoaded', () => {
  let isRunning = false;
  let sessionTimeRemaining = 300; // 5분 = 300초
  let cycleTimeRemaining = 0; // 19초 사이클 내 진행 시간
  let timerInterval = null;
  let breathCycleInterval = null;

  // DOM Elements
  const btnToggle = document.getElementById('btn-toggle');
  const timerDisplay = document.getElementById('timer-display');
  const guideText = document.getElementById('guide-text');
  const breathCircle = document.getElementById('breath-circle');
  const innerLabel = document.getElementById('inner-label');
  const circleGlow = document.getElementById('circle-glow');

  // 타이머 텍스트 갱신 함수 (MM:SS)
  function updateTimerDisplay() {
    const minutes = Math.floor(sessionTimeRemaining / 60);
    const seconds = sessionTimeRemaining % 60;
    timerDisplay.textContent = 
      String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  // 호흡 4-7-8 사이클 제어 함수 (1초마다 호출)
  function handleBreathCycle() {
    cycleTimeRemaining++;
    
    // 19초 사이클 리셋
    if (cycleTimeRemaining > 19) {
      cycleTimeRemaining = 1;
    }

    if (cycleTimeRemaining <= 4) {
      // 1 ~ 4초: 들숨 (Inhale)
      breathCircle.className = 'breathing-circle inhale';
      innerLabel.textContent = '들숨';
      guideText.textContent = '가슴 깊이 숨을 마십니다 (4초)';
      circleGlow.style.transform = 'scale(1.4)';
    } else if (cycleTimeRemaining <= 11) {
      // 5 ~ 11초 (7초간): 멈춤 (Hold)
      breathCircle.className = 'breathing-circle hold';
      innerLabel.textContent = '멈춤';
      guideText.textContent = '숨을 멈추고 온몸의 긴장을 풉니다 (7초)';
      circleGlow.style.transform = 'scale(1.7)';
    } else {
      // 12 ~ 19초 (8초간): 날숨 (Exhale)
      breathCircle.className = 'breathing-circle exhale';
      innerLabel.textContent = '날숨';
      guideText.textContent = '입으로 숲 소리를 내며 길게 내쉽니다 (8초)';
      circleGlow.style.transform = 'scale(1.0)';
    }
  }

  // 호흡 세션 시작
  function startSession() {
    isRunning = true;
    btnToggle.textContent = '세션 중단';
    btnToggle.classList.add('running');
    
    cycleTimeRemaining = 0;
    handleBreathCycle(); // 즉시 시작

    // 1. 전체 카운트다운 타이머 (1초 주기)
    timerInterval = setInterval(() => {
      if (sessionTimeRemaining > 0) {
        sessionTimeRemaining--;
        updateTimerDisplay();
      } else {
        completeSession();
      }
    }, 1000);

    // 2. 호흡 4-7-8 사이클 타이머 (1초 주기)
    breathCycleInterval = setInterval(handleBreathCycle, 1000);
  }

  // 호흡 세션 중단 (리셋)
  function stopSession() {
    isRunning = false;
    btnToggle.textContent = '세션 시작';
    btnToggle.classList.remove('running');
    
    // 타이머 클리어
    if (timerInterval) clearInterval(timerInterval);
    if (breathCycleInterval) clearInterval(breathCycleInterval);
    
    // UI 초기화
    sessionTimeRemaining = 300;
    updateTimerDisplay();
    
    breathCircle.className = 'breathing-circle';
    innerLabel.textContent = '대기 중';
    guideText.textContent = '시작 버튼을 눌러 호흡을 시작하세요.';
    circleGlow.style.transform = 'scale(1)';
  }

  // 호흡 세션 완료
  function completeSession() {
    stopSession();
    
    // 로컬 스토리지에 활동 기록 및 스트릭 갱신
    logActivity('breathing', { durationSeconds: 300 });
    
    alert('🎉 5분 동안의 호흡 세션을 성공적으로 완료했습니다! 마음이 편안해지셨기를 바랍니다.');
    window.location.href = 'index.html'; // 홈으로 이동
  }

  // 이벤트 바인딩
  btnToggle.addEventListener('click', () => {
    if (isRunning) {
      if (confirm('호흡 세션 진행 중입니다. 정말 중단하시겠습니까? (완료 기록이 저장되지 않습니다)')) {
        stopSession();
      }
    } else {
      startSession();
    }
  });

  // 초기 디스플레이 설정
  updateTimerDisplay();
});
