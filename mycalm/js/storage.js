// MyCalm 공통 데이터 스토리지 모듈

const STORAGE_KEY = 'mycalm_activity_log';

// 초기 스토리지 데이터 템플릿
const DEFAULT_DATA = {
  streak: 0,
  lastActiveDate: '',
  activities: [],
  sleepTime: '23:00',
  routines: [
    { id: '1', text: '잠들기 1시간 전 스마트폰 멀리하기', completed: false },
    { id: '2', text: '방을 시원하고 어둡게 만들기', completed: false },
    { id: '3', text: '따뜻한 물로 샤워하거나 족욕하기', completed: false }
  ],
  pin: '' // 학부모 리포트 열람용 4자리 PIN
};

// 로컬 타임존 기준 오늘 날짜 구하기 (YYYY-MM-DD)
function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// 두 날짜 간의 일수 차이 계산
function getDateDiffInDays(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return -1;
  
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  
  // 날짜의 시간 정보 리셋하여 순수 일수 차이 계산
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// 스토리지 데이터 불러오기
function getActivityLog() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_DATA)); // Deep copy
  }
  try {
    const data = JSON.parse(stored);
    
    // 데이터 구조가 옛날 데이터거나 누락된 키가 있으면 기본값으로 채우기 (Optional Chaining 배제)
    if (data.streak === undefined) data.streak = DEFAULT_DATA.streak;
    if (data.lastActiveDate === undefined) data.lastActiveDate = DEFAULT_DATA.lastActiveDate;
    if (data.activities === undefined) data.activities = DEFAULT_DATA.activities;
    if (data.sleepTime === undefined) data.sleepTime = DEFAULT_DATA.sleepTime;
    if (data.routines === undefined) data.routines = DEFAULT_DATA.routines;
    if (data.pin === undefined) data.pin = DEFAULT_DATA.pin;
    
    return data;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

// 스토리지 데이터 저장하기
function saveActivityLog(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 스트릭 갱신 로직
function updateStreak() {
  const data = getActivityLog();
  const today = getTodayKey();
  const lastActive = data.lastActiveDate;

  if (!lastActive) {
    // 최초 활동 기록
    data.streak = 1;
    data.lastActiveDate = today;
  } else if (lastActive === today) {
    // 오늘 이미 활동함 -> 스트릭 유지
  } else {
    const diff = getDateDiffInDays(lastActive, today);
    if (diff === 1) {
      // 어제 활동 후 오늘 연속 활동 -> 스트릭 증가
      data.streak += 1;
    } else if (diff > 1) {
      // 하루 이상 거름 -> 스트릭 초기화
      data.streak = 1;
    }
    // 미래의 날짜에서 접속(시간 설정 이상 등) 시에는 갱신하지 않고 1로 재세팅 안전 장치
    else if (diff < 0) {
      data.streak = 1;
    }
    data.lastActiveDate = today;
  }
  
  saveActivityLog(data);
  return data.streak;
}

// 활동 완료 로그 남기기
function logActivity(type, extraInfo) {
  const data = getActivityLog();
  const today = getTodayKey();
  const timestamp = new Date().toISOString();
  
  const newActivity = {
    type: type, // 'breathing' | 'story' | 'routine'
    timestamp: timestamp,
    date: today
  };
  
  // extraInfo 객체가 있는 경우 추가
  if (extraInfo) {
    for (const key in extraInfo) {
      if (extraInfo.hasOwnProperty(key)) {
        newActivity[key] = extraInfo[key];
      }
    }
  }

  data.activities.push(newActivity);
  saveActivityLog(data);
  
  // 활동 완료 시 스트릭 갱신 수행
  const newStreak = updateStreak();
  return newStreak;
}
