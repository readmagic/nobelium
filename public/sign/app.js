// 全局变量
let taskTemplates = []; // 打卡目标模板
let dailyTasks = []; // 当天的打卡任务
let categories = ['默认'];
let history = {};
let currentFilter = 'all';
let lastVisitDate = ''; // 记录上次访问日期

// DOM元素
document.addEventListener('DOMContentLoaded', () => {
    // 初始化日期显示
    const today = updateCurrentDate();
    
    // 初始化本地存储数据
    loadFromLocalStorage();
    
    // 检查日期变更，重置每日任务状态
    checkDateChange(today);
    
    // 初始化UI
    renderTasks();
    renderCategories();
    updateCategorySelects();
    renderHistory();
    updateStats();
    
    // 添加事件监听器
    setupEventListeners();
});

// 更新当前日期显示
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('zh-CN', options);
    
    // 返回今天的日期字符串，格式为YYYY-MM-DD
    return now.toISOString().split('T')[0];
}

// 从本地存储加载数据
function loadFromLocalStorage() {
    // 加载任务模板
    const savedTaskTemplates = localStorage.getItem('daily-checkin-task-templates');
    if (savedTaskTemplates) {
        taskTemplates = JSON.parse(savedTaskTemplates);
    }
    
    // 加载当天任务
    const savedDailyTasks = localStorage.getItem('daily-checkin-daily-tasks');
    if (savedDailyTasks) {
        dailyTasks = JSON.parse(savedDailyTasks);
    }
    
    // 加载分类
    const savedCategories = localStorage.getItem('daily-checkin-categories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        // 确保至少有"默认"分类
        categories = ['默认'];
        saveToLocalStorage('categories');
    }
    
    // 加载历史记录
    const savedHistory = localStorage.getItem('daily-checkin-history');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }
    
    // 加载上次访问日期
    lastVisitDate = localStorage.getItem('daily-checkin-last-visit-date') || '';
}

// 检查日期变更，重置每日任务状态
function checkDateChange(today) {
    // 如果今天和上次访问日期不同，重置任务状态
    if (today !== lastVisitDate) {
        // 保存上次访问的任务状态到历史记录
        if (lastVisitDate && dailyTasks.length > 0) {
            history[lastVisitDate] = [...dailyTasks];
            saveToLocalStorage('history');
        }
        
        // 根据模板重新生成今天的任务
        generateDailyTasks(today);
        
        // 更新上次访问日期
        lastVisitDate = today;
        localStorage.setItem('daily-checkin-last-visit-date', today);
    }
}

// 根据模板生成当天任务
function generateDailyTasks(date) {
    // 清空当天任务
    dailyTasks = [];
    
    // 根据模板创建新的每日任务
    taskTemplates.forEach(template => {
        const dailyTask = {
            id: Date.now() + Math.floor(Math.random() * 1000), // 生成唯一ID
            templateId: template.id, // 关联到模板ID
            name: template.name,
            category: template.category,
            completed: false, // 每天重置为未完成
            date: date
        };
        
        dailyTasks.push(dailyTask);
    });
    
    // 保存到本地存储
    saveToLocalStorage('dailyTasks');
}

