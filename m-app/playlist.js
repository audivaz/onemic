class PlaylistManager {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadSongs();
        this.selectedSongs = new Set();
    }

    initializeElements() {
        this.playlistName = document.getElementById('playlist-name');
        this.playlistDescription = document.querySelector('.playlist-description');
        this.songsContainer = document.getElementById('songs-container');
        this.sortSelect = document.querySelector('.sort-select');
        this.playAllBtn = document.querySelector('.play-all');
        this.shuffleBtn = document.querySelector('.shuffle-play');
        this.moreOptionsBtn = document.querySelector('.more-options');
        this.songsList = this.songsContainer; // Alias for compatibility
        this.filterType = { value: 'all' }; // Default value
        this.songCount = document.querySelector('.song-count');
        this.duration = document.querySelector('.duration');

        // Selection toolbar elements
        this.selectionToolbar = document.querySelector('.selection-toolbar');
        this.selectAllCheckbox = document.getElementById('select-all');
        this.selectedCountElement = document.getElementById('selected-count');
        this.selectionActions = document.querySelectorAll('.selection-action');

        // Analytics elements
        this.refreshAnalyticsBtn = document.querySelector('.refresh-analytics-btn');

        // Share elements
        this.shareBtn = document.querySelector('.share-playlist');
        this.shareModal = document.getElementById('share-modal');
        this.closeModalBtn = this.shareModal ? this.shareModal.querySelector('.close-btn') : null;
        this.copyLinkBtn = this.shareModal ? this.shareModal.querySelector('.copy-link-btn') : null;
        this.sharePlatformBtns = this.shareModal ? this.shareModal.querySelectorAll('.share-platform-btn') : null;
    }

    initializeEventListeners() {
        this.playlistName.addEventListener('blur', () => this.handlePlaylistNameChange());
        this.playlistDescription.addEventListener('blur', () => this.handleDescriptionChange());
        this.sortSelect.addEventListener('change', () => this.handleSort());
        this.playAllBtn.addEventListener('click', () => this.handlePlayAll());
        this.shuffleBtn.addEventListener('click', () => this.handleShuffle());
        this.moreOptionsBtn.addEventListener('click', () => this.showOptionsMenu());

        // Selection toolbar event listeners
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll());
        }

        if (this.selectionActions) {
            this.selectionActions.forEach(action => {
                action.addEventListener('click', (e) => this.handleSelectionAction(e.currentTarget.dataset.action));
            });
        }

        // Analytics event listeners
        if (this.refreshAnalyticsBtn) {
            this.refreshAnalyticsBtn.addEventListener('click', () => this.refreshAnalytics());
        }

        // Share functionality event listeners
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => this.openShareModal());
        }

        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeShareModal());
        }

        if (this.copyLinkBtn) {
            this.copyLinkBtn.addEventListener('click', () => this.copyShareLink());
        }

        if (this.sharePlatformBtns) {
            this.sharePlatformBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const platform = btn.classList[1]; // facebook, twitter, etc.
                    this.shareToSocialMedia(platform);
                });
            });
        }

        // Make songs container sortable
        new Sortable(this.songsContainer, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: () => this.updateSongOrder()
        });
    }

    loadSongs() {
        // Show skeleton loaders while loading
        this.showSkeletonLoaders();

        // Simulate loading songs from an API
        setTimeout(() => {
            const sampleSongs = [
                { id: 1, title: 'Neon Dreams', artist: 'Cyber Collective', album: 'Digital Horizons', duration: '3:45' },
                { id: 2, title: 'Electric Soul', artist: 'Synthwave Sisters', album: 'Retrowave', duration: '4:12' },
                { id: 3, title: 'Midnight Drive', artist: 'Neon Riders', album: 'Night City', duration: '3:28' },
                { id: 4, title: 'Cyber Dawn', artist: 'Digital Pulse', album: 'Future State', duration: '5:01' },
                { id: 5, title: 'Quantum Leap', artist: 'Tech Mavericks', album: 'Beyond Reality', duration: '4:35' },
                { id: 6, title: 'Stellar Voyage', artist: 'Cosmic Waves', album: 'Interstellar', duration: '3:56' },
                { id: 7, title: 'Binary Sunset', artist: 'Code Runners', album: 'Algorithm', duration: '4:22' },
                { id: 8, title: 'Virtual Reality', artist: 'Digital Pulse', album: 'Future State', duration: '3:47' }
            ];

            // For testing empty state, uncomment this line
            // sampleSongs.length = 0;

            if (sampleSongs.length > 0) {
                this.renderSongs(sampleSongs);
                this.updatePlaylistStats(sampleSongs);
                this.showToast('Playlist loaded successfully', 'success');
            } else {
                this.showEmptyState();
                this.updatePlaylistStats([]);
            }
        }, 1500); // Longer timeout to show skeleton loaders
    }

    renderSongs(songs) {
        this.songsContainer.innerHTML = '';

        songs.forEach((song, index) => {
            // Add additional metadata for enhanced song details
            song.genre = song.genre || this.getRandomGenre();
            song.releaseDate = song.releaseDate || this.getRandomReleaseDate();
            song.bpm = song.bpm || this.getRandomBPM();
            song.key = song.key || this.getRandomKey();

            const songElement = document.createElement('div');
            songElement.className = 'song-item';
            songElement.dataset.id = song.id;
            songElement.innerHTML = `
                <div class="song-number">
                    <input type="checkbox" class="song-checkbox" aria-label="Select song">
                    <span>${index + 1}</span>
                </div>
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
                <div class="song-album">${song.album}</div>
                <div class="song-duration">${song.duration}</div>

                <!-- Enhanced Song Details (hidden by default) -->
                <div class="song-details">
                    <div class="song-waveform"></div>
                    <div class="song-metadata">
                        <div class="metadata-row">
                            <div class="metadata-item">
                                <span class="metadata-label">Genre</span>
                                <span class="metadata-value">${song.genre}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">Release Date</span>
                                <span class="metadata-value">${song.releaseDate}</span>
                            </div>
                        </div>
                        <div class="metadata-row">
                            <div class="metadata-item">
                                <span class="metadata-label">BPM</span>
                                <span class="metadata-value">${song.bpm}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">Key</span>
                                <span class="metadata-value">${song.key}</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="preview-button">
                        <i class="fas fa-headphones"></i> Preview
                    </button>
                </div>
            `;

            // Add checkbox event listener
            const checkbox = songElement.querySelector('.song-checkbox');
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation(); // Prevent triggering song click
                this.toggleSongSelection(song.id, checkbox);
            });

            // Add double-click event for expanding song details
            songElement.addEventListener('dblclick', (e) => {
                // Don't expand if checkbox was clicked
                if (!e.target.closest('.song-checkbox')) {
                    this.toggleSongDetails(songElement);
                }
            });

            // Add click event for playing the song
            songElement.addEventListener('click', (e) => {
                // Don't play the song if checkbox was clicked
                if (!e.target.closest('.song-checkbox') && !e.target.closest('.song-details') && !e.target.closest('.preview-button')) {
                    this.handleSongClick(songElement);
                }
            });

            // Add preview button event listener
            const previewButton = songElement.querySelector('.preview-button');
            if (previewButton) {
                previewButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering song click
                    this.previewSong(song);
                });
            }

            this.songsContainer.appendChild(songElement);
        });
    }

    updatePlaylistStats(songs) {
        this.songCount.textContent = `${songs.length} songs`;

        // Calculate total duration
        let totalMinutes = 0;
        songs.forEach(song => {
            const [minutes, seconds] = song.duration.split(':').map(Number);
            totalMinutes += minutes + seconds / 60;
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);

        this.duration.textContent = hours > 0 ?
            `${hours} hr ${minutes} min` :
            `${minutes} min`;
    }

    handleSongClick(songElement) {
        const songId = songElement.dataset.id;
        const songIndex = Array.from(this.songsContainer.children).indexOf(songElement);

        // Remove playing class from all songs
        this.songsContainer.querySelectorAll('.song-item').forEach(s =>
            s.classList.remove('playing'));

        // Add playing class to clicked song with animation
        songElement.classList.add('playing');
        songElement.style.transform = 'scale(1.01)';
        setTimeout(() => {
            songElement.style.transform = 'scale(1)';
        }, 200);

        // Update play button
        this.playAllBtn.innerHTML = `
            <i class="fas fa-pause"></i>
            Pause
        `;

        // Connect with player.js
        if (typeof playTrack === 'function') {
            playTrack(songIndex);
        } else {
            console.log('Playing song:', songId);
            this.showToast(`Playing: ${songElement.querySelector('.song-title').textContent}`);
        }
    }

    handlePlaylistNameChange() {
        const newName = this.playlistName.textContent.trim();
        if (!newName) {
            this.playlistName.textContent = 'My Playlist';
        }

        // Add animation
        this.playlistName.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.playlistName.style.transform = 'scale(1)';
        }, 200);

        this.showToast('Playlist name updated', 'success');
    }

    handleDescriptionChange() {
        const newDescription = this.playlistDescription.textContent.trim();
        if (!newDescription) {
            this.playlistDescription.textContent = 'No description';
        }
        this.showToast('Playlist description updated');
    }

    handlePlayAll() {
        // Start playing from the first song
        const firstSong = this.songsContainer.querySelector('.song-item');
        if (firstSong) {
            this.handleSongClick(firstSong);
        }
        this.showToast('Playing all songs');
    }

    handleShuffle() {
        // Get a random song and play it
        const songs = this.songsContainer.querySelectorAll('.song-item');
        if (songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            this.handleSongClick(songs[randomIndex]);
        }
        this.showToast('Shuffling playlist');
    }

    handleShare() {
        // Implementation for sharing functionality
        this.showToast('Share dialog opened');
    }

    toggleSelectAll() {
        const isChecked = this.selectAllCheckbox.checked;
        const songItems = document.querySelectorAll('.song-item');

        songItems.forEach(item => {
            const songId = parseInt(item.dataset.id);
            const checkbox = item.querySelector('input[type="checkbox"]');

            if (checkbox) {
                checkbox.checked = isChecked;

                if (isChecked) {
                    this.selectedSongs.add(songId);
                } else {
                    this.selectedSongs.delete(songId);
                }
            }
        });

        this.updateSelectionToolbar();
    }

    toggleSongSelection(songId, checkbox) {
        if (checkbox.checked) {
            this.selectedSongs.add(songId);
        } else {
            this.selectedSongs.delete(songId);
        }

        this.updateSelectionToolbar();
    }

    updateSelectionToolbar() {
        const selectedCount = this.selectedSongs.size;

        if (selectedCount > 0) {
            this.selectionToolbar.hidden = false;
            this.selectedCountElement.textContent = selectedCount;

            // Update select all checkbox state
            const totalSongs = document.querySelectorAll('.song-item').length;
            this.selectAllCheckbox.checked = selectedCount === totalSongs;
            this.selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalSongs;
        } else {
            this.selectionToolbar.hidden = true;
        }
    }

    handleSelectionAction(action) {
        const selectedIds = Array.from(this.selectedSongs);

        switch(action) {
            case 'play':
                console.log(`Playing ${selectedIds.length} selected songs`);
                this.showToast('Playing selected songs', 'success');
                break;

            case 'add':
                console.log(`Adding ${selectedIds.length} songs to playlist`);
                this.showToast('Add to playlist feature coming soon', 'info');
                break;

            case 'remove':
                console.log(`Removing ${selectedIds.length} songs from playlist`);
                this.showToast('Songs removed from playlist', 'info');

                // Remove selected songs from DOM
                selectedIds.forEach(id => {
                    const songElement = document.querySelector(`.song-item[data-id="${id}"]`);
                    if (songElement) {
                        songElement.remove();
                    }
                });

                // Clear selection
                this.selectedSongs.clear();
                this.updateSelectionToolbar();
                break;
        }
    }

    handleFilterChange() {
        this.handleSearch({ target: this.searchInput });
    }

    updateSongNumbers() {
        Array.from(this.songsList.children).forEach((song, index) => {
            const numberEl = song.querySelector('.song-number');
            numberEl.textContent = (index + 1).toString().padStart(2, '0');
        });
    }

    updateSongOrder() {
        // Update song numbers after drag and drop
        this.updateSongNumbers();
        this.showToast('Playlist order updated');
    }

    handleSort() {
        const sortType = this.sortSelect.value;
        const songs = Array.from(this.songsContainer.children);

        songs.sort((a, b) => {
            const aTitle = a.querySelector('.song-title').textContent;
            const bTitle = b.querySelector('.song-title').textContent;
            const aArtist = a.querySelector('.song-artist').textContent;
            const bArtist = b.querySelector('.song-artist').textContent;
            const aAlbum = a.querySelector('.song-album').textContent;
            const bAlbum = b.querySelector('.song-album').textContent;

            switch(sortType) {
                case 'title':
                    return aTitle.localeCompare(bTitle);
                case 'artist':
                    return aArtist.localeCompare(bArtist);
                case 'album':
                    return aAlbum.localeCompare(bAlbum);
                default:
                    return 0; // Keep original order for 'recent'
            }
        });

        // Re-append in sorted order
        songs.forEach(song => this.songsContainer.appendChild(song));
        this.updateSongNumbers();
        this.showToast(`Sorted by ${this.sortSelect.options[this.sortSelect.selectedIndex].text}`);
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Helper methods for song details
    getRandomGenre() {
        const genres = ['Electronic', 'Pop', 'Hip Hop', 'Rock', 'R&B', 'Jazz', 'Classical', 'Indie', 'Dance', 'Alternative'];
        return genres[Math.floor(Math.random() * genres.length)];
    }

    getRandomReleaseDate() {
        const year = 2010 + Math.floor(Math.random() * 14); // 2010-2023
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        return `${month}/${day}/${year}`;
    }

    getRandomBPM() {
        return 70 + Math.floor(Math.random() * 110); // 70-180 BPM
    }

    getRandomKey() {
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const modes = ['maj', 'min'];
        const key = keys[Math.floor(Math.random() * keys.length)];
        const mode = modes[Math.floor(Math.random() * modes.length)];
        return `${key} ${mode}`;
    }

    toggleSongDetails(songElement) {
        // Close any other expanded songs
        const expandedSongs = this.songsContainer.querySelectorAll('.song-item.expanded');
        expandedSongs.forEach(song => {
            if (song !== songElement) {
                song.classList.remove('expanded');
            }
        });

        // Toggle the expanded state of the clicked song
        songElement.classList.toggle('expanded');
    }

    previewSong(song) {
        // In a real app, this would play a preview of the song
        this.showToast(`Playing preview of "${song.title}" by ${song.artist}`, 'info');

        // Simulate playing a preview
        const audio = new Audio();
        audio.volume = 0.5;
        audio.src = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'; // Placeholder sound
        audio.play().catch(e => console.log('Audio preview failed:', e));
    }

    refreshAnalytics() {
        // Add a loading animation to the button
        this.refreshAnalyticsBtn.classList.add('loading');
        this.refreshAnalyticsBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Updating...';

        // Simulate API call delay
        setTimeout(() => {
            // Update analytics with random data
            const analyticsCards = document.querySelectorAll('.analytics-card');

            // Update total plays
            const playsCard = analyticsCards[0];
            if (playsCard) {
                const valueEl = playsCard.querySelector('.analytics-value');
                const trendEl = playsCard.querySelector('.analytics-trend');
                if (valueEl && trendEl) {
                    const currentPlays = parseInt(valueEl.textContent.replace(/,/g, ''));
                    const newPlays = currentPlays + Math.floor(Math.random() * 100);
                    valueEl.textContent = newPlays.toLocaleString();

                    const trend = Math.floor(Math.random() * 20);
                    trendEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${trend}% this week`;
                    trendEl.className = 'analytics-trend positive';
                }
            }

            // Update listening time
            const timeCard = analyticsCards[1];
            if (timeCard) {
                const valueEl = timeCard.querySelector('.analytics-value');
                const trendEl = timeCard.querySelector('.analytics-trend');
                if (valueEl && trendEl) {
                    const hours = 32 + Math.floor(Math.random() * 10);
                    const minutes = Math.floor(Math.random() * 60);
                    valueEl.textContent = `${hours}h ${minutes}m`;

                    const trend = Math.floor(Math.random() * 15);
                    trendEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${trend}% this week`;
                    trendEl.className = 'analytics-trend positive';
                }
            }

            // Update likes
            const likesCard = analyticsCards[2];
            if (likesCard) {
                const valueEl = likesCard.querySelector('.analytics-value');
                const trendEl = likesCard.querySelector('.analytics-trend');
                if (valueEl && trendEl) {
                    const currentLikes = parseInt(valueEl.textContent);
                    const newLikes = currentLikes + Math.floor(Math.random() * 10);
                    valueEl.textContent = newLikes;

                    const trend = Math.floor(Math.random() * 10);
                    const isPositive = Math.random() > 0.3;
                    if (isPositive) {
                        trendEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${trend}% this week`;
                        trendEl.className = 'analytics-trend positive';
                    } else {
                        trendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${trend}% this week`;
                        trendEl.className = 'analytics-trend negative';
                    }
                }
            }

            // Update shares
            const sharesCard = analyticsCards[3];
            if (sharesCard) {
                const valueEl = sharesCard.querySelector('.analytics-value');
                const trendEl = sharesCard.querySelector('.analytics-trend');
                if (valueEl && trendEl) {
                    const currentShares = parseInt(valueEl.textContent);
                    const newShares = currentShares + Math.floor(Math.random() * 5);
                    valueEl.textContent = newShares;

                    const trend = Math.floor(Math.random() * 8);
                    const isPositive = Math.random() > 0.5;
                    if (isPositive) {
                        trendEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${trend}% this week`;
                        trendEl.className = 'analytics-trend positive';
                    } else {
                        trendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${trend}% this week`;
                        trendEl.className = 'analytics-trend negative';
                    }
                }
            }

            // Update chart bars with new random values
            const chartBars = document.querySelectorAll('.chart-bar');
            chartBars.forEach(bar => {
                const valueEl = bar.querySelector('.chart-value');
                if (valueEl) {
                    const currentPlays = parseInt(valueEl.textContent);
                    const newPlays = currentPlays + Math.floor(Math.random() * 20);
                    valueEl.textContent = `${newPlays} plays`;
                }
            });

            // Reset button state
            this.refreshAnalyticsBtn.classList.remove('loading');
            this.refreshAnalyticsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';

            // Show success message
            this.showToast('Analytics updated successfully', 'success');
        }, 1500);
    }

    // Share Modal Methods
    openShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling

            // Update share link with current playlist name
            const shareLink = document.getElementById('share-link');
            const playlistName = this.playlistName.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            if (shareLink) {
                shareLink.value = `https://banshee.music/playlist/${playlistName}`;
            }

            // Update embed code with current playlist name
            const embedCode = document.getElementById('embed-code');
            if (embedCode) {
                embedCode.value = `<iframe src="https://banshee.music/embed/playlist/${playlistName}" width="300" height="380" frameborder="0"></iframe>`;
            }

            this.showToast('Share your playlist with friends!', 'info');
        }
    }

    closeShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    copyShareLink() {
        const shareLink = document.getElementById('share-link');
        if (shareLink) {
            shareLink.select();
            document.execCommand('copy');
            this.showToast('Link copied to clipboard!', 'success');

            // Deselect the text
            window.getSelection().removeAllRanges();
        }
    }

    shareToSocialMedia(platform) {
        const shareLink = document.getElementById('share-link').value;
        const playlistName = this.playlistName.textContent;
        let url = '';

        switch(platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
                break;

            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my "${playlistName}" playlist on Banshee Music!`)}&url=${encodeURIComponent(shareLink)}`;
                break;

            case 'instagram':
                // Instagram doesn't support direct sharing via URL
                this.showToast('Instagram sharing requires the mobile app', 'info');
                return;

            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(`Check out my "${playlistName}" playlist on Banshee Music! ${shareLink}`)}`;
                break;
        }

        if (url) {
            window.open(url, '_blank');
            this.showToast(`Sharing to ${platform}...`, 'info');
        }
    }

    async fetchSongs() {
        // Simulate API call - replace with actual implementation
        return [
            { id: 1, title: 'Construyendo en el Espacio', artist: 'Luna Cantina', album: 'Cosmic Sounds', duration: '3:45' },
            { id: 2, title: 'Midnight Dreams', artist: 'The Echoes', album: 'Dreamscape', duration: '4:12' },
            { id: 3, title: 'Electric Soul', artist: 'Voltage', album: 'Current', duration: '3:58' },
            { id: 4, title: 'Mountain High', artist: 'Nature\'s Call', album: 'Elevation', duration: '5:23' },
            { id: 5, title: 'Urban Jungle', artist: 'City Lights', album: 'Metropolis', duration: '4:02' }
        ];
    }

    showOptionsMenu() {
        // Create a simple dropdown menu
        const menu = document.createElement('div');
        menu.className = 'options-menu';
        menu.innerHTML = `
            <ul>
                <li data-action="share"><i class="fas fa-share-alt"></i> Share Playlist</li>
                <li data-action="download"><i class="fas fa-download"></i> Download</li>
                <li data-action="delete"><i class="fas fa-trash"></i> Delete Playlist</li>
            </ul>
        `;

        // Position the menu
        const rect = this.moreOptionsBtn.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;

        // Add event listeners
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('li')?.dataset.action;
            if (action) {
                this.handleMenuAction(action);
                menu.remove();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== this.moreOptionsBtn) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        }.bind(this));

        document.body.appendChild(menu);
    }

    handleMenuAction(action) {
        switch(action) {
            case 'share':
                this.handleShare();
                break;
            case 'download':
                this.showToast('Downloading playlist...');
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this playlist?')) {
                    this.showToast('Playlist deleted', 'info');
                    // In a real app, you would redirect to library page
                }
                break;
        }
    }

    // Skeleton loader and empty state methods
    showSkeletonLoaders() {
        this.songsContainer.innerHTML = '';

        // Create 6 skeleton loaders
        for (let i = 0; i < 6; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'skeleton-song';
            skeletonItem.innerHTML = `
                <div class="skeleton skeleton-number"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-artist"></div>
                <div class="skeleton skeleton-album"></div>
                <div class="skeleton skeleton-duration"></div>
            `;
            this.songsContainer.appendChild(skeletonItem);
        }
    }

    showEmptyState() {
        this.songsContainer.innerHTML = '';

        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">
                <i class="fas fa-music"></i>
            </div>
            <h3 class="empty-state-title">No songs in this playlist</h3>
            <p class="empty-state-text">Add some songs to get started with your playlist.</p>
            <button type="button" class="empty-state-button">
                <i class="fas fa-plus"></i> Add Songs
            </button>
        `;

        // Add event listener to the button
        const addButton = emptyState.querySelector('.empty-state-button');
        addButton.addEventListener('click', () => {
            this.showToast('Add songs feature coming soon', 'info');
        });

        this.songsContainer.appendChild(emptyState);
    }
}



