document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    // Setup lazy loading for images
    setupLazyLoading();

    // Show loading spinner
    function showLoader() {
        loader.style.display = 'block';
    }

    // Hide loading spinner
    function hideLoader() {
        loader.style.display = 'none';
    }

    // Main function to load library content
    async function loadLibrary() {
        showLoader();

        try {
            const playlists = await fetchPlaylists();
            const favoriteSongs = await fetchFavoriteSongs();
            const recentlyPlayed = await fetchRecentlyPlayed();

            appendItems('playlists-section', playlists, renderPlaylistItem);
            appendItems('favorite-songs', favoriteSongs, renderSongItem);
            // Recently Played items are now static in the HTML
            // appendItems('recently-played', recentlyPlayed, renderRecentlyPlayedItem);

            hideLoader();
        } catch (error) {
            console.error('Error loading library content:', error);
            hideLoader();
        }
    }

    // Function to initialize Recently Played carousel
    function initializeRecentlyPlayedCarousel(recentlyPlayed) {
        const carousel = document.getElementById('recently-played-carousel');
        if (!carousel) return;

        // Clear existing content
        carousel.innerHTML = '';

        // Group items into cells (3 items per cell)
        const itemsPerCell = 3;
        for (let i = 0; i < recentlyPlayed.length; i += itemsPerCell) {
            const cell = document.createElement('div');
            cell.className = 'carousel-cell';

            const items = document.createElement('div');
            items.className = 'items';

            // Add items to this cell
            const cellItems = recentlyPlayed.slice(i, i + itemsPerCell);
            cellItems.forEach(song => {
                items.innerHTML += `
                    <div class="item" data-type="songs" data-id="${song.id}">
                        <div class="img-container">
                            <img src="${song.coverUrl}" alt="${song.title}" loading="lazy">
                            <div class="play-overlay">
                                <button class="play-button" aria-label="Play ${song.title}">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        </div>
                        <div class="item-content">
                            <div class="text-content">
                                <h3>${song.title}</h3>
                                <p>${song.artist}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            cell.appendChild(items);
            carousel.appendChild(cell);
        }

        // Initialize Flickity
        new Flickity(carousel, {
            cellAlign: 'left',
            contain: true,
            wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            autoPlay: false,
            groupCells: true
        });

        // Add event listeners to play buttons
        const playButtons = carousel.querySelectorAll('.play-button');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const item = button.closest('.item');
                const songId = item.dataset.id;
                playSong(songId);
            });
        });
    }

    // Helper function to generate random time ago string
    function getRandomTimeAgo() {
        const times = [
            '2 mins ago', '5 mins ago', '10 mins ago', '30 mins ago',
            '1 hour ago', '2 hours ago', '5 hours ago',
            'Yesterday', '2 days ago'
        ];
        return times[Math.floor(Math.random() * times.length)];
    }

    // Mock function to fetch recently played songs
    async function fetchRecentlyPlayed() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, title: "Blinding Lights", artist: "The Weeknd", coverUrl: "imgs/album-01.png" },
                    { id: 2, title: "As It Was", artist: "Harry Styles", coverUrl: "imgs/album-02.png" },
                    { id: 3, title: "Bad Habit", artist: "Steve Lacy", coverUrl: "imgs/album-03.png" },
                    { id: 4, title: "Anti-Hero", artist: "Taylor Swift", coverUrl: "imgs/album-04.png" },
                    { id: 5, title: "Unholy", artist: "Sam Smith & Kim Petras", coverUrl: "imgs/album-05.png" },
                    { id: 6, title: "Calm Down", artist: "Rema & Selena Gomez", coverUrl: "imgs/album-06.png" },
                    { id: 7, title: "Heat Waves", artist: "Glass Animals", coverUrl: "imgs/album-07.png" },
                    { id: 8, title: "Stay", artist: "The Kid LAROI & Justin Bieber", coverUrl: "imgs/album-08.png" },
                    { id: 9, title: "Levitating", artist: "Dua Lipa", coverUrl: "imgs/album-09.png" }
                ]);
            }, 800);
        });
    }

    // Mock function to play a song
    function playSong(songId) {
        console.log(`Playing song with ID: ${songId}`);
        // Add actual play functionality here
    }

    // Append items to the respective sections
    function appendItems(sectionClass, items, renderFunction) {
        const carousel = document.querySelector(`.${sectionClass} .carousel`);
        if (!carousel) return;

        // Clear existing content
        carousel.innerHTML = '';

        // Group items into cells, 5 items per cell
        const itemsPerCell = 5;
        for (let i = 0; i < items.length; i += itemsPerCell) {
            const cellItems = items.slice(i, i + itemsPerCell);
            const cell = document.createElement('div');
            cell.className = 'carousel-cell';

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items';
            itemsContainer.innerHTML = cellItems.map(renderFunction).join('');

            cell.appendChild(itemsContainer);
            carousel.appendChild(cell);
        }

        // Initialize or reinitialize Flickity
        if (carousel.flickity) {
            carousel.flickity.destroy();
        }

        const flkty = new Flickity(carousel, {
            cellAlign: 'left',
            contain: true,
            wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            autoPlay: false,
            fade: true,
            dragThreshold: 10,
            adaptiveHeight: true
        });

        // Update layout after images load
        imagesLoaded(carousel, function() {
            flkty.reloadCells();
            flkty.resize();
        });
    }

    // Render a playlist item
    function renderPlaylistItem(item) {
        return `
            <div class="item">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="item-content">
                    <h3>${item.title}</h3>
                    <button class="primary-button">Play</button>
                </div>
            </div>
        `;
    }

    // Render a song item
    function renderSongItem(item) {
        // Format the played time as a relative time string
        let playedTimeStr = '';
        if (item.playedAt) {
            const now = new Date();
            const diffMs = now - item.playedAt;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 60) {
                playedTimeStr = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                playedTimeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else {
                playedTimeStr = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            }
        }

        return `
            <div class="item" data-type="songs">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="play-overlay">
                        <button type="button" class="play-button" aria-label="Play ${item.title}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <div class="text-content">
                        <h3>${item.title}</h3>
                        <p>${item.artist}</p>
                        ${item.playedAt ? `
                        <div class="play-time">
                            <i class="fas fa-history"></i>
                            <span>Played ${playedTimeStr}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Render a recently played item
    function renderRecentlyPlayedItem(song) {
        const timeAgo = getRandomTimeAgo();
        return `
            <div class="item" data-type="songs" data-id="${song.id}">
                <div class="img-container">
                    <img src="${song.coverUrl}" alt="${song.title}" loading="lazy">
                    <div class="play-overlay">
                        <button class="play-button" aria-label="Play ${song.title}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <div class="text-content">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                        <div class="play-time">
                            <i class="fas fa-history"></i>
                            <span>Played ${timeAgo}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allItems = document.querySelectorAll('.item');

            allItems.forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                const artist = item.querySelector('p')?.textContent.toLowerCase() || '';
                item.style.display = (title.includes(searchTerm) || artist.includes(searchTerm)) ? 'block' : 'none';
            });
        });
    }

    // Add click events to items
    function addClickEvents() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.querySelector('h3').textContent;
                console.log(`Playing: ${title}`);
                // Here you would add logic to play the song or open the playlist
            });
        });
    }

    // Setup keyboard navigation for accessibility
    function setupKeyboardNavigation() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }

    // Simulated API calls
    async function fetchPlaylists() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Array(15).fill(null).map((_, i) => ({
            title: `Playlist ${i + 1}`,
            image: `imgs/playlist${i + 1}.jpg`,
            trackCount: Math.floor(Math.random() * 20) + 5,
            duration: '2h 30m'
        }));
    }

    async function fetchFavoriteSongs() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { title: 'Song Title 1', artist: 'Artist Name 1', image: 'imgs/song1.jpg' },
            { title: 'Song Title 2', artist: 'Artist Name 2', image: 'imgs/song2.jpg' },
            { title: 'Song Title 3', artist: 'Artist Name 3', image: 'imgs/song3.jpg' },
            { title: 'Song Title 4', artist: 'Artist Name 4', image: 'imgs/song4.jpg' }
        ];
    }

    // Call the main function
    loadLibrary();
});

