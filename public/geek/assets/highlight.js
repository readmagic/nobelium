// 笔记高亮功能
document.addEventListener('DOMContentLoaded', function() {
  // 初始化 LeanCloud
  initLeanCloud();
  
  // 创建笔记面板
  createNotesPanel();
  
  // 将笔记按钮添加到菜单中
  addNotesButtonToMenu();
  
  // 初始化笔记功能
  initHighlightFeature();
  
  // 加载已保存的笔记
  loadHighlights();
  
  // 添加样式
  addStyles();
});

// LeanCloud 配置
let LC_APP_ID = '';
let LC_APP_KEY = '';
let LC_SERVER_URL = '';

// 从本地存储加载 LeanCloud 配置
function loadLeanCloudConfig() {
  LC_APP_ID = localStorage.getItem('leancloud_app_id') || '';
  LC_APP_KEY = localStorage.getItem('leancloud_app_key') || '';
  LC_SERVER_URL = localStorage.getItem('leancloud_server_url') || '';
  
  return LC_APP_ID && LC_APP_KEY && LC_SERVER_URL;
}

// 保存 LeanCloud 配置到本地存储
function saveLeanCloudConfig(appId, appKey, serverUrl) {
  localStorage.setItem('leancloud_app_id', appId);
  localStorage.setItem('leancloud_app_key', appKey);
  localStorage.setItem('leancloud_server_url', serverUrl);
  
  LC_APP_ID = appId;
  LC_APP_KEY = appKey;
  LC_SERVER_URL = serverUrl;
}

// 显示 LeanCloud 配置表单
function showLeanCloudConfigForm(callback) {
  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'note-modal';
  modal.innerHTML = `
    <div class="note-modal-content">
      <div class="note-modal-header">
        <h4>配置笔记服务</h4>
        <button class="note-modal-close">×</button>
      </div>
      <div class="note-modal-body">
        <p>请填写 LeanCloud 配置信息：</p>
        <form id="leancloud-config-form">
          <div class="form-group">
            <label for="app-id">App ID</label>
            <input type="text" id="app-id" value="${LC_APP_ID}" required>
          </div>
          <div class="form-group">
            <label for="app-key">App Key</label>
            <input type="text" id="app-key" value="${LC_APP_KEY}" required>
          </div>
          <div class="form-group">
            <label for="server-url">Server URL</label>
            <input type="text" id="server-url" value="${LC_SERVER_URL}" required>
          </div>
          <button type="submit" class="submit-btn">保存配置</button>
        </form>
        <div class="form-help">
          <p>如何获取 LeanCloud 配置？</p>
          <ol>
            <li>注册并登录 <a href="https://www.leancloud.cn/" target="_blank">LeanCloud</a></li>
            <li>创建应用，进入应用设置</li>
            <li>在应用凭证页面获取 App ID、App Key 和服务器地址</li>
            <li>创建Highlight Class</li>
          </ol>
        </div>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(modal);
  
  // 关闭按钮
  modal.querySelector('.note-modal-close').addEventListener('click', function() {
    modal.remove();
  });
  
  // 提交表单
  const form = modal.querySelector('#leancloud-config-form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const appId = form.querySelector('#app-id').value.trim();
    const appKey = form.querySelector('#app-key').value.trim();
    const serverUrl = form.querySelector('#server-url').value.trim();
    
    if (!appId || !appKey || !serverUrl) {
      alert('请填写完整的配置信息');
      return;
    }
    
    // 保存配置
    saveLeanCloudConfig(appId, appKey, serverUrl);
    
    // 初始化 LeanCloud
    initLeanCloud();
    
    // 关闭模态框
    modal.remove();
    
    // 执行回调
    if (typeof callback === 'function') {
      callback();
    }
  });
}

// 初始化 LeanCloud
function initLeanCloud() {
  // 检查配置是否存在
  const hasConfig = loadLeanCloudConfig();
  
  if (!hasConfig) {
    // 配置不存在，但不在这里显示表单
    // 将在用户尝试使用笔记功能时显示
    return;
  }
  
  if (typeof AV === 'undefined') {
    // 如果 LeanCloud SDK 未加载，动态加载
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leancloud-storage@4.12.0/dist/av-min.js';
    script.onload = function() {
      // SDK 加载完成后初始化
      AV.init({
        appId: LC_APP_ID,
        appKey: LC_APP_KEY,
        serverURL: LC_SERVER_URL
      });
    };
    document.head.appendChild(script);
  } else {
    // SDK 已加载，直接初始化
    AV.init({
      appId: LC_APP_ID,
      appKey: LC_APP_KEY,
      serverURL: LC_SERVER_URL
    });
  }
}

// 当前页面信息
const pageInfo = {
  url: window.location.pathname,
  title: document.title || window.location.pathname.split('/').pop()
};

// 创建笔记面板
function createNotesPanel() {
  const panel = document.createElement('div');
  panel.className = 'notes-panel';
  panel.innerHTML = `
    <div class="notes-panel-header">
      <h3>我的笔记</h3>
      <button class="close-panel">×</button>
    </div>
    <div class="notes-panel-content"></div>
  `;
  document.body.appendChild(panel);
  
  // 关闭面板按钮
  panel.querySelector('.close-panel').addEventListener('click', function() {
    panel.classList.remove('open');
  });
}

// 将笔记按钮添加到菜单中
function addNotesButtonToMenu() {
  // 等待 TTS 菜单加载完成
  const checkInterval = setInterval(function() {
    const subButtonsContainer = document.querySelector('.sub-buttons-container');
    if (subButtonsContainer) {
      clearInterval(checkInterval);
      
      // 创建笔记按钮
      const notesButton = document.createElement('div');
      notesButton.className = 'sub-button notes-button';
      notesButton.setAttribute('aria-label', '笔记');
      notesButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,12V14H19V12H5M5,16V18H14V16H5Z" />
        </svg>
      `;
      
      // 将笔记按钮添加到子按钮容器的最前面
      if (subButtonsContainer.firstChild) {
        subButtonsContainer.insertBefore(notesButton, subButtonsContainer.firstChild);
      } else {
        subButtonsContainer.appendChild(notesButton);
      }
      
      // 修改 TTS.js 中的子按钮展开位置
      const style = document.createElement('style');
      style.textContent = `
        .sub-buttons-container.active .sub-button:nth-child(1) { /* 笔记按钮 - 最上方 */
          opacity: 1;
          transform: translateY(-190px) scale(1);
        }
        .sub-buttons-container.active .sub-button:nth-child(2) { /* TTS按钮 - 中间 */
          opacity: 1;
          transform: translateY(-130px) scale(1);
        }
        .sub-buttons-container.active .sub-button:nth-child(3) { /* 返回按钮 - 最下方 */
          opacity: 1;
          transform: translateY(-70px) scale(1);
        }
        @media (max-width: 768px) {
          .sub-buttons-container.active .sub-button:nth-child(1) { /* 笔记按钮 - 最上方 */
            transform: translateY(-170px) scale(1);
          }
          .sub-buttons-container.active .sub-button:nth-child(2) { /* TTS按钮 - 中间 */
            transform: translateY(-115px) scale(1);
          }
          .sub-buttons-container.active .sub-button:nth-child(3) { /* 返回按钮 - 最下方 */
            transform: translateY(-60px) scale(1);
          }
        }
      `;
      document.head.appendChild(style);
      
      // 点击笔记按钮事件
      notesButton.addEventListener('click', function(e) {
        e.stopPropagation(); // 防止事件冒泡
        
        // 关闭FAB菜单
        const mainFab = document.querySelector('.main-fab');
        if (mainFab) {
          mainFab.classList.remove('active');
          subButtonsContainer.classList.remove('active');
        }
        
        // 打开笔记面板
        const panel = document.querySelector('.notes-panel');
        panel.classList.toggle('open');
        
        // 如果面板打开，刷新笔记列表
        if (panel.classList.contains('open')) {
          refreshNotesList();
        }
      });
    }
  }, 100);
}