// 保存数据到本地存储
function saveToLocalStorage(type) {
    switch (type) {
        case 'taskTemplates':
            localStorage.setItem('daily-checkin-task-templates', JSON.stringify(taskTemplates));
            break;
        case 'dailyTasks':
            localStorage.setItem('daily-checkin-daily-tasks', JSON.stringify(dailyTasks));
            break;
        case 'categories':
            localStorage.setItem('daily-checkin-categories', JSON.stringify(categories));
            break;
        case 'history':
            localStorage.setItem('daily-checkin-history', JSON.stringify(history));
            break;
        case 'all':
            localStorage.setItem('daily-checkin-task-templates', JSON.stringify(taskTemplates));
            localStorage.setItem('daily-checkin-daily-tasks', JSON.stringify(dailyTasks));
            localStorage.setItem('daily-checkin-categories', JSON.stringify(categories));
            localStorage.setItem('daily-checkin-history', JSON.stringify(history));
            break;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // 添加任务
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTaskInput = document.getElementById('new-task');
    
    addTaskBtn.addEventListener('click', () => {
        addNewTask();
    });
    
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
    
    // 任务过滤
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterTasks(filter);
            
            // 更新活动按钮
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // 添加分类
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryInput = document.getElementById('new-category');
    
    addCategoryBtn.addEventListener('click', () => {
        addNewCategory();
    });
    
    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewCategory();
        }
    });
    
    // 历史记录筛选
    const historyDateInput = document.getElementById('history-date');
    const historyCategorySelect = document.getElementById('history-category');
    
    historyDateInput.addEventListener('change', () => {
        renderHistory();
    });
    
    historyCategorySelect.addEventListener('change', () => {
        renderHistory();
    });
    
    // 设置今天的日期为历史日期选择器的默认值
    const today = new Date().toISOString().split('T')[0];
    historyDateInput.value = today;
}

// 切换标签页
function switchTab(tabId) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 取消所有标签按钮的活动状态
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(tabId).classList.add('active');
    
    // 设置选中的标签按钮为活动状态
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    
    // 如果切换到历史记录标签，更新统计数据
    if (tabId === 'history') {
        updateStats();
    }
}

// 添加新任务
function addNewTask() {
    const newTaskInput = document.getElementById('new-task');
    const taskCategorySelect = document.getElementById('task-category');
    const taskName = newTaskInput.value.trim();
    const category = taskCategorySelect.value;
    
    if (taskName === '') {
        showToast('请输入任务名称');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // 创建新任务模板
    const newTemplate = {
        id: Date.now(),
        name: taskName,
        category: category
    };
    
    // 添加到任务模板列表
    taskTemplates.push(newTemplate);
    
    // 创建今天的任务实例
    const newDailyTask = {
        id: Date.now() + 1, // 确保ID不同
        templateId: newTemplate.id,
        name: taskName,
        category: category,
        completed: false,
        date: today
    };
    
    // 添加到今日任务列表
    dailyTasks.push(newDailyTask);
    
    // 保存到本地存储
    saveToLocalStorage('taskTemplates');
    saveToLocalStorage('dailyTasks');
    
    // 更新历史记录
    updateHistory(today);
    
    // 清空输入框
    newTaskInput.value = '';
    
    // 重新渲染任务列表
    renderTasks();
    
    // 显示提示
    showToast('任务已添加');
}

// 渲染任务列表
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    // 根据当前过滤器筛选任务
    let filteredTasks = dailyTasks;
    if (currentFilter === 'completed') {
        filteredTasks = dailyTasks.filter(task => task.completed);
    } else if (currentFilter === 'uncompleted') {
        filteredTasks = dailyTasks.filter(task => !task.completed);
    }
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'task-item empty';
        emptyMessage.textContent = currentFilter === 'all' ? '今天还没有添加任务' : '没有符合条件的任务';
        tasksList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', task.id);
        
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <span class="task-name">${task.name}</span>
                <span class="task-category">${task.category}</span>
            </div>
            <div class="task-actions">
                <button class="delete-task-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        tasksList.appendChild(taskItem);
        
        // 添加复选框事件监听器
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            toggleTaskStatus(task.id);
        });
        
        // 添加删除按钮事件监听器
        const deleteBtn = taskItem.querySelector('.delete-task-btn');
        deleteBtn.addEventListener('click', () => {
            deleteTask(task.id);
        });
    });
}

// 切换任务状态
function toggleTaskStatus(taskId) {
    const taskIndex = dailyTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        dailyTasks[taskIndex].completed = !dailyTasks[taskIndex].completed;
        
        // 保存到本地存储
        saveToLocalStorage('dailyTasks');
        
        // 更新历史记录
        const today = new Date().toISOString().split('T')[0];
        updateHistory(today);
        
        // 重新渲染任务列表
        renderTasks();
        
        // 显示提示
        showToast(dailyTasks[taskIndex].completed ? '任务已完成' : '任务已取消完成');
    }
}