// Setup enhanced lazy loading for images
function setupLazyLoading() {
    // First, handle all carousel images with higher priority
    const carouselImages = document.querySelectorAll('.carousel img, .img-container img');

    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        carouselImages.forEach(img => {
            // Make sure all carousel images have loading="lazy" attribute
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Add blur-up effect
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.5s ease-out';

            img.onload = function() {
                img.style.filter = 'blur(0)';
            };
        });

        // Handle all other images
        const otherImages = document.querySelectorAll('img:not(.carousel img):not(.img-container img)');
        otherImages.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);

        // Process all images
        const allImages = document.querySelectorAll('img[loading="lazy"]');
        allImages.forEach(img => {
            img.classList.add('lazyload');

            // Store original source
            const originalSrc = img.src;
            img.setAttribute('data-src', originalSrc);

            // Set placeholder
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

            // Add blur-up effect for carousel images
            if (img.closest('.carousel') || img.closest('.img-container')) {
                img.style.filter = 'blur(5px)';
                img.style.transition = 'filter 0.5s ease-out';

                img.addEventListener('lazyloaded', function() {
                    img.style.filter = 'blur(0)';
                });
            }
        });
    }

    // Add intersection observer for better performance
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src && !img.src.includes(img.dataset.src)) {
                        img.src = img.dataset.src;
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading images when they're 50px from viewport
            threshold: 0.01 // Trigger when at least 1% of the image is visible
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}





