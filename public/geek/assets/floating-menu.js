// 浮动菜单功能实现
document.addEventListener('DOMContentLoaded', function() {
  // 创建浮动菜单
  createFloatingMenu();
  // 初始化TTS状态
  initTTSState();
  // 包装内容到容器中
  wrapContent();


  // 处理图片响应式
  makeImagesResponsive();

  // 处理表格响应式
  makeTablesResponsive();

  // 处理iframe响应式
  makeIframesResponsive();

});

// 全局TTS状态 (保留原有TTS功能的状态管理)
let ttsState = {
  isPlaying: false,
  currentSegmentIndex: 0,
  segments: [],
  audio: null,
  rate: 1.0,
  volume: 1.0
};

// 移除原有的TTS按钮
function removeOriginalTTSButton() {
  const ttsButton = document.querySelector('.tts-button');
  const ttsPanel = document.querySelector('.tts-panel');
  
  if (ttsButton) {
    ttsButton.remove();
  }
  
  if (ttsPanel) {
    ttsPanel.remove();
  }
}



// 将主要内容包装在容器中
function wrapContent() {
  const body = document.body;
  const children = Array.from(body.children);

  // 创建容器
  const container = document.createElement('div');
  container.className = 'container';

  // 将所有子元素移动到容器中
  while (body.firstChild) {
    container.appendChild(body.firstChild);
  }

  // 将容器添加回body
  body.appendChild(container);
}
// 处理图片响应式
function makeImagesResponsive() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // 确保图片有alt属性
    if (!img.hasAttribute('alt')) {
      img.alt = '';
    }

    // 添加懒加载
    img.loading = 'lazy';

    // 如果图片没有样式，添加响应式类
    if (!img.hasAttribute('style')) {
      img.classList.add('responsive-img');
    }
  });
}

// 处理表格响应式
function makeTablesResponsive() {
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    // 创建包装器
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';

    // 将表格包装在div中
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

// 处理iframe响应式
function makeIframesResponsive() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    // 创建包装器
    const wrapper = document.createElement('div');
    wrapper.className = 'iframe-responsive';

    // 将iframe包装在div中
    iframe.parentNode.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);

    // 设置iframe属性
    iframe.setAttribute('loading', 'lazy');
  });
}


// 创建浮动菜单
function createFloatingMenu() {
  // 创建主菜单按钮
  const menuButton = document.createElement('div');
  menuButton.className = 'floating-menu-button';
  menuButton.setAttribute('aria-label', '菜单');
  menuButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>
  `;
  
  // 创建菜单项容器
  const menuItems = document.createElement('div');
  menuItems.className = 'floating-menu-items';
  
  // 创建主题切换按钮
  const themeToggle = document.createElement('div');
  themeToggle.className = 'menu-item theme-toggle';
  themeToggle.setAttribute('aria-label', '切换主题');
  themeToggle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
    </svg>
  `;
  
  // 创建TTS按钮
  const ttsToggle = document.createElement('div');
  ttsToggle.className = 'menu-item tts-toggle';
  ttsToggle.setAttribute('aria-label', '语音朗读');
  ttsToggle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
    </svg>
  `;
  
  // 创建返回上一页按钮
  const backButton = document.createElement('div');
  backButton.className = 'menu-item back-button';
  backButton.setAttribute('aria-label', '返回上一页');
  backButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
    </svg>
  `;
  
  // 添加菜单项到容器
  menuItems.appendChild(themeToggle);
  menuItems.appendChild(ttsToggle);
  menuItems.appendChild(backButton);
  
  // 添加到DOM
  document.body.appendChild(menuItems);
  document.body.appendChild(menuButton);
  
  // 添加事件监听器 - 主菜单按钮点击
  menuButton.addEventListener('click', function() {
    menuButton.classList.toggle('active');
    menuItems.classList.toggle('active');
  });
  
  // 添加事件监听器 - 主题切换
  themeToggle.addEventListener('click', function() {
    toggleTheme();
    // 点击后关闭菜单
    closeMenu(menuButton, menuItems);
  });
  
  // 添加事件监听器 - TTS功能
  ttsToggle.addEventListener('click', function() {
    toggleTTS();
    // 点击后关闭菜单
    closeMenu(menuButton, menuItems);
  });
  
  // 添加事件监听器 - 返回上一页
  backButton.addEventListener('click', function() {
    window.history.back();
    // 点击后关闭菜单
    closeMenu(menuButton, menuItems);
  });
  
  // 点击页面其他区域关闭菜单
  document.addEventListener('click', function(event) {
    if (!menuItems.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu(menuButton, menuItems);
    }
  });
}

// 关闭菜单
function closeMenu(menuButton, menuItems) {
  menuButton.classList.remove('active');
  menuItems.classList.remove('active');
}