// 初始化笔记功能
function initHighlightFeature() {
  // 添加自定义右键菜单
  document.addEventListener('contextmenu', handleContextMenu);
  
  // 点击页面其他区域隐藏自定义右键菜单
  document.addEventListener('click', function(e) {
    const contextMenu = document.querySelector('.custom-context-menu');
    if (contextMenu) {
      contextMenu.remove();
    }
    
    // 关闭笔记面板
    const panel = document.querySelector('.notes-panel');
    const notesButton = document.querySelector('.notes-button');
    if (panel && !panel.contains(e.target) && (!notesButton || !notesButton.contains(e.target))) {
      panel.classList.remove('open');
    }
  });
}

// 处理右键菜单
function handleContextMenu(e) {
  // 获取选中的文本
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // 如果没有选中文本或选中的文本太短，使用默认右键菜单
  if (!selectedText || selectedText.length < 2) {
    return;
  }
  
  // 阻止默认右键菜单
  e.preventDefault();
  
  // 移除已存在的自定义右键菜单
  const existingMenu = document.querySelector('.custom-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  // 创建自定义右键菜单
  const contextMenu = document.createElement('div');
  contextMenu.className = 'custom-context-menu';
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.top = `${e.pageY}px`;
  
  // 添加菜单项
  const addToNotesItem = document.createElement('div');
  addToNotesItem.className = 'custom-context-menu-item';
  addToNotesItem.textContent = '添加到笔记';
  
  // 保存当前选择的文本和范围的副本
  const savedText = selectedText;
  const savedRange = selection.getRangeAt(0).cloneRange();
  
  // 点击添加到笔记
  addToNotesItem.addEventListener('click', function(e) {
    // 阻止事件冒泡，防止菜单关闭后触发document的click事件
    e.stopPropagation();
    
    // 检查 LeanCloud 配置
    if (!loadLeanCloudConfig()) {
      // 显示配置表单
      showLeanCloudConfigForm(function() {
        // 配置完成后，继续添加笔记
        addHighlightWithSelection(selection, savedRange, savedText);
      });
    } else {
      // 配置已存在，直接添加笔记
      addHighlightWithSelection(selection, savedRange, savedText);
    }
    
    // 延迟移除菜单，确保不会干扰高亮操作
    setTimeout(() => {
      contextMenu.remove();
    }, 10);
  });
  
  contextMenu.appendChild(addToNotesItem);
  document.body.appendChild(contextMenu);
  
  // 点击页面其他区域关闭右键菜单
  document.addEventListener('click', function closeContextMenu(e) {
    // 检查点击是否在菜单内
    if (!contextMenu.contains(e.target)) {
      contextMenu.remove();
      document.removeEventListener('click', closeContextMenu);
    }
  });
}

// 添加高亮与选择
function addHighlightWithSelection(selection, savedRange, savedText) {
  try {
    console.log('开始添加高亮');
    // 检查参数
    if (!savedText || savedText.trim().length === 0) {
      console.error('保存的文本为空');
      alert('无法添加笔记：文本为空');
      return;
    }
    
    // 尝试多种方法创建高亮
    let highlight = null;
    
    // 方法1：使用当前选择
    if (selection.rangeCount > 0) {
      console.log('方法1：使用当前选择创建高亮');
      const currentRange = selection.getRangeAt(0);
      highlight = createHighlight(selection, currentRange, savedText);
    }
    
    // 方法2：使用保存的范围
    if (!highlight && savedRange) {
      console.log('方法2：使用保存的范围创建高亮');
      selection.removeAllRanges();
      selection.addRange(savedRange);
      highlight = createHighlight(selection, savedRange, savedText);
    }
    
    // 方法3：使用简化的高亮方法
    if (!highlight) {
      console.log('方法3：使用简化高亮方法');
      highlight = createSimpleHighlight(savedText);
    }
    
    // 如果所有方法都失败，确保笔记仍然被保存
    if (!highlight) {
      console.log('所有高亮方法都失败，仅保存笔记');
      saveHighlight({
        id: 'highlight-' + Date.now(),
        text: savedText,
        pageUrl: pageInfo.url,
        pageTitle: pageInfo.title,
        createdAt: new Date()
      });
      
      // 添加一个提示，告知用户笔记已保存但未高亮
      const notification = document.createElement('div');
      notification.className = 'highlight-notification';
      notification.textContent = '笔记已保存，刷新页面后可以看到高亮效果';
      document.body.appendChild(notification);
      
      // 3秒后自动消失
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } else {
      console.log('高亮创建成功');
    }
    
  } catch (error) {
    console.error('添加高亮过程中出错:', error);
    
    // 至少保存笔记内容
    saveHighlight({
      id: 'highlight-' + Date.now(),
      text: savedText,
      pageUrl: pageInfo.url,
      pageTitle: pageInfo.title,
      createdAt: new Date()
    });
    
    alert('高亮失败，但笔记内容已保存');
    
  }
}

// 简化版创建高亮方法
function createSimpleHighlight(text) {
  if (!text || text.trim().length === 0) {
    console.error('无法创建高亮：文本为空');
    return null;
  }
  
  // 生成唯一ID
  const highlightId = 'highlight-' + Date.now();
  
  try {
    // 在文档中查找文本
    const range = findTextInDocument(text);
    
    if (!range) {
      console.error('无法找到文本:', text);
      
      // 尝试使用DOM选择器创建高亮
      const success = createManualHighlight(text, highlightId);
      if (success) {
        console.log('使用手动方法创建高亮成功');
        
        // 保存高亮到 LeanCloud
        saveHighlight({
          id: highlightId,
          text: text,
          pageUrl: pageInfo.url,
          pageTitle: pageInfo.title,
          createdAt: new Date()
        }, false);
        
        // 返回一个临时的高亮对象
        return { success: true, id: highlightId };
      }
      
      // 直接保存笔记
      saveHighlight({
        id: highlightId,
        text: text,
        pageUrl: pageInfo.url,
        pageTitle: pageInfo.title,
        createdAt: new Date()
      }, false); // 传递false参数，表示不刷新笔记列表
      return null;
    }
    
    // 创建高亮元素
    const highlight = document.createElement('span');
    highlight.className = 'text-highlight';
    highlight.setAttribute('data-highlight-id', highlightId);
    
    // 使用surroundContents方法
    range.surroundContents(highlight);
    
    // 添加点击事件
    highlight.addEventListener('click', function(e) {
      e.stopPropagation();
      showHighlightMenu(highlight);
    });
    
    // 保存高亮到 LeanCloud
    saveHighlight({
      id: highlightId,
      text: text,
      pageUrl: pageInfo.url,
      pageTitle: pageInfo.title,
      createdAt: new Date()
    }, false); // 传递false参数，表示不刷新笔记列表
    
    // 添加闪烁效果
    highlight.classList.add('highlight-flash');
    setTimeout(() => {
      highlight.classList.remove('highlight-flash');
    }, 2000);
    
    return highlight;
  } catch (error) {
    console.error('创建简单高亮失败:', error);
    
    // 尝试使用手动方法创建高亮
    const success = createManualHighlight(text, highlightId);
    if (success) {
      console.log('使用手动方法创建高亮成功');
      
      // 保存高亮到 LeanCloud
      saveHighlight({
        id: highlightId,
        text: text,
        pageUrl: pageInfo.url,
        pageTitle: pageInfo.title,
        createdAt: new Date()
      }, false);
      
      // 返回一个临时的高亮对象
      return { success: true, id: highlightId };
    }
    
    // 直接保存笔记
    saveHighlight({
      id: highlightId,
      text: text,
      pageUrl: pageInfo.url,
      pageTitle: pageInfo.title,
      createdAt: new Date()
    }, false); // 传递false参数，表示不刷新笔记列表
    
    return null;
  }
}

// 手动创建高亮的方法（使用更激进的DOM操作）
function createManualHighlight(text, highlightId) {
  try {
    // 获取选中的文本内容
    const selectedText = text.trim();
    
    // 如果没有选中文本，则退出
    if (!selectedText || selectedText.length === 0) {
      return false;
    }
    
    // 获取当前选区
    const selection = window.getSelection();
    
    // 如果有当前选区，优先使用
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const content = range.toString();
      
      // 确认选区内容包含目标文本
      if (content && content.includes(selectedText)) {
        // 创建高亮元素
        const highlight = document.createElement('span');
        highlight.className = 'text-highlight';
        highlight.setAttribute('data-highlight-id', highlightId);
        
        // 尝试使用不同方法创建高亮
        try {
          // 方法1：使用surroundContents
          range.surroundContents(highlight);
        } catch (e1) {
          try {
            // 方法2：提取内容并添加
            const fragment = range.extractContents();
            highlight.appendChild(fragment);
            range.insertNode(highlight);
          } catch (e2) {
            try {
              // 方法3：替换内容
              highlight.textContent = content;
              range.deleteContents();
              range.insertNode(highlight);
            } catch (e3) {
              return false;
            }
          }
        }
        
        // 添加点击事件
        highlight.addEventListener('click', function(e) {
          e.stopPropagation();
          showHighlightMenu(highlight);
        });
        
        // 添加闪烁效果
        highlight.classList.add('highlight-flash');
        setTimeout(() => {
          highlight.classList.remove('highlight-flash');
        }, 2000);
        
        return true;
      }
    }
    
    // 尝试使用选中的文本内容直接替换
    const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li');
    let success = false;
    
    for (const element of elements) {
      if (element.textContent.includes(selectedText)) {
        // 确保不是已经高亮的元素
        if (element.classList.contains('text-highlight') || 
            element.querySelector('.text-highlight')) {
          continue;
        }
        
        // 将文本内容替换为高亮版本
        const originalHtml = element.innerHTML;
        const escapedText = selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const newHtml = originalHtml.replace(
          new RegExp(escapedText, 'g'), 
          `<span class="text-highlight" data-highlight-id="${highlightId}">${selectedText}</span>`
        );
        
        // 如果内容没有变化，继续查找
        if (newHtml === originalHtml) {
          continue;
        }
        
        element.innerHTML = newHtml;
        
        // 添加点击事件
        const highlight = element.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (highlight) {
          highlight.addEventListener('click', function(e) {
            e.stopPropagation();
            showHighlightMenu(highlight);
          });
          
          // 添加闪烁效果
          highlight.classList.add('highlight-flash');
          setTimeout(() => {
            highlight.classList.remove('highlight-flash');
          }, 2000);
          
          success = true;
          break;
        }
      }
    }
    
    return success;
  } catch (error) {
    console.error('手动创建高亮失败:', error);
    return false;
  }
}

