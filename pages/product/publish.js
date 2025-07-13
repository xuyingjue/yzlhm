document.addEventListener('DOMContentLoaded', function() {
    // 页面元素引用
    const productForm = document.getElementById('productForm');
    const productTitle = document.getElementById('productTitle');
    const charCount = document.querySelector('.char-count');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const specContainer = document.getElementById('specContainer');
    const addSpecGroup = document.getElementById('addSpecGroup');
    const autoCalculateStock = document.getElementById('autoCalculateStock');
    const totalStock = document.getElementById('totalStock');
    const cropModal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    const closeCropModal = document.getElementById('closeCropModal');
    const confirmCrop = document.getElementById('confirmCrop');
    const cancelCrop = document.getElementById('cancelCrop');

    // 当前编辑的图片索引
    let currentImageIndex = -1;
    // 已上传的图片列表
    let uploadedImages = [];
    // 富文本编辑器内容区域
    const editorContent = document.querySelector('.editor-content');

    // 初始化字符计数
    productTitle.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/30`;
        if (length > 30) {
            this.value = this.value.substring(0, 30);
            charCount.textContent = `30/30`;
        }
    });

    // 初始化图片上传
    function initImageUpload() {
        const uploadInput = document.getElementById('imageUpload');
        const uploadArea = document.querySelector('.upload-area');
        const imagePreview = document.getElementById('imagePreview');
        const cropperModal = document.getElementById('cropperModal');
        const cropperImage = document.getElementById('cropperImage');
        const confirmCropBtn = document.getElementById('confirmCrop');
        const cancelCropBtn = document.getElementById('cancelCrop');
        let cropper;

        // 初始化图片排序
        new Sortable(imagePreview, {
            animation: 150,
            handle: '.image-item-move',
            onEnd: function() {
                updateImageOrder();
            }
        });

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            if (uploadedImages.length >= 9) {
                alert('最多只能上传9张图片');
                return;
            }
            uploadInput.click();
        });

        // 文件选择变化时处理
        uploadInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleImageUpload(files);
            }
        });

        // 阻止拖放默认行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        // 高亮拖放区域
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        // 处理拖放文件
        uploadArea.addEventListener('drop', handleDrop, false);

        // 确认裁剪
        confirmCropBtn.addEventListener('click', () => {
            if (cropper) {
                cropper.getCroppedCanvas().toBlob((blob) => {
                    const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (currentImageIndex === -1) {
                            // 添加新图片
                            uploadedImages.push(e.target.result);
                        } else {
                            // 更新现有图片
                            uploadedImages[currentImageIndex] = e.target.result;
                        }
                        updateImagePreview();
                        cropper.destroy();
                        cropperModal.style.display = 'none';
                        currentImageIndex = -1;
                    };
                    reader.readAsDataURL(file);
                }, 'image/jpeg', 0.9);
            }
        });

        // 取消裁剪
        cancelCropBtn.addEventListener('click', () => {
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            cropperModal.style.display = 'none';
            currentImageIndex = -1;
        });

        // 处理图片上传
        function handleImageUpload(files) {
            if (uploadedImages.length + files.length > 9) {
                alert('最多只能上传9张图片');
                return;
            }

            Array.from(files).forEach(file => {
                if (!file.type.match('image.*')) return;
                const reader = new FileReader();
                reader.onload = function(e) {
                    cropperImage.src = e.target.result;
                    cropperModal.style.display = 'flex';
                    cropper = new Cropper(cropperImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        autoCropArea: 0.8
                    });
                };
                reader.readAsDataURL(file);
            });
        }

        // 处理拖放
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                handleImageUpload(files);
            }
        }

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight() {
            uploadArea.classList.add('highlight');
        }

        function unhighlight() {
            uploadArea.classList.remove('highlight');
        }

        // 更新图片排序
        function updateImageOrder() {
            const items = imagePreview.querySelectorAll('.preview-item');
            const newOrder = [];
            items.forEach(item => {
                const src = item.querySelector('img').src;
                newOrder.push(src);
            });
            uploadedImages = newOrder;
        }
    }

    // 初始化图片上传功能
    initImageUpload();

    // 初始化富文本编辑器
    initRichTextEditor();

    // 初始化富文本编辑器
    function initRichTextEditor() {
        // 富文本编辑器工具栏按钮事件
        const toolbarButtons = document.querySelectorAll('.toolbar button[data-command]');
        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                document.execCommand(command, false, null);
                editorContent.focus();
            });
        });

        // placeholder支持
        editorContent.addEventListener('focus', () => {
            if (editorContent.innerHTML.trim() === '') {
                editorContent.innerHTML = '';
            }
        });

        editorContent.addEventListener('blur', () => {
            if (editorContent.innerHTML.trim() === '') {
                editorContent.innerHTML = '<div class="placeholder">请输入商品详情</div>';
            }
        });

        // 初始化placeholder
        if (editorContent.innerHTML.trim() === '') {
            editorContent.innerHTML = '<div class="placeholder">请输入商品详情</div>';
        }
    }

    // 关闭裁剪模态框
    closeCropModal.addEventListener('click', function() {
        cropModal.style.display = 'none';
    });

    cancelCrop.addEventListener('click', function() {
        cropModal.style.display = 'none';
    });

    // 确认裁剪并添加图片
    confirmCrop.addEventListener('click', function() {
        // 模拟裁剪过程，实际项目中需要集成裁剪库
        const imageUrl = cropImage.src;
        
        if (currentImageIndex === -1) {
            // 添加新图片
            uploadedImages.push(imageUrl);
        } else {
            // 更新现有图片
            uploadedImages[currentImageIndex] = imageUrl;
        }

        updateImagePreview();
        cropModal.style.display = 'none';
    });

    // 更新图片预览
    function updateImagePreview() {
        imagePreview.innerHTML = '';
        uploadedImages.forEach((src, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${src}" class="preview-img">
                <div class="remove-img" data-index="${index}">&times;</div>
            `;
            imagePreview.appendChild(previewItem);
        });

        // 添加删除图片事件监听
        document.querySelectorAll('.remove-img').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                uploadedImages.splice(index, 1);
                updateImagePreview();
            });
        });
    }

    // 添加规格组
    addSpecGroup.addEventListener('click', function() {
        const specGroup = document.createElement('div');
        specGroup.className = 'spec-group';
        specGroup.innerHTML = `
            <div class="spec-header">
                <input type="text" class="form-input spec-name" placeholder="规格名称（如：颜色）">
                <button type="button" class="btn-remove-spec">删除</button>
            </div>
            <div class="spec-values">
                <div class="spec-value-item">
                    <input type="text" class="form-input spec-value" placeholder="规格值（如：红色）">
                    <input type="number" class="form-input spec-price" placeholder="价格" min="0" step="0.01">
                    <input type="number" class="form-input spec-stock" placeholder="库存" min="0" oninput="calculateTotalStock()">
                    <button type="button" class="btn-remove-value">-</button>
                </div>
                <button type="button" class="btn-add-value">+ 添加规格值</button>
            </div>
        `;
        specContainer.appendChild(specGroup);

        // 绑定删除规格组事件
        specGroup.querySelector('.btn-remove-spec').addEventListener('click', function() {
            specGroup.remove();
            if (autoCalculateStock.checked) {
                calculateTotalStock();
            }
        });

        // 绑定添加规格值事件
        specGroup.querySelector('.btn-add-value').addEventListener('click', function() {
            const valueItem = document.createElement('div');
            valueItem.className = 'spec-value-item';
            valueItem.innerHTML = `
                <input type="text" class="form-input spec-value" placeholder="规格值（如：红色）">
                <input type="number" class="form-input spec-price" placeholder="价格" min="0" step="0.01">
                <input type="number" class="form-input spec-stock" placeholder="库存" min="0" oninput="calculateTotalStock()">
                <button type="button" class="btn-remove-value">-</button>
            `;
            specGroup.querySelector('.spec-values').insertBefore(valueItem, this);

            // 绑定删除规格值事件
            valueItem.querySelector('.btn-remove-value').addEventListener('click', function() {
                valueItem.remove();
                if (autoCalculateStock.checked) {
                    calculateTotalStock();
                }
            });

            // 绑定库存输入事件
            valueItem.querySelector('.spec-stock').addEventListener('input', function() {
                if (autoCalculateStock.checked) {
                    calculateTotalStock();
                }
            });
        });

        // 绑定库存输入事件
        specGroup.querySelectorAll('.spec-stock').forEach(input => {
            input.addEventListener('input', function() {
                if (autoCalculateStock.checked) {
                    calculateTotalStock();
                }
            });
        });
    });

    // 自动计算库存
    autoCalculateStock.addEventListener('change', function() {
        if (this.checked) {
            totalStock.disabled = true;
            calculateTotalStock();
        } else {
            totalStock.disabled = false;
        }
    });

    // 计算总库存
    function calculateTotalStock() {
        let total = 0;
        document.querySelectorAll('.spec-stock').forEach(input => {
            const value = parseInt(input.value) || 0;
            total += value;
        });
        totalStock.value = total;
    }

    // 表单提交处理
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 表单验证
        if (!validateForm()) {
            return;
        }

        // 收集表单数据
        const formData = collectFormData();

        // 模拟提交到后端
        submitProduct(formData);
    });

    // 表单验证