// 切换主题
function toggleTheme() {
  const body = document.body;
  
  // 检查当前主题
  const isDarkMode = body.classList.contains('dark-theme');
  
  if (isDarkMode) {
    // 切换到亮色主题
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  } else {
    // 切换到暗色主题
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
}

// 切换TTS功能
function toggleTTS() {
  // 创建TTS面板
  let ttsPanel = document.querySelector('.tts-panel');
  
  if (!ttsPanel) {
    // 如果面板不存在，创建一个新的
    ttsPanel = document.createElement('div');
    ttsPanel.className = 'tts-panel';
    ttsPanel.innerHTML = `
      <div class="tts-panel-header">
        <h3 class="tts-panel-title">语音朗读</h3>
        <button class="tts-panel-close" aria-label="关闭面板">×</button>
      </div>
      <div class="tts-controls">
        <button class="tts-play-button" aria-label="播放/暂停">
          <svg class="tts-play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
          </svg>
          <svg class="tts-pause-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
          </svg>
        </button>
      </div>
      <div class="tts-settings">
        <div class="tts-setting-item">
          <label class="tts-setting-label" for="tts-volume">音量</label>
          <div class="tts-range-container">
            <input type="range" id="tts-volume" class="tts-range" min="0" max="1" step="0.1" value="1">
            <span class="tts-range-value">1.0</span>
          </div>
        </div>
      </div>
      <div class="tts-status">准备就绪</div>
    `;
    
    document.body.appendChild(ttsPanel);
    
    // 添加事件监听器
    const closeButton = ttsPanel.querySelector('.tts-panel-close');
    closeButton.addEventListener('click', function() {
      ttsPanel.classList.remove('active');
    });
    
    const playButton = ttsPanel.querySelector('.tts-play-button');
    playButton.addEventListener('click', togglePlayPause);
    
    const volumeSlider = ttsPanel.querySelector('#tts-volume');
    volumeSlider.addEventListener('input', function() {
      const value = parseFloat(this.value);
      ttsState.volume = value;
      this.nextElementSibling.textContent = value.toFixed(1);
      if (ttsState.audio) {
        ttsState.audio.volume = value;
      }
    });
    
    // 点击页面其他区域关闭面板
    document.addEventListener('click', function(event) {
      if (!ttsPanel.contains(event.target) && !document.querySelector('.menu-item.tts-toggle').contains(event.target)) {
        ttsPanel.classList.remove('active');
      }
    });
  }
  
  // 切换面板显示状态
  ttsPanel.classList.toggle('active');
}

// 初始化TTS状态
function initTTSState() {
  // 提取文章内容
  ttsState.segments = extractArticleContent();
}

// 提取文章内容
function extractArticleContent() {
  const segments = [];
  
  // 获取所有段落和列表项
  const paragraphs = document.querySelectorAll('p');
  const listItems = document.querySelectorAll('li');
  
  // 处理段落
  paragraphs.forEach(p => {
    if (p.textContent.trim() !== '') {
      segments.push(p.textContent.trim());
    }
  });
  
  // 处理列表项
  listItems.forEach(li => {
    if (li.textContent.trim() !== '') {
      segments.push(li.textContent.trim());
    }
  });
  
  return segments;
}

// 切换播放/暂停状态
function togglePlayPause() {
  const playButton = document.querySelector('.tts-play-button');
  const playIcon = playButton.querySelector('.tts-play-icon');
  const pauseIcon = playButton.querySelector('.tts-pause-icon');
  const statusElement = document.querySelector('.tts-status');
  
  if (ttsState.isPlaying) {
    // 暂停播放
    if (ttsState.audio) {
      ttsState.audio.pause();
    }
    ttsState.isPlaying = false;
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
    statusElement.textContent = '已暂停';
  } else {
    // 开始播放
    playIcon.style.display = 'none';
    pauseIcon.style.display = '';
    statusElement.textContent = '正在播放...';
    ttsState.isPlaying = true;
    
    // 如果没有正在播放的音频，开始播放当前段落
    if (!ttsState.audio || ttsState.audio.paused) {
      playCurrentSegment();
    }
  }
}

// 播放当前段落
function playCurrentSegment() {
  if (ttsState.segments.length === 0) {
    updateStatus('没有可朗读的内容');
    resetPlayState();
    return;
  }
  
  if (ttsState.currentSegmentIndex >= ttsState.segments.length) {
    ttsState.currentSegmentIndex = 0;
  }
  
  const currentText = ttsState.segments[ttsState.currentSegmentIndex];
  if (!currentText || currentText.trim() === '') {
    ttsState.currentSegmentIndex++;
    playCurrentSegment();
    return;
  }
  
  // 编码文本
  const encodedText = encodeURIComponent(currentText);
  
  // 构建TTS API URL
  const ttsUrl = `https://t.leftsite.cn/tts?t=${encodedText}&v=zh-CN-XiaoxiaoNeural&r=${ttsState.rate}&p=0&o=audio-24khz-48kbitrate-mono-mp3`;
  
  // 创建音频元素
  ttsState.audio = new Audio(ttsUrl);
  ttsState.audio.volume = ttsState.volume;
  
  // 更新状态
  updateStatus(`正在朗读 (${ttsState.currentSegmentIndex + 1}/${ttsState.segments.length})`);
  
  // 播放完成后播放下一段
  ttsState.audio.onended = function() {
    if (ttsState.isPlaying) {
      ttsState.currentSegmentIndex++;
      if (ttsState.currentSegmentIndex < ttsState.segments.length) {
        playCurrentSegment();
      } else {
        // 所有段落播放完毕
        updateStatus('播放完成');
        resetPlayState();
      }
    }
  };
  
  // 播放错误处理
  ttsState.audio.onerror = function() {
    updateStatus('播放出错，请重试');
    resetPlayState();
  };
  
  // 开始播放
  ttsState.audio.play().catch(error => {
    console.error('播放失败:', error);
    updateStatus('播放失败，请重试');
    resetPlayState();
  });
}

// 更新状态显示
function updateStatus(message) {
  const statusElement = document.querySelector('.tts-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// 重置播放状态
function resetPlayState() {
  ttsState.isPlaying = false;
  const playButton = document.querySelector('.tts-play-button');
  const playIcon = playButton.querySelector('.tts-play-icon');
  const pauseIcon = playButton.querySelector('.tts-pause-icon');
  
  playIcon.style.display = '';
  pauseIcon.style.display = 'none';
}

// 初始化主题
function initTheme() {
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
  } else {
    // 如果没有保存的主题设置，检查系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-theme');
    }
  }
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);
