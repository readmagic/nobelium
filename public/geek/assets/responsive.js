// 响应式脚本 - 移动端适配与交互增强
document.addEventListener('DOMContentLoaded', function() {
  // 包装内容到容器中
  wrapContent();
  
  // 创建导航菜单按钮和结构
  createMobileNav();
  
  // 创建返回顶部按钮
  createBackToTopButton();
  
  // 处理图片响应式
  makeImagesResponsive();
  
  // 处理表格响应式
  makeTablesResponsive();
  
  // 处理iframe响应式
  makeIframesResponsive();
});

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

// 创建移动导航
function createMobileNav() {
  const body = document.body;
  const container = document.querySelector('.container');
  
  // 创建导航切换按钮
  const navToggle = document.createElement('button');
  navToggle.className = 'nav-toggle';
  navToggle.innerHTML = '&#9776;'; // 汉堡图标
  navToggle.setAttribute('aria-label', '切换导航菜单');
  
  // 创建导航菜单
  const navMenu = document.createElement('nav');
  navMenu.className = 'nav-menu';
  
  // 创建导航覆盖层
  const navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  
  // 查找页面中的所有链接，创建导航菜单内容
  const links = document.querySelectorAll('a');
  const menuLinks = Array.from(links)
    .filter(link => link.textContent && link.textContent.trim() !== '' && !link.querySelector('img'))
    .slice(0, 10); // 只取前10个有文本的链接
  
  if (menuLinks.length > 0) {
    const menuList = document.createElement('ul');
    menuLinks.forEach(link => {
      const listItem = document.createElement('li');
      const newLink = document.createElement('a');
      newLink.href = link.href;
      newLink.textContent = link.textContent;
      listItem.appendChild(newLink);
      menuList.appendChild(listItem);
    });
    navMenu.appendChild(menuList);
  }
  
  // 添加事件监听器
  navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
  });
  
  navOverlay.addEventListener('click', function() {
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
  });
  
  // 将导航元素添加到DOM
  body.insertBefore(navToggle, body.firstChild);
  body.insertBefore(navMenu, body.firstChild);
  body.insertBefore(navOverlay, body.firstChild);
}

// 创建返回顶部按钮
function createBackToTopButton() {
  const backToTop = document.createElement('a');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '&uarr;';
  backToTop.href = '#';
  backToTop.setAttribute('aria-label', '返回顶部');
  
  // 添加事件监听器
  backToTop.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // 监听滚动事件，控制按钮显示/隐藏
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  
  // 添加到DOM
  document.body.appendChild(backToTop);
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

// 添加暗色模式切换
function addDarkModeToggle() {
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = '&#9789;'; // 月亮图标
  darkModeToggle.setAttribute('aria-label', '切换暗色模式');
  
  // 检查用户偏好
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDarkMode = localStorage.getItem('darkMode') === 'true' || prefersDarkMode;
  
  // 初始化状态
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '&#9788;'; // 太阳图标
  }
  
  // 添加事件监听器
  darkModeToggle.addEventListener('click', function() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // 更新图标
    if (isDarkMode) {
      darkModeToggle.innerHTML = '&#9788;'; // 太阳图标
    } else {
      darkModeToggle.innerHTML = '&#9789;'; // 月亮图标
    }
  });
  
  // 添加到DOM
  document.body.appendChild(darkModeToggle);
}
