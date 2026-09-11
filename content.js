const container = document.createElement('div');
const fixBtn = document.createElement('button');
fixBtn.innerText = '🔗 Склеить URL';
const copyBtn = document.createElement('button');
copyBtn.innerText = '📋 Копировать';

Object.assign(container.style, {
  position: 'absolute',
  display: 'none',
  zIndex: '2147483647',
  fontFamily: 'sans-serif',
  gap: '4px'
});

const btnStyle = {
  padding: '6px 12px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  pointerEvents: 'auto'
};
Object.assign(fixBtn.style, btnStyle, { background: '#10a37f' });
Object.assign(copyBtn.style, btnStyle, { background: '#007eb9' });

container.appendChild(fixBtn);
container.appendChild(copyBtn);
document.body.appendChild(container);

let selectedText = "";

function checkPermissions(callback) {
  // Защита от критического разрыва контекста расширения
  if (!chrome.runtime || !chrome.runtime.id) return;

  chrome.storage.local.get({ fixEnabled: true, copyEnabled: true, filterMode: 'blacklist', sites: '' }, (data) => {
    if (chrome.runtime.lastError) return;
    
    // Если отключены оба тумблера — сразу скрываем плагин
    if (!data.fixEnabled && !data.copyEnabled) return callback(false, data);

    const currentHost = window.location.hostname;
    // Разбиваем текст из поля по строкам
    const configuredSites = data.sites.split('\n').map(s => s.trim()).filter(Boolean);

    if (data.filterMode === 'blacklist') {
      // Логика ЧЕРНОГО списка: если домен совпал — блокируем работу
      const isBlocked = configuredSites.some(domain => currentHost.includes(domain));
      return callback(!isBlocked, data);
    } else {
      // Логика БЕЛОГО списка: если список пуст — разрешаем везде, если не пуст — только совпавшим
      if (configuredSites.length === 0) return callback(true, data);
      const isAllowed = configuredSites.some(domain => currentHost.includes(domain));
      return callback(isAllowed, data);
    }
  });
}

document.addEventListener('mouseup', () => {
  checkPermissions((isAllowed, config) => {
    if (!isAllowed) { container.style.display = 'none'; return; }

    const selection = window.getSelection();
    selectedText = selection.toString().trim();

    // Проверяем, что выделили текст с пробелами
    if (selectedText.length > 3 && selectedText.includes(' ')) {
      fixBtn.style.display = config.fixEnabled ? 'block' : 'none';
      copyBtn.style.display = config.copyEnabled ? 'block' : 'none';

      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      
      if (rects.length > 0) {
        const firstRect = rects[0];
        container.style.top = `${window.scrollY + firstRect.top - 35}px`;
        container.style.left = `${window.scrollX + firstRect.left}px`;
        container.style.display = 'flex';
      }
    } else {
      container.style.display = 'none';
    }
  });
});

document.addEventListener('mousedown', (e) => {
  if (!container.contains(e.target)) container.style.display = 'none';
});

fixBtn.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  const cleanUrl = selectedText.replace(/\s+/g, '');
  executeCopy(cleanUrl, fixBtn, '🔗 Склеить URL');
});

copyBtn.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  executeCopy(selectedText, copyBtn, '📋 Копировать');
});

function executeCopy(text, buttonElement, originalText) {
  navigator.clipboard.writeText(text).then(() => {
    const originalBg = buttonElement.style.background;
    buttonElement.innerText = '✅ Готово!';
    buttonElement.style.background = '#2ea44f';
    
    setTimeout(() => {
      container.style.display = 'none';
      buttonElement.innerText = originalText;
      buttonElement.style.background = originalBg;
    }, 800);
  }).catch(err => {
    console.error('Ошибка:', err);
    container.style.display = 'none';
  });
}