// 在文档中查找文本
function findTextInDocument(text) {
  if (!text || text.trim().length === 0) {
    return null;
  }
  
  // 修剪文本并确保不会太长，这有助于匹配
  const searchText = text.trim();
  const maxSearchLength = 100;
  const normalizedText = searchText.length > maxSearchLength 
    ? searchText.substring(0, maxSearchLength) 
    : searchText;
  
  console.log('查找文本:', normalizedText);
  
  // 获取文章内容区域
  const contentElement = document.querySelector('.article-content') || document.body;
  
  // 创建TreeWalker来遍历文本节点
  const treeWalker = document.createTreeWalker(
    contentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // 跳过脚本和样式标签中的文本
        if (
          node.parentNode.tagName === 'SCRIPT' ||
          node.parentNode.tagName === 'STYLE' ||
          node.parentNode.classList.contains('text-highlight')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  // 两种查找方法：精确匹配和模糊匹配
  let exactMatch = null;
  let fuzzyMatch = null;
  
  // 遍历所有文本节点
  let currentNode;
  while ((currentNode = treeWalker.nextNode())) {
    const content = currentNode.nodeValue;
    
    // 精确匹配
    const exactIndex = content.indexOf(normalizedText);
    if (exactIndex !== -1) {
      // 找到精确匹配文本，创建范围
      const range = document.createRange();
      range.setStart(currentNode, exactIndex);
      range.setEnd(currentNode, exactIndex + normalizedText.length);
      exactMatch = range;
      console.log('找到精确匹配');
      break; // 精确匹配优先，立即返回
    }
    
    // 模糊匹配（如果没有精确匹配）
    // 检查节点文本是否包含搜索文本的大部分（80%以上）
    if (!fuzzyMatch && normalizedText.length > 5) {
      // 只对较长的文本进行模糊匹配
      const normalizedContent = content.trim();
      let matchScore = 0;
      
      // 使用滑动窗口在内容中寻找最佳匹配
      if (normalizedContent.length >= normalizedText.length) {
        for (let i = 0; i <= normalizedContent.length - normalizedText.length; i++) {
          const windowText = normalizedContent.substring(i, i + normalizedText.length);
          const currentScore = calculateSimilarity(windowText, normalizedText);
          
          if (currentScore > matchScore && currentScore > 0.8) { // 80%相似度阈值
            matchScore = currentScore;
            const range = document.createRange();
            range.setStart(currentNode, i);
            range.setEnd(currentNode, i + normalizedText.length);
            fuzzyMatch = range;
          }
        }
      }
    }
  }
  
  // 返回匹配结果，优先返回精确匹配
  if (exactMatch) {
    return exactMatch;
  }
  
  if (fuzzyMatch) {
    console.log('找到模糊匹配');
    return fuzzyMatch;
  }
  
  console.log('未找到匹配文本');
  return null;
}

// 计算两个字符串的相似度 (0-1)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  // 使用Levenshtein距离计算相似度
  const len1 = str1.length;
  const len2 = str2.length;
  
  // 创建矩阵
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }
  
  // 计算相似度
  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  return maxLength > 0 ? 1 - distance / maxLength : 1;
}

