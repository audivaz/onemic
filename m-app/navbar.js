
// Function to insert the navbar and sidebar
function insertNavbar() {
    // Insert sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="logo">
            <a href="index.html">
                <img src="/assets/images/logo-B.png" alt="Banshee Music Logo">
            </a>
        </div>
        
        <nav class="main-nav">
            <ul>
                <li><a href="index.html"><i class="fas fa-home"></i>Home</a></li>
                <li><a href="explore.html"><i class="fas fa-compass"></i>Explore</a></li>
                <li><a href="library.html"><i class="fas fa-books"></i>Library</a></li>
                <li><a href="player.html"><i class="fas fa-play-circle"></i>Player</a></li>
            </ul>
        </nav>

        <div class="your-music">
            <h3>YOUR MUSIC</h3>
            <ul>
                <li><a href="#"><i class="fas fa-heart"></i>Liked Songs</a></li>
                <li><a href="#"><i class="fas fa-history"></i>Recently Played</a></li>
                <li class="active"><a href="#"><i class="fas fa-list"></i>Your Playlists</a></li>
            </ul>
        </div>
    `;
    
    // Insert top bar
    const topBar = document.createElement('header');
    topBar.className = 'top-bar';
    topBar.innerHTML = `
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search for songs, artists, or albums">
        </div>
        
        <div class="user-controls">
            <button class="notifications" aria-label="Notifications">
                <i class="fas fa-bell"></i>
            </button>
            <button class="settings" aria-label="Settings">
                <i class="fas fa-cog"></i>
            </button>
            <div class="user-profile">
                <img src="/assets/images/profile-icon-B.png" alt="Profile">
                <span>Username</span>
            </div>
        </div>
    `;
    
    // Insert the elements into the DOM
    const appContainer = document.querySelector('.app-container');
    appContainer.insertBefore(sidebar, appContainer.firstChild);
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(topBar, mainContent.firstChild);
}

// Export the function for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { insertNavbar };
}