function validateForm() {
    let isValid = true;
    const title = productTitle.value.trim();
    const category = document.getElementById('categorySelect').value;
    const shipping = document.getElementById('shippingTemplate').value;
    const detail = editorContent.innerHTML.trim();

    // 验证商品标题
    if (!title) {
        alert('请输入商品标题');
        isValid = false;
    } else if (title.length > 30) {
        alert('商品标题不能超过30字');
        isValid = false;
    }

    // 验证商品图片
    if (uploadedImages.length === 0) {
        alert('请上传至少一张商品图片');
        isValid = false;
    }

    // 验证商品分类
    if (!category) {
        alert('请选择商品分类');
        isValid = false;
    }

    // 验证运费模板
    if (!shipping) {
        alert('请选择运费模板');
        isValid = false;
    }

    // 验证商品详情
    if (!detail) {
        alert('请输入商品详情');
        isValid = false;
    }

    // 验证规格设置
    const specGroups = document.querySelectorAll('.spec-group');
    if (specGroups.length > 0) {
        specGroups.forEach(group => {
            const specName = group.querySelector('.spec-name').value.trim();
            const specValues = group.querySelectorAll('.spec-value-item');

            if (!specName) {
                alert('请填写规格名称');
                isValid = false;
                return;
            }

            if (specValues.length === 0) {
                alert('请为规格添加至少一个规格值');
                isValid = false;
                return;
            }

            specValues.forEach(item => {
                const value = item.querySelector('.spec-value').value.trim();
                const price = item.querySelector('.spec-price').value.trim();
                const stock = item.querySelector('.spec-stock').value.trim();

                if (!value) {
                    alert('请填写规格值');
                    isValid = false;
                }
                if (!price || isNaN(price) || parseFloat(price) < 0) {
                    alert('请填写有效的价格');
                    isValid = false;
                }
                if (!stock || isNaN(stock) || parseInt(stock) < 0) {
                    alert('请填写有效的库存数量');
                    isValid = false;
                }
            });
        });
    }

    // 验证库存总量
    if (!autoCalculateStock.checked) {
        const stock = totalStock.value.trim();
        if (!stock || isNaN(stock) || parseInt(stock) < 0) {
            alert('请填写有效的库存总量');
            isValid = false;
        }
    }

    return isValid;
}

    // 收集表单数据
    function collectFormData() {
        // 收集规格数据
        const specs = [];
        document.querySelectorAll('.spec-group').forEach(group => {
            const specName = group.querySelector('.spec-name').value.trim();
            if (!specName) return;

            const specValues = [];
            group.querySelectorAll('.spec-value-item').forEach(item => {
                const value = item.querySelector('.spec-value').value.trim();
                const price = item.querySelector('.spec-price').value.trim();
                const stock = item.querySelector('.spec-stock').value.trim();

                if (value && price && stock) {
                    specValues.push({
                        name: value,
                        price: parseFloat(price),
                        stock: parseInt(stock)
                    });
                }
            });

            if (specValues.length > 0) {
                specs.push({
                    name: specName,
                    values: specValues
                });
            }
        });

        return {
            title: productTitle.value.trim(),
            images: uploadedImages,
            category: document.getElementById('categorySelect').value,
            shippingTemplate: document.getElementById('shippingTemplate').value,
            totalStock: parseInt(totalStock.value),
            details: document.querySelector('.editor-content').innerHTML.trim(),
            specs: specs
        };
    }

    // 提交商品数据
    function submitProduct(data) {
        // 转换图片为FormData
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('category', data.category);
        formData.append('shippingTemplate', data.shippingTemplate);
        formData.append('totalStock', data.totalStock);
        formData.append('details', data.details);
        formData.append('specs', JSON.stringify(data.specs));

        // 添加图片
        data.images.forEach((image, index) => {
            // 将base64转换为Blob
            const blob = base64ToBlob(image);
            formData.append(`images[${index}]`, blob, `product_${Date.now()}_${index}.jpg`);
        });

        fetch('/api/products', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('发布失败');
            return response.json();
        })
        .then(result => {
            alert('商品发布成功');
            window.location.href = '/pages/product/management.html';
        })
        .catch(error => {
            console.error('发布商品失败:', error);
            alert('发布商品失败: ' + error.message);
        });
    }

    // 辅助函数: base64转Blob
    function base64ToBlob(base64String) {
        const parts = base64String.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

    // 获取认证token
    function getToken() {
        return localStorage.getItem('auth_token') || '';
    }

    // 初始化第一个规格组的事件监听
    document.querySelectorAll('.btn-remove-spec').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.spec-group').remove();
            if (autoCalculateStock.checked) {
                calculateTotalStock();
            }
        });
    });

    document.querySelectorAll('.btn-add-value').forEach(btn => {
        btn.addEventListener('click', function() {
            const valueItem = document.createElement('div');
            valueItem.className = 'spec-value-item';
            valueItem.innerHTML = `
                <input type="text" class="form-input spec-value" placeholder="规格值（如：红色）">
                <input type="number" class="form-input spec-price" placeholder="价格">
                <input type="number" class="form-input spec-stock" placeholder="库存">
                <button type="button" class="btn-remove-value">-</button>
            `;
            this.parentNode.insertBefore(valueItem, this);

            // 绑定删除规格值事件
            valueItem.querySelector('.btn-remove-value').addEventListener('click', function() {
                valueItem.remove();
                if (autoCalculateStock.checked) {
                    calculateTotalStock();
                }
            });

            // 绑定库存输入事件
            valueItem.querySelector('.spec-stock').addEventListener('input', function() {
                if (autoCalculateStock.checked) {
                    calculateTotalStock();
                }
            });
        });
    });

    document.querySelectorAll('.btn-remove-value').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.spec-value-item').remove();
            if (autoCalculateStock.checked) {
                calculateTotalStock();
            }
        });
    });

    document.querySelectorAll('.spec-stock').forEach(input => {
        input.addEventListener('input', function() {
            if (autoCalculateStock.checked) {
                calculateTotalStock();
            }
        });
    });
});