// 创建高亮
function createHighlight(selection, range, fallbackText = null) {
  // 获取选中的文本内容，如果selection为空则使用fallbackText
  let selectedText = selection.toString().trim();
  
  // 如果selection为空但有fallbackText，则使用fallbackText
  if ((!selectedText || selectedText.trim().length === 0) && fallbackText) {
    selectedText = fallbackText.trim();
  }
  
  // 如果没有选中文本，则退出
  if (!selectedText || selectedText.trim().length === 0) {
    alert('无法添加笔记：未选中文本');
    return;
  }
  
  // 生成唯一ID
  const highlightId = 'highlight-' + Date.now();
  
  try {
    // 先克隆range以保留原始信息
    const clonedRange = range.cloneRange();
    let highlight = null;
    let highlightSuccessful = false;
    
    // 方法1：使用surroundContents
    try {
      // 创建高亮元素
      highlight = document.createElement('span');
      highlight.className = 'text-highlight';
      highlight.setAttribute('data-highlight-id', highlightId);
      
      // 将选中内容放入高亮元素
      clonedRange.surroundContents(highlight);
      highlightSuccessful = true;
      console.log('方法1成功: surroundContents');
    } catch (error) {
      console.error('方法1失败: surroundContents:', error);
      
      // 方法2：使用extractContents和insertNode
      try {
        if (!highlightSuccessful) {
          // 重新创建高亮元素
          highlight = document.createElement('span');
          highlight.className = 'text-highlight';
          highlight.setAttribute('data-highlight-id', highlightId);
          
          const fragment = range.extractContents();
          highlight.appendChild(fragment);
          range.insertNode(highlight);
          highlightSuccessful = true;
          console.log('方法2成功: extractContents + insertNode');
        }
      } catch (backupError) {
        console.error('方法2失败: extractContents + insertNode:', backupError);
        
        // 方法3：直接替换文本
        try {
          if (!highlightSuccessful) {
            // 重新创建高亮元素
            highlight = document.createElement('span');
            highlight.className = 'text-highlight';
            highlight.setAttribute('data-highlight-id', highlightId);
            
            highlight.textContent = selectedText;
            range.deleteContents();
            range.insertNode(highlight);
            highlightSuccessful = true;
            console.log('方法3成功: deleteContents + insertNode');
          }
        } catch (lastError) {
          console.error('方法3失败: deleteContents + insertNode:', lastError);
          
          // 所有方法都失败
          throw new Error('所有高亮方法都失败');
        }
      }
    }
    
    // 如果高亮成功
    if (highlightSuccessful && highlight) {
      // 清除选区
      selection.removeAllRanges();
      
      // 添加点击事件
      highlight.addEventListener('click', function(e) {
        e.stopPropagation();
        showHighlightMenu(highlight);
      });
      
      // 保存高亮到 LeanCloud
      saveHighlight({
        id: highlightId,
        text: selectedText,
        pageUrl: pageInfo.url,
        pageTitle: pageInfo.title,
        createdAt: new Date()
      }, false); // 传递false参数，表示不刷新笔记列表
      
      // 添加闪烁效果
      highlight.classList.add('highlight-flash');
      setTimeout(() => {
        highlight.classList.remove('highlight-flash');
      }, 2000);
      
      return highlight;
    }
  } catch (error) {
    console.error('创建高亮完全失败:', error);
    
    // 尝试直接保存笔记，即使没有高亮
    try {
      saveHighlight({
        id: highlightId,
        text: selectedText,
        pageUrl: pageInfo.url,
        pageTitle: pageInfo.title,
        createdAt: new Date()
      }, false); // 传递false参数，表示不刷新笔记列表
      alert('高亮失败，但笔记内容已保存');
      console.log('笔记内容已保存');
    } catch (saveError) {
      // 保存也失败
      console.error('保存笔记也失败:', saveError);
      alert('添加笔记失败，请重试');
    }
  }
  
  return null;
}

