import { useEffect, useState } from 'react';

const menuItems = [
  {
    icon: '🫁',
    title: '4-7-8 호흡 세션',
    desc: '시험 전 불안을 가라앉히는 호흡 5분',
  },
  {
    icon: '🌌',
    title: 'Sleep Stories',
    desc: '평온한 수면을 유도하는 힐링 사운드',
  },
  {
    icon: '⏰',
    title: '오늘의 루틴',
    desc: '취침 전 루틴 관리 및 스마트 알림',
  },
  {
    icon: '🔒',
    title: '학부모 리포트',
    desc: '주간 이용 현황 요약 (보호자 모드)',
  },
];

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return '상쾌하고 차분한 아침입니다';
  if (hour >= 12 && hour < 17) return '맑고 집중하기 좋은 오후입니다';
  if (hour >= 17 && hour < 21) return '오늘 하루도 애쓰셨어요. 편안한 저녁입니다';
  return '깊은 휴식이 필요한 밤입니다';
}

function getDday() {
  const targetDate = new Date('2026-11-19T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return 'D-Day';
  return `D+${Math.abs(diffDays)}`;
}

function getStreakValue() {
  const storageKey = 'mycalm-react-streak';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const raw = localStorage.getItem(storageKey);
  const stored = raw
    ? JSON.parse(raw)
    : { streak: 1, lastActive: today.toISOString() };

  const lastActive = new Date(stored.lastActive);
  lastActive.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  let streak = stored.streak ?? 1;
  if (diffDays === 0) {
    streak = Math.max(1, streak);
  } else if (diffDays === 1) {
    streak = Math.max(1, streak + 1);
  } else {
    streak = 1;
  }

  localStorage.setItem(storageKey, JSON.stringify({ streak, lastActive: today.toISOString() }));
  return streak;
}

function Home() {
  const [greeting, setGreeting] = useState('좋은 하루입니다!');
  const [dday, setDday] = useState('D-?');
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setDday(getDday());
    setStreak(getStreakValue());
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-300">MyCalm</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">청소년 마음 쉼터</h1>
            <p className="mt-4 max-w-xl text-slate-300">마음이 복잡할 때 찾아오는 휴식형 웰니스 공간입니다. 지금 가장 필요한 휴식을 곧바로 시작해보세요.</p>
          </div>
          <div className="inline-flex rounded-3xl border border-slate-600/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 shadow-lg shadow-slate-950/20">
            2026 학습 휴식 &amp; 마음챙김
          </div>
        </div>
      </div>

      <section className="grid gap-5 sm:grid-cols-2">
        <article className="glass-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-sky-300">환영합니다</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{greeting}</h2>
            </div>
            <span className="inline-flex rounded-3xl bg-sky-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Mind Reset</span>
          </div>
          <p className="mt-5 text-slate-300">오늘도 MyCalm에 잘 오셨어요. 지친 마음을 잠시 쉬어보세요.</p>
        </article>

        <article className="glass-card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">대시보드</p>
            <span className="rounded-3xl bg-slate-800/70 px-3 py-2 text-xs text-slate-300">실시간 리포트</span>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">연속 휴식 스트릭</p>
              <p className="mt-4 text-3xl font-semibold text-white">{streak}일</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">2026 수능 D-Day</p>
              <p className="mt-4 text-3xl font-semibold text-white">{dday}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-300">프로그램 메뉴</h2>
          <p className="text-sm text-slate-400">빠른 휴식으로 이어지는 경로</p>
        </div>

        <div className="mt-4 grid gap-4">
          {menuItems.map((item) => (
            <button
              key={item.title}
              type="button"
              className="group flex w-full items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 px-5 py-5 text-left transition hover:border-sky-300/30 hover:bg-slate-900/80"
              onClick={() => {
                alert('기능 준비 중입니다.');
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800/80 text-2xl shadow-lg shadow-sky-500/10">{item.icon}</div>
                <div>
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
              <span className="text-2xl text-slate-500 transition group-hover:text-sky-300">→</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-slate-400 shadow-xl shadow-slate-950/20">
        © 2026 MyCalm. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
