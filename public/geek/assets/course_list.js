// 课程列表页脚本
document.addEventListener('DOMContentLoaded', function() {
  // 添加返回顶部功能
  const backToTopButton = document.createElement('div');
  backToTopButton.id = 'back-to-top';
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTopButton);
  
  // 返回顶部按钮样式
  backToTopButton.style.position = 'fixed';
  backToTopButton.style.bottom = '20px';
  backToTopButton.style.right = '20px';
  backToTopButton.style.width = '40px';
  backToTopButton.style.height = '40px';
  backToTopButton.style.backgroundColor = '#3498db';
  backToTopButton.style.color = 'white';
  backToTopButton.style.borderRadius = '50%';
  backToTopButton.style.display = 'flex';
  backToTopButton.style.alignItems = 'center';
  backToTopButton.style.justifyContent = 'center';
  backToTopButton.style.cursor = 'pointer';
  backToTopButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  backToTopButton.style.transition = 'all 0.3s ease';
  backToTopButton.style.display = 'none';
  
  // 监听滚动事件
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = 'flex';
    } else {
      backToTopButton.style.display = 'none';
    }
  });
  
  // 点击返回顶部
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