// 显示高亮菜单
function showHighlightMenu(highlight) {
  // 移除已存在的高亮菜单
  const existingMenu = document.querySelector('.highlight-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  // 获取高亮ID
  const highlightId = highlight.getAttribute('data-highlight-id');
  
  // 创建菜单
  const menu = document.createElement('div');
  menu.className = 'highlight-menu';
  menu.innerHTML = `
    <button class="delete">删除</button>
  `;
  
  // 计算菜单位置
  const rect = highlight.getBoundingClientRect();
  menu.style.left = `${rect.left + window.scrollX}px`;
  menu.style.top = `${rect.bottom + window.scrollY + 10}px`;
  
  // 添加菜单到页面
  document.body.appendChild(menu);
  
  // 删除按钮点击事件
  menu.querySelector('.delete').addEventListener('click', function() {
    deleteHighlight(highlightId, highlight);
    menu.remove();
  });
}

// 保存高亮到 LeanCloud
function saveHighlight(highlightData, refresh = true) {
  // 检查 LeanCloud 配置
  if (!loadLeanCloudConfig()) {
    // 显示配置表单
    showLeanCloudConfigForm(function() {
      // 配置完成后，重新尝试保存
      saveHighlight(highlightData, refresh);
    });
    return;
  }
  
  if (typeof AV === 'undefined') {
    // SDK 未加载，等待加载完成
    setTimeout(() => saveHighlight(highlightData, refresh), 500);
    return;
  }
  
  // 创建 Highlight 类
  const Highlight = AV.Object.extend('Highlight');
  const highlight = new Highlight();
  
  // 设置数据
  highlight.set('highlightId', highlightData.id);
  highlight.set('text', highlightData.text);
  highlight.set('pageUrl', highlightData.pageUrl);
  highlight.set('pageTitle', highlightData.pageTitle);
  highlight.set('userId', getUserId()); // 获取用户ID
  
  // 保存到 LeanCloud
  highlight.save().then(
    (object) => {
      // 刷新笔记列表
      if (refresh) {
        refreshNotesList();
      }
    },
    (error) => {
      // 保存失败
      console.error('保存笔记失败:', error);
    }
  );
}

// 删除高亮
function deleteHighlight(highlightId, highlightElement) {
  // 检查 LeanCloud 配置
  if (!loadLeanCloudConfig()) {
    // 显示配置表单
    showLeanCloudConfigForm(function() {
      // 配置完成后，重新尝试删除
      deleteHighlight(highlightId, highlightElement);
    });
    return;
  }
  
  if (typeof AV === 'undefined') {
    // SDK 未加载，等待加载完成
    setTimeout(() => deleteHighlight(highlightId, highlightElement), 500);
    return;
  }
  
  // 查询要删除的高亮
  const query = new AV.Query('Highlight');
  query.equalTo('highlightId', highlightId);
  query.equalTo('userId', getUserId());
  
  query.find().then(
    (results) => {
      if (results.length > 0) {
        // 删除查询到的对象
        return AV.Object.destroyAll(results);
      }
    }
  ).then(
    () => {
      // 从DOM中移除高亮
      if (highlightElement) {
        const parent = highlightElement.parentNode;
        // 保留文本内容
        const textContent = highlightElement.textContent;
        const textNode = document.createTextNode(textContent);
        parent.replaceChild(textNode, highlightElement);
      }
      
      // 刷新笔记列表
      refreshNotesList();
    },
    (error) => {
      // 删除失败
      console.error('删除笔记失败:', error);
    }
  );
}

// 刷新笔记列表
function refreshNotesList() {
  // 检查 LeanCloud 配置
  if (!loadLeanCloudConfig()) {
    const panelContent = document.querySelector('.notes-panel-content');
    if (panelContent) {
      panelContent.innerHTML = `
        <div class="empty-notes">
          <p>未配置笔记服务</p>
          <button class="config-button">立即配置</button>
        </div>
      `;
      
      // 配置按钮点击事件
      panelContent.querySelector('.config-button').addEventListener('click', function() {
        showLeanCloudConfigForm(function() {
          // 配置完成后刷新笔记列表
          refreshNotesList();
        });
      });
    }
    return;
  }
  
  if (typeof AV === 'undefined') {
    setTimeout(refreshNotesList, 500);
    return;
  }
  
  const panelContent = document.querySelector('.notes-panel-content');
  if (!panelContent) return;
  
  // 清空面板内容
  panelContent.innerHTML = '<div class="loading">加载中...</div>';
  
  // 查询所有笔记
  const query = new AV.Query('Highlight');
  query.equalTo('userId', getUserId());
  query.descending('createdAt');
  
  query.find().then(
    (results) => {
      // 清空加载提示
      panelContent.innerHTML = '';
      
      if (results.length === 0) {
        panelContent.innerHTML = '<div class="empty-notes">暂无笔记</div>';
        return;
      }
      
      // 按页面分组
      const notesByPage = {};
      
      results.forEach((result) => {
        const pageUrl = result.get('pageUrl');
        const pageTitle = result.get('pageTitle');
        
        if (!notesByPage[pageUrl]) {
          notesByPage[pageUrl] = {
            title: pageTitle,
            notes: []
          };
        }
        
        notesByPage[pageUrl].notes.push({
          id: result.id,
          highlightId: result.get('highlightId'),
          text: result.get('text'),
          createdAt: result.get('createdAt')
        });
      });
      
      // 渲染笔记列表
      for (const pageUrl in notesByPage) {
        const pageData = notesByPage[pageUrl];
        
        // 创建笔记列表
        pageData.notes.forEach((note) => {
          const noteItem = document.createElement('div');
          noteItem.className = 'note-item';
          
          // 限制显示的文本长度
          const maxTextLength = 30;
          const displayText = note.text.length > maxTextLength
            ? note.text.substring(0, maxTextLength) + '...'
            : note.text;
          
          noteItem.innerHTML = `
            <div class="note-text">${displayText}</div>
            <div class="note-meta">
              <span>${formatDate(note.createdAt)}</span>
              <div class="note-actions">
                <button class="view-full-note">查看完整</button>
                <button class="delete-note">删除</button>
              </div>
            </div>
          `;
          
          // 点击笔记文本跳转到原文
          noteItem.querySelector('.note-text').addEventListener('click', function() {
            // 如果是当前页面，滚动到高亮位置
            if (pageUrl === pageInfo.url) {
              const highlight = document.querySelector(`[data-highlight-id="${note.highlightId}"]`);
              if (highlight) {
                highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlight.classList.add('highlight-flash');
                setTimeout(() => {
                  highlight.classList.remove('highlight-flash');
                }, 2000);
                
                // 关闭笔记面板
                document.querySelector('.notes-panel').classList.remove('open');
              }
            } else {
              // 如果是其他页面，跳转到该页面
              window.location.href = pageUrl;
            }
          });
          
          // 查看完整笔记按钮
          noteItem.querySelector('.view-full-note').addEventListener('click', function() {
            // 创建模态框
            const modal = document.createElement('div');
            modal.className = 'note-modal';
            modal.innerHTML = `
              <div class="note-modal-content">
                <div class="note-modal-header">
                  <h4>笔记内容</h4>
                  <button class="note-modal-close">×</button>
                </div>
                <div class="note-modal-body">
                  <p>${note.text}</p>
                </div>
              </div>
            `;
            
            // 添加到页面
            document.body.appendChild(modal);
            
            // 关闭按钮
            modal.querySelector('.note-modal-close').addEventListener('click', function() {
              modal.remove();
            });
            
            // 点击模态框背景关闭
            modal.addEventListener('click', function(e) {
              if (e.target === modal) {
                modal.remove();
              }
            });
          });
          
          // 删除笔记按钮
          noteItem.querySelector('.delete-note').addEventListener('click', function() {
            if (confirm('确定要删除这条笔记吗？')) {
              deleteNote(note.id, note.highlightId);
            }
          });
          
          panelContent.appendChild(noteItem);
        });
      }
    },
    (error) => {
      panelContent.innerHTML = '<div class="empty-notes">加载笔记失败</div>';
    }
  );
}

// 删除笔记
function deleteNote(noteId, highlightId) {
  // 检查 LeanCloud 配置
  if (!loadLeanCloudConfig()) {
    // 显示配置表单
    showLeanCloudConfigForm(function() {
      // 配置完成后，重新尝试删除
      deleteNote(noteId, highlightId);
    });
    return;
  }
  
  if (typeof AV === 'undefined') {
    // SDK 未加载，等待加载完成
    setTimeout(() => deleteNote(noteId, highlightId), 500);
    return;
  }
  
  // 获取要删除的笔记
  const highlight = AV.Object.createWithoutData('Highlight', noteId);
  
  // 删除笔记
  highlight.destroy().then(
    () => {
      // 如果是当前页面的笔记，移除高亮
      if (highlightId) {
        const highlightElement = document.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (highlightElement) {
          const parent = highlightElement.parentNode;
          const textContent = highlightElement.textContent;
          const textNode = document.createTextNode(textContent);
          parent.replaceChild(textNode, highlightElement);
        }
      }
      
      // 刷新笔记列表
      refreshNotesList();
    },
    (error) => {
      alert('删除笔记失败');
      console.error('删除笔记失败:', error);
    }
  );
}

// 格式化日期
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前';
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
  }
  
  // 其他情况显示日期
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 获取用户ID
function getUserId() {
  let userId = localStorage.getItem('highlight_user_id');
  
  if (!userId) {
    userId = 'user_' + Date.now();
    localStorage.setItem('highlight_user_id', userId);
  }
  
  return userId;
}