// 删除任务
function deleteTask(taskId) {
    // 找到当日任务
    const dailyTaskIndex = dailyTasks.findIndex(task => task.id === taskId);
    
    if (dailyTaskIndex !== -1) {
        // 获取关联的模板ID
        const templateId = dailyTasks[dailyTaskIndex].templateId;
        
        // 从当日任务列表中删除
        const deletedTask = dailyTasks.splice(dailyTaskIndex, 1)[0];
        
        // 从模板列表中删除
        const templateIndex = taskTemplates.findIndex(template => template.id === templateId);
        if (templateIndex !== -1) {
            taskTemplates.splice(templateIndex, 1);
        }
        
        // 保存到本地存储
        saveToLocalStorage('taskTemplates');
        saveToLocalStorage('dailyTasks');
        
        // 更新历史记录
        const today = new Date().toISOString().split('T')[0];
        updateHistory(today);
        
        // 重新渲染任务列表
        renderTasks();
        
        // 显示提示
        showToast(`任务"${deletedTask.name}"已删除`);
    }
}

// 过滤任务
function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();
}

// 添加新分类
function addNewCategory() {
    const newCategoryInput = document.getElementById('new-category');
    const categoryName = newCategoryInput.value.trim();
    
    if (categoryName === '') {
        showToast('请输入分类名称');
        return;
    }
    
    if (categories.includes(categoryName)) {
        showToast('该分类已存在');
        return;
    }
    
    // 添加到分类列表
    categories.push(categoryName);
    
    // 保存到本地存储
    saveToLocalStorage('categories');
    
    // 清空输入框
    newCategoryInput.value = '';
    
    // 重新渲染分类列表
    renderCategories();
    
    // 更新分类选择器
    updateCategorySelects();
    
    // 显示提示
    showToast('分类已添加');
}

