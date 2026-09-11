const fixBtnState = document.getElementById('fixBtnState');
const copyBtnState = document.getElementById('copyBtnState');
const sitesList = document.getElementById('sitesList');
const radioModes = document.getElementsByName('filterMode');

// Загружаем сохраненные настройки
chrome.storage.local.get({ fixEnabled: true, copyEnabled: true, filterMode: 'blacklist', sites: '' }, (data) => {
  updateButton(fixBtnState, data.fixEnabled);
  updateButton(copyBtnState, data.copyEnabled);
  sitesList.value = data.sites;
  
  // Устанавливаем активную радиокнопку
  for (let radio of radioModes) {
    if (radio.value === data.filterMode) {
      radio.checked = true;
    }
  }
  updatePlaceholder(data.filterMode);
  updateBrowserIcon();
});

// Клик по кнопке "Склеить"
fixBtnState.addEventListener('click', () => {
  chrome.storage.local.get({ fixEnabled: true }, (data) => {
    const newState = !data.fixEnabled;
    chrome.storage.local.set({ fixEnabled: newState }, () => {
      updateButton(fixBtnState, newState);
      updateBrowserIcon();
    });
  });
});

// Клик по кнопке "Копировать"
copyBtnState.addEventListener('click', () => {
  chrome.storage.local.get({ copyEnabled: true }, (data) => {
    const newState = !data.copyEnabled;
    chrome.storage.local.set({ copyEnabled: newState }, () => {
      updateButton(copyBtnState, newState);
      updateBrowserIcon();
    });
  });
});

// Отслеживаем переключение радиокнопок Черный / Белый список
for (let radio of radioModes) {
  radio.addEventListener('change', (e) => {
    const currentMode = e.target.value;
    chrome.storage.local.set({ filterMode: currentMode });
    updatePlaceholder(currentMode);
  });
}

// Отслеживаем ввод текста в список сайтов
sitesList.addEventListener('input', () => {
  chrome.storage.local.set({ sites: sitesList.value });
});

// Функция для динамического изменения подсказки
function updatePlaceholder(mode) {
  if (mode === 'blacklist') {
    sitesList.placeholder = "На этих сайтах плагин НЕ БУДЕТ работать.\nПример:\nexample.com\nyoutube.com";
  } else {
    sitesList.placeholder = "Плагин будет работать ТОЛЬКО здесь.\nЕсли оставить пустым — работает везде.\nПример:\nchatgpt.com\nya.ru";
  }
}

function updateButton(btn, isEnabled) {
  if (isEnabled) {
    btn.innerText = 'ВКЛ';
    btn.className = 'btn-toggle';
  } else {
    btn.innerText = 'ВЫКЛ';
    btn.className = 'btn-toggle off';
  }
}

function updateBrowserIcon() {
  chrome.storage.local.get({ fixEnabled: true, copyEnabled: true }, (data) => {
    if (!data.fixEnabled && !data.copyEnabled) {
      chrome.action.setIcon({ path: "icon-inactive.png" }).catch(() => {});
    } else {
      chrome.action.setIcon({ path: "icon-active.png" }).catch(() => {});
    }
  });
}