// 加载已保存的高亮
function loadHighlights() {
  // 检查 LeanCloud 配置
  if (!loadLeanCloudConfig()) {
    // 配置不存在，不加载高亮
    return;
  }
  
  if (typeof AV === 'undefined') {
    // 如果 LeanCloud SDK 尚未加载完成，稍后再试
    setTimeout(loadHighlights, 500);
    return;
  }
  
  // 查询当前页面的高亮
  const query = new AV.Query('Highlight');
  query.equalTo('pageUrl', pageInfo.url);
  query.equalTo('userId', getUserId());
  
  query.find().then(
    (results) => {
      results.forEach((result) => {
        const highlightData = {
          id: result.get('highlightId'),
          text: result.get('text')
        };
        
        // 尝试在页面上找到并高亮文本
        applyHighlightToPage(highlightData);
      });
      
      // 刷新笔记列表
      refreshNotesList();
    },
    (error) => {
      // 加载失败
    }
  );
}

// 在页面上应用高亮
function applyHighlightToPage(highlightData) {
  const textToFind = highlightData.text;
  if (!textToFind || textToFind.trim().length === 0) {
    return;
  }
  
  // 获取文章内容区域
  const contentElement = document.querySelector('.article-content') || document.body;
  
  // 创建TreeWalker来遍历文本节点
  const treeWalker = document.createTreeWalker(
    contentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // 跳过脚本和样式标签中的文本
        if (
          node.parentNode.tagName === 'SCRIPT' ||
          node.parentNode.tagName === 'STYLE' ||
          node.parentNode.classList.contains('text-highlight')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  // 用于存储所有文本内容
  let fullText = '';
  const textNodes = [];
  
  // 收集所有文本节点
  let currentNode;
  while ((currentNode = treeWalker.nextNode())) {
    fullText += currentNode.nodeValue;
    textNodes.push({
      node: currentNode,
      start: fullText.length - currentNode.nodeValue.length,
      end: fullText.length
    });
  }
  
  // 在全文中查找目标文本
  const startIndex = fullText.indexOf(textToFind);
  if (startIndex === -1) {
    return;
  }
  
  const endIndex = startIndex + textToFind.length;
  
  // 找到包含目标文本的节点
  const relevantNodes = [];
  for (const nodeInfo of textNodes) {
    if (
      (nodeInfo.start <= startIndex && nodeInfo.end > startIndex) ||
      (nodeInfo.start < endIndex && nodeInfo.end >= endIndex) ||
      (nodeInfo.start >= startIndex && nodeInfo.end <= endIndex)
    ) {
      relevantNodes.push(nodeInfo);
    }
  }
  
  if (relevantNodes.length === 0) {
    return;
  }
  
  try {
    // 如果只有一个节点包含整个文本
    if (relevantNodes.length === 1 && 
        relevantNodes[0].start <= startIndex && 
        relevantNodes[0].end >= endIndex) {
      
      const nodeInfo = relevantNodes[0];
      const node = nodeInfo.node;
      const localStart = startIndex - nodeInfo.start;
      const localEnd = endIndex - nodeInfo.start;
      
      // 创建范围
      const range = document.createRange();
      range.setStart(node, localStart);
      range.setEnd(node, localEnd);
      
      // 创建高亮元素
      const highlight = document.createElement('span');
      highlight.className = 'text-highlight';
      highlight.setAttribute('data-highlight-id', highlightData.id);
      
      // 将选中内容放入高亮元素
      range.surroundContents(highlight);
      
      // 添加点击事件
      highlight.addEventListener('click', function(e) {
        e.stopPropagation();
        showHighlightMenu(highlight);
      });
    } else {
      // 处理跨越多个节点的情况
      // 这种情况比较复杂，需要分段处理
    }
  } catch (error) {
    // 恢复高亮失败
  }
}

// 添加样式
function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* 笔记面板样式 */
    .notes-panel {
      position: fixed;
      top: 0;
      right: -350px;
      width: 350px;
      height: 100%;
      background-color: #fff;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    
    .notes-panel.open {
      right: 0;
    }
    
    .notes-panel-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .notes-panel-header h3 {
      margin: 0;
      font-size: 18px;
    }
    
    .close-panel {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      color: #666;
    }
    
    .notes-panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }
    
    /* 笔记项目样式 */
    .note-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;
    }
    
    .note-text {
      cursor: pointer;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .note-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #888;
    }
    
    .note-actions button {
      background: none;
      border: none;
      color: #3498db;
      cursor: pointer;
      padding: 2px 5px;
      font-size: 12px;
    }
    
    .empty-notes {
      text-align: center;
      color: #888;
      padding: 20px;
    }
    
    /* 高亮样式 */
    .text-highlight {
      background-color: rgba(255, 255, 0, 0.5);
      cursor: pointer;
    }
    
    .highlight-flash {
      animation: flash 2s;
    }
    
    @keyframes flash {
      0% { background-color: rgba(255, 255, 0, 0.5); }
      50% { background-color: rgba(255, 255, 0, 0.9); }
      100% { background-color: rgba(255, 255, 0, 0.5); }
    }
    
    /* 通知样式 */
    .highlight-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(52, 152, 219, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 2000;
      animation: fadeInOut 3s;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(20px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
    
    /* 右键菜单样式 */
    .custom-context-menu {
      position: absolute;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    
    .custom-context-menu-item {
      padding: 8px 12px;
      cursor: pointer;
    }
    
    .custom-context-menu-item:hover {
      background-color: #f5f5f5;
    }
    
    /* 高亮菜单样式 */
    .highlight-menu {
      position: absolute;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding: 5px;
    }
    
    .highlight-menu button {
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      padding: 5px 10px;
    }
    
    /* 模态框样式 */
    .note-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .note-modal-content {
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .note-modal-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .note-modal-header h4 {
      margin: 0;
    }
    
    .note-modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      color: #666;
    }
    
    .note-modal-body {
      padding: 15px;
    }
    
    /* 配置表单样式 */
    #leancloud-config-form {
      margin-bottom: 15px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .submit-btn {
      background-color: #3498db;
      color: #fff;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      width: 100%;
    }
    
    .submit-btn:hover {
      background-color: #2980b9;
    }
    
    .form-help {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      font-size: 13px;
    }
    
    .form-help p {
      margin-bottom: 10px;
      font-weight: bold;
    }
    
    .form-help ol {
      padding-left: 20px;
    }
    
    .form-help li {
      margin-bottom: 5px;
    }
    
    .config-button {
      background-color: #3498db;
      color: #fff;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    
    .config-button:hover {
      background-color: #2980b9;
    }
    
    .loading {
      text-align: center;
      padding: 20px;
      color: #888;
    }
  `;
  document.head.appendChild(style);
} 