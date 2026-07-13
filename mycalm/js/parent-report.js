// MyCalm 학부모 리포트 PIN 처리 및 통계 계산 스크립트

document.addEventListener('DOMContentLoaded', () => {
  const pinDigits = document.querySelectorAll('.pin-digit');
  const pinScreen = document.getElementById('pin-screen');
  const reportScreen = document.getElementById('report-screen');
  const pinInstruction = document.getElementById('pin-instruction');
  const pinErrorText = document.getElementById('pin-error-text');

  // 통계 DOM Elements
  const statWeeklyDays = document.getElementById('stat-weekly-days');
  const statAvgBedtime = document.getElementById('stat-avg-bedtime');
  const statStreak = document.getElementById('stat-streak');

  let activeData = getActivityLog();
  const isPinSetupMode = !activeData.pin; // PIN이 없으면 설정 모드

  // 1. PIN 모드 UI 초기화
  if (isPinSetupMode) {
    pinInstruction.textContent = '최초 PIN 등록 🔑';
    pinErrorText.textContent = '학부모 리포트 잠금 해제에 사용할 4자리 PIN을 새로 설정해 주세요.';
    pinErrorText.style.color = 'var(--lavender-medium)';
  }

  // 첫 번째 비밀번호 칸에 자동 포커스
  if (pinDigits.length > 0) {
    pinDigits[0].focus();
  }

  // 2. PIN 입력 흐름 제어 (키보드 이벤트 바인딩)
  pinDigits.forEach((digitInput, index) => {
    // 키 입력을 받았을 때 다음 칸 이동 처리
    digitInput.addEventListener('input', (e) => {
      const val = digitInput.value;
      
      // 숫자가 아닌 글자 입력 시 비우기
      if (val && !/^[0-9]$/.test(val)) {
        digitInput.value = '';
        return;
      }

      if (val.length === 1) {
        // 다음 칸 활성화 및 포커스 이동
        if (index < pinDigits.length - 1) {
          pinDigits[index + 1].removeAttribute('disabled');
          pinDigits[index + 1].focus();
        } else {
          // 마지막 칸인 경우 최종 제출 검증
          submitPin();
        }
      }
    });

    // 백스페이스 감지 시 이전 칸 이동 처리
    digitInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !digitInput.value) {
        if (index > 0) {
          pinDigits[index].setAttribute('disabled', 'true');
          pinDigits[index - 1].focus();
          pinDigits[index - 1].value = '';
        }
      }
    });
  });

  // 3. PIN 검증 및 등록 처리
  function submitPin() {
    let enteredPin = '';
    pinDigits.forEach(input => {
      enteredPin += input.value;
    });

    if (enteredPin.length !== 4) return;

    if (isPinSetupMode) {
      // 3.1. 최초 PIN 등록 절차
      activeData.pin = enteredPin;
      saveActivityLog(activeData);
      alert('🔒 학부모 확인용 PIN 번호가 등록되었습니다.');
      unlockReport();
    } else {
      // 3.2. PIN 번호 일치 검증
      if (enteredPin === activeData.pin) {
        unlockReport();
      } else {
        // 일치하지 않을 때 예외처리
        pinErrorText.textContent = '❌ PIN 번호가 일치하지 않습니다. 다시 입력해주세요.';
        pinErrorText.style.color = '#ef4444';
        
        // 입력 필드 완전 초기화
        pinDigits.forEach((input, index) => {
          input.value = '';
          if (index > 0) input.setAttribute('disabled', 'true');
        });
        pinDigits[0].focus();
      }
    }
  }

  // 4. 보호 대시보드 언락 및 리포트 데이터 바인딩
  function unlockReport() {
    pinScreen.style.display = 'none';
    reportScreen.style.display = 'block';
    
    calculateAndShowStats();
  }

  // 5. 통계 정보 계산 및 화면 렌더링
  function calculateAndShowStats() {
    const today = getTodayKey();
    
    // 5.1. 최근 7일간 참여 일수 계산 (오늘 포함 최근 7일)
    const recent7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      recent7Days.push(year + '-' + month + '-' + day);
    }

    // 활동 목록에서 날짜가 최근 7일에 해당되는 고유 날짜를 수집
    const activeDatesMap = {};
    for (let j = 0; j < activeData.activities.length; j++) {
      const act = activeData.activities[j];
      if (recent7Days.indexOf(act.date) !== -1) {
        activeDatesMap[act.date] = true;
      }
    }

    const uniqueActiveDays = Object.keys(activeDatesMap).length;
    statWeeklyDays.textContent = uniqueActiveDays + '일 / 7일';

    // 5.2. 평균 수면 준비 시각 계산
    // 활동 로그 중 'routine'의 완료 시각들의 평균 계산
    const routineActivities = activeData.activities.filter(act => act.type === 'routine');
    
    if (routineActivities.length > 0) {
      let totalMinutes = 0;
      routineActivities.forEach(act => {
        const timeObj = new Date(act.timestamp);
        // 현지 타임존 기준 시각 변환
        const hours = timeObj.getHours();
        const mins = timeObj.getMinutes();
        totalMinutes += (hours * 60 + mins);
      });
      
      const avgMinutes = Math.round(totalMinutes / routineActivities.length);
      const avgHours = Math.floor(avgMinutes / 60) % 24;
      const avgMins = avgMinutes % 60;
      
      statAvgBedtime.textContent = 
        String(avgHours).padStart(2, '0') + ':' + String(avgMins).padStart(2, '0') + ' (실제 평균)';
    } else {
      // 활동 기록이 없는 경우 사용자가 목표로 설정한 알림 시간을 기본 표시
      statAvgBedtime.textContent = activeData.sleepTime + ' (목표 설정)';
    }

    // 5.3. 스트릭 정보 바인딩
    let activeStreak = 0;
    if (activeData.lastActiveDate) {
      const diff = getDateDiffInDays(activeData.lastActiveDate, today);
      if (diff === 0 || diff === 1) {
        activeStreak = activeData.streak;
      }
    }
    statStreak.textContent = activeStreak + '일 연속 참여 중';
  }
});
