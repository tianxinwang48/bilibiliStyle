// ==UserScript==
// @name         哔哩哔哩凸显已关注样式
// @namespace    http://tampermonkey.net/
// @version      2025-03-06
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 1. 定义发光样式类（CSS优先，提升性能）
    const GLOW_CLASS = 'bili-card-glow';
    GM_addStyle(`
/* 呼吸灯 + 霓虹光效 */
.bili-card-glow {
    box-shadow: 0 0 25px rgba(255, 68, 0, 0.8), /* 主光晕层 */ 0 0 45px rgba(255, 68, 0, 0.5), /* 扩散层 */ 0 0 65px rgba(255, 68, 0, 0.3); /* 环境光层 */
    position: relative;
    z-index: 9999; /* 最高层级覆盖 */
    transform: scale(1.03);
    animation: breath 1.5s infinite alternate; /* 呼吸动画 */
    border-radius: 12px; /* 圆角增强卡片感 */
}

/* 呼吸动画 */
@keyframes breath {
    from {
        opacity: 0.9;
        transform: scale(1);
    }
    to {
        opacity: 1;
        transform: scale(1.03);
    }
}

/* 霓虹边框 */
.bili-card-glow::after {
    content: "";
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 3px solid;
    border-image: linear-gradient(135deg, #ff4400 30%, #ffaa00 70%) 1;
    filter: drop-shadow(0 0 15px #ff4400);

}
    `);





    // 检查关注状态并应用样式
    const checkFollowStatus = () => {
        document.querySelectorAll('.bili-video-card__info--icon-text').forEach(el => {
            const card = el.closest('.bili-video-card');
            if (card) {
                card.classList.toggle(GLOW_CLASS, el.textContent.trim() === "已关注");
            }
        });
    };

    // 监听动态容器变化
    const observer = new MutationObserver(() => checkFollowStatus());
    const observeContainer = () => {
        const container = document.querySelector('.bili-video-card__wrap');
        if (container) {
            observer.observe(container, {
                childList: true,  // 监听子节点变化
                subtree: true     // 监听所有后代节点
            });
        }
    };

    // 监听换一换按钮点击事件
    const bindRefreshButton = () => {
        document.querySelectorAll('.feed-roll-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // 延迟执行（等待新内容加载完成）
                setTimeout(checkFollowStatus, 500);
            });
        });
    };

    // 滚动监听 + 视口检测
    const init = () => {
        observeContainer();
        checkFollowStatus();
        bindRefreshButton(); // 绑定换一换按钮

        // 滚动节流
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                isScrolling = true;
                checkFollowStatus();
                setTimeout(() => isScrolling = false, 200);
            }
        }, { passive: true });
    };

    // 启动脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 每5秒重新绑定按钮
    setInterval(bindRefreshButton, 5000);
})();
