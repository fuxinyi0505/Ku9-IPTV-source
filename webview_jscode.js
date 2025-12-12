(function () {
    const startTime = Date.now();
    let videoElement = null;
    let controlsVisible = false;
    let controlsTimeout = null;

    // 移除默认控制条
    function removeControls() {
        const selectors = [
            '#control_bar', '.controls',
            '.vjs-control-bar', 'xg-controls',
            '.xgplayer-ads', '.fixed-layer',
            'div[style*="z-index: 9999"]',
            '.video-controls', '.player-controls', '.live-controls'
        ];

        selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                element.style.display = 'none';
                element.parentNode?.removeChild(element);
            });
        });
    }

    // 创建控制面板
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'custom-control-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 800px;
            height: 60px;
            background-color: rgba(0,0,0,0.7);
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2147483646;
            transition: opacity 0.3s;
            opacity: 0;
            pointer-events: none;
        `;

        // 进度条
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 90%;
            height: 10px;
            background-color: rgba(255,255,255,0.3);
            border-radius: 5px;
            margin: 5px 0;
            cursor: pointer;
        `;

        const progressBar = document.createElement('div');
        progressBar.id = 'custom-progress-bar';
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background-color: #ff0000;
            border-radius: 5px;
            position: relative;
        `;

        const progressThumb = document.createElement('div');
        progressThumb.style.cssText = `
            width: 15px;
            height: 15px;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            right: -7.5px;
            top: 50%;
            transform: translateY(-50%);
            display: none;
        `;

        progressBar.appendChild(progressThumb);
        progressContainer.appendChild(progressBar);
        panel.appendChild(progressContainer);

        // 控制按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 40px;
        `;

        // 播放/暂停按钮
        const playPauseBtn = document.createElement('div');
        playPauseBtn.id = 'custom-play-pause';
        playPauseBtn.innerHTML = '⏸';
        playPauseBtn.style.cssText = `
            font-size: 24px;
            color: white;
            margin: 0 15px;
            cursor: pointer;
            user-select: none;
        `;

        // 时间显示
        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'custom-time-display';
        timeDisplay.textContent = '00:00 / 00:00';
        timeDisplay.style.cssText = `
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 0 15px;
            user-select: none;
        `;

        buttonsContainer.appendChild(playPauseBtn);
        buttonsContainer.appendChild(timeDisplay);
        panel.appendChild(buttonsContainer);

        document.body.appendChild(panel);

        // 事件监听
        playPauseBtn.addEventListener('click', togglePlayPause);
        progressContainer.addEventListener('click', handleProgressClick);
        progressContainer.addEventListener('mousemove', () => progressThumb.style.display = 'block');
        progressContainer.addEventListener('mouseout', () => progressThumb.style.display = 'none');

        // 鼠标移动显示控制面板
        document.addEventListener('mousemove', showControls);
    }

    // 显示控制面板
    function showControls() {
        const panel = document.getElementById('custom-control-panel');
        if (!panel) return;

        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        controlsVisible = true;

        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            panel.style.opacity = '0';
            panel.style.pointerEvents = 'none';
            controlsVisible = false;
        }, 3000);
    }

    // 切换播放/暂停
    function togglePlayPause() {
        if (!videoElement) return;
        
        if (videoElement.paused) {
            play();
        } else {
            pause();
        }
    }

    // 更新进度条
    function updateProgressBar() {
        if (!videoElement) return;
        
        const progressBar = document.getElementById('custom-progress-bar');
        const timeDisplay = document.getElementById('custom-time-display');
        
        if (progressBar && timeDisplay) {
            const percent = (videoElement.currentTime / videoElement.duration) * 100;
            progressBar.style.width = `${percent}%`;
            
            const currentTime = formatTime(videoElement.currentTime);
            const duration = formatTime(videoElement.duration);
            timeDisplay.textContent = `${currentTime} / ${duration}`;
            
            ku9.setposition(videoElement.currentTime);
            ku9.setduration(videoElement.duration);
        }
    }

    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 处理进度条点击
    function handleProgressClick(e) {
        if (!videoElement) return;
        
        const progressContainer = e.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const seekTime = percent * videoElement.duration;
        
        setposition(seekTime);
    }

    // 设置视频比例
    window.setscale = function (scaletype) {
        if (!videoElement) return;

        const container = videoElement.parentElement;
        const baseStyle = `
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
        `;

        switch (scaletype) {
            case 0: // 默认（填充）
                videoElement.style.cssText = baseStyle + `
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: fill !important;
                `;
                break;

            case 1: // 16:9
                videoElement.style.cssText = baseStyle + `
                    width: 100% !important;
                    height: 100% !important;
                    aspect-ratio: 16 / 9 !important;
                `;
                break;

            case 2: // 4:3
                videoElement.style.cssText = baseStyle + `
                    width: 100% !important;
                    height: 100% !important;
                    aspect-ratio: 4 / 3 !important;
                `;
                break;

            case 3: // 填充
                videoElement.style.cssText = baseStyle + `
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: fill !important;
                `;
                break;

            case 4: // 原始
                videoElement.style.cssText = baseStyle + `
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: none !important;
                `;
                break;

            case 5: // 裁剪
                videoElement.style.cssText = baseStyle + `
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                `;
                break;
        }
    };

    // 设置全屏容器
    function setupVideo(video) {
        videoElement = video;

        const container = document.createElement('div');
        container.id = 'video-fullscreen-container';
        container.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 2147483647 !important;
            background: black !important;
            overflow: hidden !important;
            transform: translateZ(0);
        `;

        // 设置画面比例
        setscale(ku9.getscale());

        document.body.appendChild(container);
        container.appendChild(video);

        // 创建控制面板
        createControlPanel();

        // 设置进度更新定时器
        setInterval(updateProgressBar, 500);

        // 进入全屏模式
        const enterFullscreen = () => {
            const fullscreenElem = container.requestFullscreen
                ? container
                : video;

            const requestFS =
                fullscreenElem.requestFullscreen ||
                fullscreenElem.webkitRequestFullscreen ||
                fullscreenElem.mozRequestFullScreen;

            if (requestFS) {
                requestFS.call(fullscreenElem).catch(() => {
                    container.style.width = `${window.innerWidth}px`;
                    container.style.height = `${window.innerHeight}px`;
                });
            }
            video.volume = 1;
        };

        setTimeout(enterFullscreen, 300);
    }

    // 检测视频元素
    function checkVideo() {
        if (Date.now() - startTime > 15000) {
            clearInterval(interval);
            return;
        }

        const video = document.querySelector('video');
        if (!video) return;

        if (video.paused) video.play();

        if (video && video.readyState > 0) {
            clearInterval(interval);
            removeControls();
            setupVideo(video);

            if (video.videoWidth && video.videoHeight) {
                ku9.setvideo(video.videoWidth, video.videoHeight);
                ku9.setaudio("立体声");
            }
        }
    }

    // 启动检测
    const interval = setInterval(checkVideo, 100);

    // 移动端适配
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = "viewport";
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(viewportMeta);

    // 错误处理
    window.onerror = function (message, source, lineno, colno, error) {
        console.error(`Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError: ${error}`);
    };

    // 视频控制函数
    function pause() {
        if (videoElement) {
            videoElement.pause();
            const btn = document.getElementById('custom-play-pause');
            if (btn) btn.innerHTML = '▶';
        }
    }

    function play() {
        if (videoElement) {
            videoElement.play();
            const btn = document.getElementById('custom-play-pause');
            if (btn) btn.innerHTML = '⏸';
        }
    }

    function setposition(position) {
        if (videoElement) {
            videoElement.currentTime = position;
            updateProgressBar();
        }
    }

    // 暴露函数到全局
    window.pause = pause;
    window.play = play;
    window.setposition = setposition;

})();