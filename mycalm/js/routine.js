// MyCalm 취침 루틴 및 로컬 알림 제어 스크립트

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sleepTimeInput = document.getElementById('sleep-time-input');
  const btnSaveSleepTime = document.getElementById('btn-save-sleep-time');
  const btnRequestNotification = document.getElementById('btn-request-notification');
  const routineStreakTxt = document.getElementById('routine-streak-txt');
  const routineAddForm = document.getElementById('routine-add-form');
  const routineInput = document.getElementById('routine-input');
  const routineListContainer = document.getElementById('routine-list-container');

  let activeData = getActivityLog();

  // -------------------------------------
  // 1. 초기 날짜 변경 판단 및 루틴 리셋
  // -------------------------------------
  function checkDateAndResetRoutines() {
    const today = getTodayKey();
    const lastActive = activeData.lastActiveDate;
    
    // 마지막 활동 날짜가 오늘이 아닌 다른 날짜일 경우
    if (lastActive && lastActive !== today) {
      // 모든 루틴 항목의 완료 처리를 해제
      for (let i = 0; i < activeData.routines.length; i++) {
        activeData.routines[i].completed = false;
      }
      // 오늘로 마지막 활동 날짜 갱신 (스트릭은 활동 완료 시 갱신하되, 접속만으로도 날짜 동기화)
      activeData.lastActiveDate = today;
      saveActivityLog(activeData);
    }
  }

  // -------------------------------------
  // 2. 알림 권한 제어
  // -------------------------------------
  function updateNotificationButtonUI() {
    if (!('Notification' in window)) {
      btnRequestNotification.textContent = '알림 지원 안됨';
      btnRequestNotification.disabled = true;
      return;
    }
    
    if (Notification.permission === 'granted') {
      btnRequestNotification.textContent = '알림 활성화됨 ✓';
      btnRequestNotification.style.background = 'rgba(144, 202, 249, 0.2)';
      btnRequestNotification.disabled = true;
    } else if (Notification.permission === 'denied') {
      btnRequestNotification.textContent = '알림 권한 거부됨';
      btnRequestNotification.style.background = 'rgba(239, 68, 68, 0.2)';
    } else {
      btnRequestNotification.textContent = '알림 권한 허용';
    }
  }

  function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    
    Notification.requestPermission().then(permission => {
      updateNotificationButtonUI();
      if (permission === 'granted') {
        alert('알림 권한이 허용되었습니다! 설정하신 취침 시간에 리마인드 팝업이 발송됩니다.');
        // 테스트 알림 발송
        new Notification('MyCalm 알림 시스템', {
          body: '정상적으로 알림 권한이 등록되었습니다. 편안한 밤 되세요.',
          icon: 'assets/icons/favicon.ico' // 필요 시 사용
        });
      }
    });
  }

  // -------------------------------------
  // 3. 알림 타이머 및 발송 루프
  // -------------------------------------
  function sendSleepNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    new Notification('MyCalm 수면 리마인더 🌙', {
      body: '설정한 취침 시간이 되었습니다. 스마트폰을 멀리하고 따뜻한 휴식을 준비해 보세요.',
      requireInteraction: true // 사용자가 닫기 전까지 팝업 유지 권장
    });
  }

  // 10초마다 취침 알림 대조하는 감시 루프
  function startAlarmWatcher() {
    setInterval(() => {
      const data = getActivityLog();
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = currentHour + ':' + currentMinute;
      
      const today = getTodayKey();
      
      // 설정한 시간과 일치하고, 오늘 알림을 아직 안 보냈다면 발송
      if (currentTimeStr === data.sleepTime && data.lastNotificationDate !== today) {
        sendSleepNotification();
        // 당일 알림 발송 완료 플래그 저장
        data.lastNotificationDate = today;
        saveActivityLog(data);
      }
    }, 10000);
  }

  // -------------------------------------
  // 4. 루틴 렌더링 및 편집 로직
  // -------------------------------------
  function renderRoutines() {
    routineListContainer.innerHTML = '';
    
    // 스트릭 정보 UI 연동
    const today = getTodayKey();
    let activeStreak = 0;
    if (activeData.lastActiveDate) {
      const diff = getDateDiffInDays(activeData.lastActiveDate, today);
      if (diff === 0 || diff === 1) {
        activeStreak = activeData.streak;
      }
    }
    routineStreakTxt.textContent = '연속 ' + activeStreak + '일';

    activeData.routines.forEach(item => {
      const li = document.createElement('li');
      li.className = 'routine-item' + (item.completed ? ' completed' : '');
      li.dataset.id = item.id;

      li.innerHTML = `
        <div class="routine-item-left">
          <label class="checkbox-wrapper">
            <input type="checkbox" class="checkbox-hidden" ${item.completed ? 'checked' : ''}>
            <span class="checkbox-custom"></span>
          </label>
          <span class="routine-text">${escapeHtml(item.text)}</span>
        </div>
        <button class="btn-delete-routine" title="삭제">
          <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // 완료 체크박스 이벤트 바인딩
      const checkbox = li.querySelector('.checkbox-hidden');
      checkbox.addEventListener('change', () => toggleRoutine(item.id));

      // 삭제 버튼 이벤트 바인딩
      const deleteBtn = li.querySelector('.btn-delete-routine');
      deleteBtn.addEventListener('click', () => deleteRoutine(item.id));

      routineListContainer.appendChild(li);
    });
  }

  function addRoutine(text) {
    if (!text.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    };

    activeData.routines.push(newItem);
    saveActivityLog(activeData);
    renderRoutines();
  }

  function toggleRoutine(id) {
    let allCompletedBefore = activeData.routines.every(r => r.completed);
    
    activeData.routines = activeData.routines.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    saveActivityLog(activeData);
    renderRoutines();

    // 만약 이전에는 모두 완료가 아니었는데 이번 터치로 모든 루틴이 완료되었을 경우,
    // 로컬 활동 로그에 기록하고 스트릭을 연동 처리한다.
    const allCompletedNow = activeData.routines.every(r => r.completed);
    if (!allCompletedBefore && allCompletedNow && activeData.routines.length > 0) {
      logActivity('routine', { completedCount: activeData.routines.length });
      alert('🎉 오늘의 모든 수면 루틴을 완료했습니다! 편안한 잠자리에 들 준비가 되셨네요.');
      renderRoutines(); // 스트릭 현황 최신화 반영
    }
  }

  function deleteRoutine(id) {
    activeData.routines = activeData.routines.filter(item => item.id !== id);
    saveActivityLog(activeData);
    renderRoutines();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -------------------------------------
  // 5. 이벤트 핸들러 바인딩 및 부팅
  // -------------------------------------
  btnSaveSleepTime.addEventListener('click', () => {
    const timeVal = sleepTimeInput.value;
    if (timeVal) {
      activeData.sleepTime = timeVal;
      saveActivityLog(activeData);
      alert('취침 알림 시간이 [' + timeVal + ']으로 안전하게 저장되었습니다.');
    }
  });

  btnRequestNotification.addEventListener('click', requestNotificationPermission);

  routineAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = routineInput.value;
    if (val) {
      addRoutine(val);
      routineInput.value = '';
    }
  });

  // 초기값 바인딩 및 체킹 실행
  checkDateAndResetRoutines();
  sleepTimeInput.value = activeData.sleepTime;
  updateNotificationButtonUI();
  renderRoutines();
  startAlarmWatcher();
});
