// 现代简约风格的JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
  // 搜索功能实现
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const allCourses = document.querySelectorAll('.course-card');
  
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      // 如果搜索框为空，显示所有课程
      allCourses.forEach(course => {
        course.style.display = 'flex';
      });
      
      // 显示所有分类
      document.querySelectorAll('.category-section').forEach(section => {
        section.style.display = 'block';
      });
      
      return;
    }
    
    // 隐藏所有课程
    allCourses.forEach(course => {
      const courseTitle = course.querySelector('a').textContent.toLowerCase();
      if (courseTitle.includes(searchTerm)) {
        course.style.display = 'flex';
      } else {
        course.style.display = 'none';
      }
    });
    
    // 隐藏没有匹配课程的分类
    document.querySelectorAll('.category-section').forEach(section => {
      const visibleCourses = section.querySelectorAll('.course-card[style="display: flex;"]');
      if (visibleCourses.length === 0) {
        section.style.display = 'none';
      } else {
        section.style.display = 'block';
      }
    });
  }
  
  // 搜索按钮点击事件
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  
  // 输入框回车事件
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  // 平滑滚动效果
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // 返回顶部按钮
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'flex';
      } else {
        backToTopButton.style.display = 'none';
      }
    });
    
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // 响应式导航菜单
  const menuToggle = document.getElementById('menu-toggle');
  const categoryNav = document.getElementById('category-nav');
  
  if (menuToggle && categoryNav) {
    menuToggle.addEventListener('click', function() {
      categoryNav.classList.toggle('active');
    });
  }
});
