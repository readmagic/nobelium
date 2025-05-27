// TTS功能实现脚本
document.addEventListener('DOMContentLoaded', function() {
  // 移除原有的返回顶部按钮
  removeBackToTopButton();
  
  // 创建TTS按钮和控制面板
  createTTSButton();
  
  // 初始化TTS状态
  initTTSState();
});

// 全局TTS状态
let ttsState = {
  isPlaying: false,
  currentSegmentIndex: 0,
  segments: [],
  audio: null,
  rate: 1.0,
  volume: 1.0
};


// 创建TTS按钮和控制面板
function createTTSButton() {
  // 创建TTS主按钮
  const ttsButton = document.createElement('div');
  ttsButton.className = 'tts-button';
  ttsButton.setAttribute('aria-label', '语音朗读');
  ttsButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
    </svg>
  `;
  
  // 创建TTS控制面板
  const ttsPanel = document.createElement('div');
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
  
  // 添加到DOM
  document.body.appendChild(ttsButton);
  document.body.appendChild(ttsPanel);
  
  // 添加事件监听器
  ttsButton.addEventListener('click', function() {
    ttsPanel.classList.toggle('active');
  });
  
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
    if (!ttsPanel.contains(event.target) && !ttsButton.contains(event.target)) {
      ttsPanel.classList.remove('active');
    }
  });
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
