// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const resultContainer = document.getElementById('resultContainer');
const resultImage = document.getElementById('resultImage');
const processBtn = document.getElementById('processBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');
const loadingOverlay = document.getElementById('loadingOverlay');


const API_URL = 'https://e.oop.fun/api/exam/writingErase';


let currentFile = null;
let resultImageUrl = null;

// 初始化事件监听
function initEventListeners() {
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择变化时处理
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽事件处理
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // 处理按钮点击事件
    processBtn.addEventListener('click', processImage);

    // 重置按钮点击事件
    resetBtn.addEventListener('click', resetUpload);

    // 下载按钮点击事件
    downloadBtn.addEventListener('click', downloadImage);

    // 处理新图片按钮点击事件
    newImageBtn.addEventListener('click', resetAll);
}

// 处理文件选择
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFiles(e.target.files);
    }
}

// 处理文件
function handleFiles(files) {
    const file = files[0];
    
    // 检查是否为图片文件
    if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
    }
    
    currentFile = file;
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// 处理图片
function processImage() {
    if (!currentFile) {
        alert('请先选择一张图片！');
        return;
    }
    
    // 显示加载中
    loadingOverlay.style.display = 'flex';
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', currentFile);
    
    // 发送请求到后端API
    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应异常');
        }
        return response.json();
    })
    .then(data => {
        // 处理API返回结果
        if (data && data.response.msg) {
            resultImageUrl = data.response.msg;
            resultImage.src = resultImageUrl;
            previewContainer.style.display = 'none';
            resultContainer.style.display = 'block';
        } else {
            throw new Error('API返回数据格式异常');
        }
    })
    .catch(error => {
        console.error('处理失败:', error);
        alert('图片处理失败: ' + error.message);
    })
    .finally(() => {
        // 隐藏加载中
        loadingOverlay.style.display = 'none';
    });
}

// 重置上传
function resetUpload() {
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
    fileInput.value = '';
    currentFile = null;
}

// 下载处理后的图片
function downloadImage() {
    if (!resultImageUrl) {
        alert('没有可下载的图片！');
        return;
    }
    
    // 创建一个临时链接并触发下载
    const a = document.createElement('a');
    a.href = resultImageUrl;
    a.download = '擦除后的图片_' + new Date().getTime() + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 重置所有状态
function resetAll() {
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    fileInput.value = '';
    currentFile = null;
    resultImageUrl = null;
}

// 检测设备类型并优化交互
function optimizeForMobile() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 针对移动设备的优化
        document.querySelectorAll('button').forEach(btn => {
            btn.style.padding = '12px 20px';
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    optimizeForMobile();
});
