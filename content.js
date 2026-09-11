// Создаем кнопку, которая будет всплывать
const btn = document.createElement('button');
btn.innerText = '🔗 Склеить URL';

// Стилизуем кнопку (смещаем приоритет на максимум)
Object.assign(btn.style, {
  position: 'absolute',
  display: 'none',
  zIndex: '2147483647', // Абсолютный максимум в браузере, перекроет всё
  padding: '6px 12px',
  background: '#10a37f', 
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  fontFamily: 'sans-serif',
  pointerEvents: 'auto'
});

document.body.appendChild(btn);

let selectedText = "";

// Отслеживаем выделение
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  selectedText = selection.toString().trim();

  // Проверяем, есть ли выделение и содержит ли оно пробелы
  if (selectedText.length > 3 && selectedText.includes(' ')) {
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    
    if (rects.length > 0) {
      const firstRect = rects[0]; // Берем координаты самого начала выделения
      
      // Позиционируем кнопку НАД первой строчкой выделения слева
      btn.style.top = `${window.scrollY + firstRect.top - 35}px`;
      btn.style.left = `${window.scrollX + firstRect.left}px`;
      btn.style.display = 'block';
    }
  } else {
    btn.style.display = 'none';
  }
});

// Скрываем кнопку при клике мимо
document.addEventListener('mousedown', (e) => {
  if (e.target !== btn) {
    btn.style.display = 'none';
  }
});

// Клик по кнопке — склеиваем и копируем
btn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  const cleanUrl = selectedText.replace(/\s+/g, '');
  
  navigator.clipboard.writeText(cleanUrl).then(() => {
    btn.innerText = '✅ Скопировано!';
    btn.style.background = '#2ea44f';
    
    setTimeout(() => {
      btn.style.display = 'none';
      btn.innerText = '🔗 Склеить URL';
      btn.style.background = '#10a37f';
    }, 800);
  }).catch(err => {
    console.error('Ошибка копирования:', err);
    btn.style.display = 'none';
  });
});