// Initialize the playlist manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the playlist manager
    const playlistManager = new PlaylistManager();

    // Setup navbar dropdown functionality
    setupNavbarDropdown();
});

// Setup navbar dropdown functionality
function setupNavbarDropdown() {
    const profileButton = document.querySelector('.profile-button');
    const dropdown = document.querySelector('.dropdown');
    const userProfile = document.querySelector('.user-profile');

    if (!profileButton || !dropdown || !userProfile) {
        console.warn('Navbar dropdown elements not found');
        return;
    }

    // Show dropdown on hover
    userProfile.addEventListener('mouseenter', () => {
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
        profileButton.setAttribute('aria-expanded', 'true');
    });

    userProfile.addEventListener('mouseleave', () => {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-8px)';
        profileButton.setAttribute('aria-expanded', 'false');
    });

    // Toggle dropdown when profile button is clicked (for mobile)
    profileButton.addEventListener('click', (e) => {
        e.stopPropagation();

        if (dropdown.style.visibility === 'visible') {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-8px)';
            profileButton.setAttribute('aria-expanded', 'false');
        } else {
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'translateY(0)';
            profileButton.setAttribute('aria-expanded', 'true');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !profileButton.contains(e.target)) {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-8px)';
            profileButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.style.visibility === 'visible') {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-8px)';
            profileButton.setAttribute('aria-expanded', 'false');
        }
    });
}