// 渲染分类列表
function renderCategories() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'category-item';
        
        // "默认"分类不能删除
        if (category === '默认') {
            categoryItem.innerHTML = `
                <span class="category-name">${category}</span>
                <div class="category-actions">
                    <button class="delete-category-btn" disabled><i class="fas fa-trash"></i></button>
                </div>
            `;
        } else {
            categoryItem.innerHTML = `
                <span class="category-name">${category}</span>
                <div class="category-actions">
                    <button class="delete-category-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // 添加删除按钮事件监听器
            const deleteBtn = categoryItem.querySelector('.delete-category-btn');
            deleteBtn.addEventListener('click', () => {
                deleteCategory(category);
            });
        }
        
        categoriesList.appendChild(categoryItem);
    });
}

// 删除分类
function deleteCategory(categoryName) {
    // 检查是否有任务使用该分类
    const templatesWithCategory = taskTemplates.filter(template => template.category === categoryName);
    
    if (templatesWithCategory.length > 0) {
        // 询问用户是否将这些任务转移到"默认"分类
        if (confirm(`有${templatesWithCategory.length}个任务使用了该分类，删除分类将把这些任务转移到"默认"分类。是否继续？`)) {
            // 将使用该分类的任务模板转移到"默认"分类
            taskTemplates.forEach(template => {
                if (template.category === categoryName) {
                    template.category = '默认';
                }
            });
            
            // 将当日任务也转移到"默认"分类
            dailyTasks.forEach(task => {
                if (task.category === categoryName) {
                    task.category = '默认';
                }
            });
            
            // 从分类列表中删除
            const categoryIndex = categories.indexOf(categoryName);
            if (categoryIndex !== -1) {
                categories.splice(categoryIndex, 1);
            }
            
            // 保存到本地存储
            saveToLocalStorage('all');
            
            // 重新渲染分类列表和任务列表
            renderCategories();
            renderTasks();
            
            // 更新分类选择器
            updateCategorySelects();
            
            // 显示提示
            showToast(`分类"${categoryName}"已删除`);
        }
    } else {
        // 直接删除分类
        const categoryIndex = categories.indexOf(categoryName);
        if (categoryIndex !== -1) {
            categories.splice(categoryIndex, 1);
        }
        
        // 保存到本地存储
        saveToLocalStorage('categories');
        
        // 重新渲染分类列表
        renderCategories();
        
        // 更新分类选择器
        updateCategorySelects();
        
        // 显示提示
        showToast(`分类"${categoryName}"已删除`);
    }
}

// 更新分类选择器
function updateCategorySelects() {
    const taskCategorySelect = document.getElementById('task-category');
    const historyCategorySelect = document.getElementById('history-category');
    
    // 清空选择器
    taskCategorySelect.innerHTML = '';
    historyCategorySelect.innerHTML = '<option value="all">全部分类</option>';
    
    // 添加分类选项
    categories.forEach(category => {
        const taskOption = document.createElement('option');
        taskOption.value = category;
        taskOption.textContent = category;
        taskCategorySelect.appendChild(taskOption);
        
        const historyOption = document.createElement('option');
        historyOption.value = category;
        historyOption.textContent = category;
        historyCategorySelect.appendChild(historyOption);
    });
}

// 更新历史记录
function updateHistory(date) {
    // 更新历史记录
    history[date] = [...dailyTasks];
    
    // 保存到本地存储
    saveToLocalStorage('history');
}

// 渲染历史记录
function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    const historyDateInput = document.getElementById('history-date');
    const historyCategorySelect = document.getElementById('history-category');
    
    const selectedDate = historyDateInput.value;
    const selectedCategory = historyCategorySelect.value;
    
    // 如果没有选择日期，显示空消息
    if (!selectedDate) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'history-item empty';
        emptyMessage.textContent = '请选择日期查看历史记录';
        historyList.appendChild(emptyMessage);
        return;
    }
    
    // 获取选定日期的任务
    const dayTasks = history[selectedDate] || [];
    
    // 根据选定的分类筛选任务
    let filteredTasks = dayTasks;
    if (selectedCategory !== 'all') {
        filteredTasks = dayTasks.filter(task => task.category === selectedCategory);
    }
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'history-item empty';
        emptyMessage.textContent = '没有符合条件的历史记录';
        historyList.appendChild(emptyMessage);
        return;
    }
    
    // 创建历史记录项
    const historyItem = document.createElement('li');
    historyItem.className = 'history-item';
    
    // 格式化日期显示
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    
    historyItem.innerHTML = `
        <div class="history-date">${formattedDate}</div>
        <div class="history-tasks"></div>
    `;
    
    const historyTasks = historyItem.querySelector('.history-tasks');
    
    // 添加任务项
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'history-task';
        
        taskElement.innerHTML = `
            <div class="history-task-status ${task.completed ? 'completed' : 'uncompleted'}"></div>
            <div class="history-task-name">${task.name} <span class="task-category">${task.category}</span></div>
        `;
        
        historyTasks.appendChild(taskElement);
    });
    
    historyList.appendChild(historyItem);
}

// 更新统计数据
function updateStats() {
    const completionRateElement = document.getElementById('completion-rate');
    const streakDaysElement = document.getElementById('streak-days');
    
    // 计算完成率
    let completedCount = 0;
    let totalCount = dailyTasks.length;
    
    if (totalCount > 0) {
        completedCount = dailyTasks.filter(task => task.completed).length;
    }
    
    let completionRate = 0;
    if (totalCount > 0) {
        completionRate = Math.round((completedCount / totalCount) * 100);
    }
    
    completionRateElement.textContent = `${completionRate}%`;
    
    // 计算连续打卡天数
    let streakDays = 0;
    const today = new Date();
    
    // 从今天开始向前检查每一天
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        // 检查该日期是否有任务，且是否有完成的任务
        const dateTasks = history[dateString] || [];
        const dateCompletedTasks = dateTasks.filter(task => task.completed);
        
        if (dateTasks.length > 0 && dateCompletedTasks.length > 0) {
            streakDays++;
        } else if (i > 0) {
            // 如果不是今天，且没有完成的任务，则中断连续计数
            break;
        }
    }
    
    streakDaysElement.textContent = `${streakDays}天`;
}

// 显示提示框
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // 3秒后隐藏提示框
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
