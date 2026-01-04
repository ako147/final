// 檢查並更新使用者登入狀態的程式碼
        // 檢查使用者登入狀態
        function checkLoginStatus() {
            const currentUser = localStorage.getItem('currentUser');
            const authButtons = document.getElementById('authButtons');
            const userMenu = document.getElementById('userMenu');

            console.log('檢查登入狀態:', currentUser); // 除錯用

            if (currentUser && currentUser !== 'null') {
                try {
                    const user = JSON.parse(currentUser);
                    
                    // 已登入，隱藏登入/註冊按鈕，顯示使用者選單
                    authButtons.style.display = 'none';
                    userMenu.style.display = 'block';
                    
                    // 設定使用者資訊
                    const userName = document.getElementById('userName');
                    const userAvatar = document.getElementById('userAvatar');
                    
                    if (userName && userAvatar) {
                        userName.textContent = user.username;
                        userAvatar.textContent = user.username.charAt(0).toUpperCase();
                    }
                    
                    console.log('已登入使用者:', user.username);
                } catch (e) {
                    console.error('解析使用者資料錯誤:', e);
                    // 如果資料有問題，清除並顯示登入按鈕
                    localStorage.removeItem('currentUser');
                    authButtons.style.display = 'flex';
                    userMenu.style.display = 'none';
                }
            } else {
                // 未登入，顯示登入/註冊按鈕
                authButtons.style.display = 'flex';
                userMenu.style.display = 'none';
                console.log('使用者未登入');
            }
        }

        // 切換下拉選單
        function toggleDropdown() {
            const dropdown = document.getElementById('dropdown');
            dropdown.classList.toggle('show');
        }

        // 登出功能
        function logout() {
            if (confirm('確定要登出嗎？')) {
                localStorage.removeItem('currentUser');
                alert('已成功登出');
                window.location.reload(); // 重新載入頁面
            }
        }

        // 點擊其他地方關閉下拉選單
        document.addEventListener('click', function(event) {
            const userMenu = document.getElementById('userMenu');
            const dropdown = document.getElementById('dropdown');
            
            if (userMenu && !userMenu.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

        // 頁面載入時檢查登入狀態
        document.addEventListener('DOMContentLoaded', function() {
            console.log('頁面載入完成，開始檢查登入狀態');
            checkLoginStatus();
        });

        // 當 localStorage 改變時也檢查
        window.addEventListener('storage', function(e) {
            if (e.key === 'currentUser') {
                console.log('偵測到登入狀態改變');
                checkLoginStatus();
            }
        });
