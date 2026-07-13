// MyCalm 전체 배경 슬라이드쇼 제어 스크립트

document.addEventListener('DOMContentLoaded', () => {
  // 배경을 렌더링할 컨테이너를 body 맨 앞에 동적으로 추가
  const bgContainer = document.createElement('div');
  bgContainer.className = 'app-bg-container';
  
  const slide1 = document.createElement('div');
  slide1.className = 'app-bg-slide active';
  slide1.style.backgroundImage = "linear-gradient(135deg, rgba(137, 93, 255, 0.36), rgba(23, 32, 72, 0.68)), url('assets/bg/bg1.jpg')";
  slide1.style.backgroundBlendMode = 'overlay';
  
  const slide2 = document.createElement('div');
  slide2.className = 'app-bg-slide';
  slide2.style.backgroundImage = "linear-gradient(140deg, rgba(64, 207, 255, 0.28), rgba(22, 28, 65, 0.72)), url('assets/bg/bg2.jpg')";
  slide2.style.backgroundBlendMode = 'overlay';
  
  const veil = document.createElement('div');
  veil.className = 'app-bg__veil';
  
  bgContainer.appendChild(slide1);
  bgContainer.appendChild(slide2);
  bgContainer.appendChild(veil);
  
  document.body.insertBefore(bgContainer, document.body.firstChild);
  
  // 60초마다 교차 페이드하는 인터벌 타이머 가동
  let currentSlide = 1;
  const slideDuration = 60000; // 60초
  
  setInterval(() => {
    if (currentSlide === 1) {
      slide1.classList.remove('active');
      slide2.classList.add('active');
      currentSlide = 2;
    } else {
      slide2.classList.remove('active');
      slide1.classList.add('active');
      currentSlide = 1;
    }
  }, slideDuration);
});
