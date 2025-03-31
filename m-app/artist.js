// Simulated API calls
const API = {
    getAllItems: async () => {
        // In a real application, this would be an API call to get all items
        return [
            { type: 'artist', name: 'Artist 1', image: 'imgs/album-03.png', genre: 'pop', popularity: 'trending' },
            { type: 'artist', name: 'Artist 2', image: 'imgs/album-04.png', genre: 'rock', popularity: 'most-popular' },
            { type: 'artist', name: 'Artist 3', image: 'imgs/album-05.png', genre: 'hiphop', popularity: 'new-releases' },
            { type: 'artist', name: 'Artist 4', image: 'imgs/album-01.png', genre: 'jazz', popularity: 'trending' },
            { type: 'album', title: 'Album 1', image: 'imgs/album-01.png', genre: 'pop', releaseDate: '2023-05-01' },
            { type: 'album', title: 'Album 2', image: 'imgs/album-02.png', genre: 'rock', releaseDate: '2023-04-15' },
            { type: 'album', title: 'Album 3', image: 'imgs/album-03.png', genre: 'hiphop', releaseDate: '2023-03-30' },
            { type: 'album', title: 'Album 4', image: 'imgs/album-04.png', genre: 'jazz', releaseDate: '2023-02-14' },
            { type: 'genre', name: 'Pop', image: 'imgs/genre-pop.png' },
            { type: 'genre', name: 'Rock', image: 'imgs/genre-rock.png' },
            { type: 'genre', name: 'Hip-Hop', image: 'imgs/genre-hiphop.png' },
            { type: 'genre', name: 'Jazz', image: 'imgs/genre-jazz.png' }
        ];
    }
};

// Utility functions
const utils = {
    showLoader: () => {
        document.getElementById('loader').style.display = 'block';
    },
    hideLoader: () => {
        document.getElementById('loader').style.display = 'none';
    }
};

let currentPage = 1;
const itemsPerPage = 8;

async function loadSection(sectionClass, dataFetcher, itemRenderer) {
    utils.showLoader();
    const section = document.querySelector(`.${sectionClass} .items`);
    try {
        const allData = await dataFetcher();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = allData.slice(startIndex, endIndex);
        section.innerHTML = paginatedData.map(itemRenderer).join('');

        updatePagination(allData.length);
    } catch (error) {
        console.error(`Error loading ${sectionClass}:`, error);
        section.innerHTML = `<p>Error loading content. Please try again later.</p>`;
    } finally {
        utils.hideLoader();
    }
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.addEventListener('click', () => {
            currentPage = i;
            applyFilters();
        });
        paginationContainer.appendChild(button);
    }
}

// Render functions for different item types
const renderArtistItem = (item) => `
    <div class="item">
        <img class="artist-mic" src="${item.image}" alt="${item.name}" loading="lazy">
        <h3>${item.name}</h3>
        <button>View Profile</button>
    </div>
`;

const renderMusicItem = (item) => `
    <div class="item">
        <img class="music-note" src="${item.image}" alt="${item.title}" loading="lazy">
        <h3>${item.title}</h3>
        <button>Play</button>
    </div>
`;

const renderGenreItem = (item) => `
    <div class="item">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <h3>${item.name}</h3>
    </div>
`;

function applyFilters() {
    const genreFilter = document.querySelector('.filter-genre').value;
    const popularityFilter = document.querySelector('.filter-popularity').value;
    const releaseDateFilter = document.querySelector('.filter-release-date').value;

    loadSection('featured-artists', () =>
        API.getAllItems().then(items => items.filter(item =>
            item.type === 'artist' &&
            (genreFilter === '' || item.genre === genreFilter) &&
            (popularityFilter === '' || item.popularity === popularityFilter)
        )),
        renderArtistItem
    );

    loadSection('recommended-music', () =>
        API.getAllItems().then(items => items.filter(item =>
            item.type === 'album' &&
            (genreFilter === '' || item.genre === genreFilter) &&
            (releaseDateFilter === '' || isWithinDateRange(item.releaseDate, releaseDateFilter))
        )),
        renderMusicItem
    );

    loadSection('genres', () =>
        API.getAllItems().then(items => items.filter(item => item.type === 'genre')),
        renderGenreItem
    );
}

function isWithinDateRange(dateString, range) {
    const date = new Date(dateString);
    const now = new Date();
    switch(range) {
        case 'last-week':
            return (now - date) / (1000 * 60 * 60 * 24) <= 7;
        case 'last-month':
            return (now - date) / (1000 * 60 * 60 * 24) <= 30;
        case 'last-year':
            return (now - date) / (1000 * 60 * 60 * 24) <= 365;
        default:
            return true;
    }
}

function performSearch(searchTerm) {
    const lowercaseSearch = searchTerm.toLowerCase();
    API.getAllItems().then(allItems => {
        const searchResults = allItems.filter(item =>
            (item.name && item.name.toLowerCase().includes(lowercaseSearch)) ||
            (item.title && item.title.toLowerCase().includes(lowercaseSearch))
        );

        document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
        const existingSearchResults = document.querySelector('.search-results');
        if (existingSearchResults) {
            existingSearchResults.remove();
        }
        const searchResultsSection = document.createElement('div');
        searchResultsSection.className = 'section search-results';

        if (searchResults.length === 0) {
            searchResultsSection.innerHTML = '<h2>Search Results</h2><p>No results found.</p>';
        } else {
            searchResultsSection.innerHTML = `
                <h2>Search Results</h2>
                <div class="items">
                    ${searchResults.map(item => {
                        if (item.type === 'artist') return renderArtistItem(item);
                        if (item.type === 'album') return renderMusicItem(item);
                        if (item.type === 'genre') return renderGenreItem(item);
                    }).join('')}
                </div>
            `;
        }
        document.querySelector('.content-container').appendChild(searchResultsSection);
    });
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup navbar dropdown functionality
    setupNavbarDropdown();

    // Setup Read More functionality
    setupReadMore();

    // Setup animations and loading states
    setupAnimations();

    // Setup lazy loading for images
    setupLazyLoading();

    // Setup audio previews for tracks
    setupAudioPreviews();

    // Direct initialization of Flickity for track carousel
    const trackCarousel = document.querySelector('.track-carousel');
    if (trackCarousel) {
        console.log('Initializing track carousel with Flickity');
        try {
            const flkty = new Flickity(trackCarousel, {
                cellAlign: 'left',
                contain: true,
                pageDots: false,
                wrapAround: true,
                autoPlay: false,
                prevNextButtons: true,
                adaptiveHeight: false,
                draggable: true,
                freeScroll: false,
                groupCells: 1,
                imagesLoaded: true
            });
            console.log('Track carousel initialized successfully:', flkty);

            // Force multiple redraws to ensure proper layout
            setTimeout(() => {
                flkty.resize();
                console.log('Track carousel resized - first pass');

                // Second resize after a longer delay
                setTimeout(() => {
                    flkty.resize();
                    console.log('Track carousel resized - second pass');

                    // Third resize after an even longer delay
                    setTimeout(() => {
                        flkty.resize();
                        console.log('Track carousel resized - third pass');

                        // Fourth resize after an even longer delay
                        setTimeout(() => {
                            flkty.resize();
                            console.log('Track carousel resized - fourth pass');

                            // Select the first cell to ensure proper initialization
                            flkty.select(0, false, true);
                            console.log('Track carousel first cell selected');
                        }, 700);
                    }, 500);
                }, 300);
            }, 100);

            // Add window resize handler
            window.addEventListener('resize', () => {
                flkty.resize();
                console.log('Track carousel resized due to window resize');
            });

            // Add select event handler
            flkty.on('select', () => {
                console.log('Track carousel selection changed');
            });
        } catch (e) {
            console.error('Failed to initialize track carousel:', e);
        }
    } else {
        console.error('Track carousel element not found');
    }

    // Direct initialization of Flickity for album carousel
    const albumCarousel = document.querySelector('.album-carousel');
    if (albumCarousel) {
        console.log('Initializing album carousel with Flickity');
        try {
            const albumFlkty = new Flickity(albumCarousel, {
                cellAlign: 'left',
                contain: true,
                pageDots: true,
                wrapAround: true,
                autoPlay: 7000,
                prevNextButtons: true,
                adaptiveHeight: false,
                draggable: true,
                freeScroll: false,
                groupCells: 1,
                selectedAttraction: 0.2,
                friction: 0.8,
                imagesLoaded: true
            });

            // Add selected class to the selected slide
            albumFlkty.on('select', function() {
                const selectedCell = albumFlkty.selectedElement;
                // Remove is-selected class from all cells
                albumCarousel.querySelectorAll('.album-card').forEach(card => {
                    card.classList.remove('is-selected');
                });

                // Add is-selected class to the selected cell
                if (selectedCell) {
                    selectedCell.classList.add('is-selected');
                }
            });

            // Add change event for logging
            albumFlkty.on('change', function(index) {
                console.log('Album carousel changed to index:', index);
            });

            // Add settle event for logging
            albumFlkty.on('settle', function(index) {
                console.log('Album carousel settled at index:', index);
            });
            console.log('Album carousel initialized successfully:', albumFlkty);

            // Force multiple redraws to ensure proper layout
            setTimeout(() => {
                albumFlkty.resize();
                console.log('Album carousel resized - first pass');

                // Second resize after a longer delay
                setTimeout(() => {
                    albumFlkty.resize();
                    console.log('Album carousel resized - second pass');

                    // Select the first cell to ensure proper initialization
                    albumFlkty.select(0, false, true);
                    console.log('Album carousel first cell selected');
                }, 300);
            }, 100);

            // Add window resize handler
            window.addEventListener('resize', () => {
                albumFlkty.resize();
                console.log('Album carousel resized due to window resize');
            });
        } catch (e) {
            console.error('Failed to initialize album carousel:', e);
        }
    } else {
        console.error('Album carousel element not found');
    }

    // Setup carousel functionality
    setupCarousel();

    // Initialize follow state
    let isFollowing = false;
    const followBtn = document.querySelector('.follow-btn');

    if (followBtn) {
        followBtn.addEventListener('click', () => {
            isFollowing = !isFollowing;
            followBtn.innerHTML = isFollowing ?
                '<i class="fas fa-user-check"></i> Following' :
                '<i class="fas fa-user-plus"></i> Follow';
            followBtn.classList.toggle('following', isFollowing);

            // Add animation effect
            followBtn.style.transform = 'scale(0.95)';
            setTimeout(() => followBtn.style.transform = '', 150);
        });
    }

    // Initialize carousel for popular tracks
    const popularTracks = new Flickity('.popular-tracks .carousel', {
        cellAlign: 'left',
        contain: true,
        pageDots: false,
        wrapAround: true,
        autoPlay: false,
        prevNextButtons: true,
        adaptiveHeight: true
    });

    // Gallery initialization removed as gallery section was removed

    // Handle play button click
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            // Add play animation
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            setTimeout(() => {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            }, 2000);
        });
    }

    // Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Share functionality
    const shareBtn = document.querySelector('.share-btn');
    const shareModal = document.querySelector('#shareModal');
    let modalBackdrop;

    function createBackdrop() {
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        document.body.appendChild(modalBackdrop);
    }

    function showShareModal() {
        createBackdrop();
        shareModal.hidden = false;
        modalBackdrop.hidden = false;
    }

    function hideShareModal() {
        shareModal.hidden = true;
        modalBackdrop.hidden = true;
        modalBackdrop.remove();
    }

    shareBtn.addEventListener('click', showShareModal);

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            hideShareModal();
        }
    });

    // Share options functionality
    const shareOptions = document.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.addEventListener('click', () => {
            const platform = option.dataset.platform;
            const artistName = document.querySelector('.artist-name h1').textContent;
            const currentUrl = window.location.href;

            switch(platform) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?text=Check out ${encodeURIComponent(artistName)} on Banshee Music!&url=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'instagram':
                    // Instagram doesn't support direct sharing links
                    alert('Open Instagram app to share');
                    break;
                default:
                    // Copy link functionality
                    navigator.clipboard.writeText(currentUrl).then(() => {
                        const originalText = option.textContent;
                        option.textContent = 'Link Copied!';
                        setTimeout(() => {
                            option.innerHTML = '<i class="fas fa-link"></i>Copy Link';
                        }, 2000);
                    });
            }
            hideShareModal();
        });
    });
}

// Setup Read More functionality for artist bio - Removed as bio is now scrollable
function setupReadMore() {
    // Function now empty as the Read More button has been removed
    // and the bio is now scrollable with a fixed height
    console.log('Bio is now scrollable, no Read More button needed');
}

// Setup animations for elements
function setupAnimations() {
    // Add animation delay to stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach((stat, index) => {
        stat.style.setProperty('--item-index', index);
    });

    // Add animation delay to items
    const items = document.querySelectorAll('.item');
    items.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });

    // Gallery animation code removed as gallery section was removed

    // Add animation delay to similar artist cards
    const similarArtistCards = document.querySelectorAll('.similar-artist-card');
    similarArtistCards.forEach((card, index) => {
        card.style.setProperty('--item-index', index);
    });

    // Add fade-in animation to sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });

    // Add click event listeners to similar artist cards
    similarArtistCards.forEach(card => {
        card.addEventListener('click', () => {
            // In a real app, this would navigate to the artist page
            // For now, just add a visual feedback
            card.classList.add('clicked');
            setTimeout(() => {
                card.classList.remove('clicked');
            }, 300);
        });
    });
}

// Setup enhanced lazy loading for images
function setupLazyLoading() {
    // First, handle all carousel images with higher priority
    const carouselImages = document.querySelectorAll('.album-carousel img, .track-carousel img');

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
        const otherImages = document.querySelectorAll('img:not(.album-carousel img):not(.track-carousel img)');
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
            if (img.closest('.album-carousel') || img.closest('.track-carousel')) {
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

// Setup carousel functionality
function setupCarousel() {
    // Initialize Flickity for track carousel
    const trackCarousel = document.querySelector('.track-carousel');
    if (trackCarousel) {
        // Force re-initialization of Flickity to ensure it works
        let flkty;
        try {
            // Try to get existing instance
            flkty = Flickity.data(trackCarousel);
            if (!flkty) {
                // If no instance exists, create a new one
                flkty = new Flickity(trackCarousel, {
                    cellAlign: 'left',
                    contain: true,
                    pageDots: false,
                    wrapAround: true,
                    autoPlay: false,
                    prevNextButtons: true,
                    adaptiveHeight: true,
                    draggable: true,
                    freeScroll: false,
                    groupCells: true
                });
            }
        } catch (e) {
            console.error('Error initializing track carousel:', e);
            // Try to create a new instance
            flkty = new Flickity(trackCarousel, {
                cellAlign: 'left',
                contain: true,
                pageDots: false,
                wrapAround: true,
                autoPlay: false,
                prevNextButtons: true,
                adaptiveHeight: true,
                draggable: true,
                freeScroll: false,
                groupCells: true
            });
        }

        // Setup track items
        setupTrackItems();

        // Setup auto-play and view-all buttons
        setupCarouselOptions(flkty);
    } else {
        console.warn('Track carousel not found');
    }

    // Initialize Flickity for album carousel
    const albumCarousel = document.querySelector('.album-carousel');
    if (albumCarousel) {
        // Force re-initialization of Flickity to ensure it works
        let albumFlkty;
        try {
            // Try to get existing instance
            albumFlkty = Flickity.data(albumCarousel);
            if (!albumFlkty) {
                // If no instance exists, create a new one
                albumFlkty = new Flickity(albumCarousel, {
                    cellAlign: 'left',
                    contain: true,
                    pageDots: true,
                    wrapAround: true,
                    autoPlay: 7000,
                    prevNextButtons: true,
                    adaptiveHeight: false,
                    draggable: true,
                    freeScroll: false,
                    groupCells: 1,
                    selectedAttraction: 0.2,
                    friction: 0.8,
                    imagesLoaded: true
                });

                // Add selected class to the selected slide
                albumFlkty.on('select', function() {
                    const selectedCell = albumFlkty.selectedElement;
                    // Remove is-selected class from all cells
                    albumCarousel.querySelectorAll('.album-card').forEach(card => {
                        card.classList.remove('is-selected');
                    });

                    // Add is-selected class to the selected cell
                    if (selectedCell) {
                        selectedCell.classList.add('is-selected');
                    }
                });

                // Add change event for logging
                albumFlkty.on('change', function(index) {
                    console.log('Album carousel changed to index:', index);
                });

                // Add settle event for logging
                albumFlkty.on('settle', function(index) {
                    console.log('Album carousel settled at index:', index);
                });
            }
        } catch (e) {
            console.error('Error initializing album carousel:', e);
            // Try to create a new instance
            albumFlkty = new Flickity(albumCarousel, {
                cellAlign: 'left',
                contain: true,
                pageDots: true,
                wrapAround: true,
                autoPlay: 7000,
                prevNextButtons: true,
                adaptiveHeight: false,
                draggable: true,
                freeScroll: false,
                groupCells: 1,
                selectedAttraction: 0.2,
                friction: 0.8,
                imagesLoaded: true
            });

            // Add selected class to the selected slide
            albumFlkty.on('select', function() {
                const selectedCell = albumFlkty.selectedElement;
                // Remove is-selected class from all cells
                albumCarousel.querySelectorAll('.album-card').forEach(card => {
                    card.classList.remove('is-selected');
                });
                // Add is-selected class to the selected cell
                if (selectedCell) {
                    selectedCell.classList.add('is-selected');
                }
            });

            // Add change event for logging
            albumFlkty.on('change', function(index) {
                console.log('Album carousel changed to index:', index);
            });

            // Add settle event for logging
            albumFlkty.on('settle', function(index) {
                console.log('Album carousel settled at index:', index);
            });
        }

        // Setup album cards
        setupAlbumCards();
    } else {
        console.warn('Album carousel not found');
    }
}

// Setup track items
function setupTrackItems() {
    const trackItems = document.querySelectorAll('.track-item');
    const autoPlayBtn = document.querySelector('.auto-play-btn');
    const viewAllBtn = document.querySelector('.view-all-btn');

    if (!trackItems.length) {
        console.warn('Track items not found');
        return;
    }

    // Ensure track items are visible
    trackItems.forEach((item, index) => {
        // Remove any opacity settings that might hide the item
        item.style.opacity = '1';
        // Add animation delay for staggered appearance
        item.style.setProperty('--item-index', index);
        // Ensure proper display
        item.style.display = 'block';

        // Add click event to the whole track item
        item.addEventListener('click', () => {
            // Find the play button within this item
            const playBtn = item.querySelector('.play-track-btn');
            if (playBtn) {
                // Trigger a click on the play button
                playBtn.click();
            }
        });
    });

    // Create pagination dots
    const totalItems = trackItems.length;
    const visibleItems = Math.floor(carousel.clientWidth / 300); // Approximate width of item + gap
    const totalPages = Math.ceil(totalItems / visibleItems);

    // Create pagination dots
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('pagination-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('data-index', i);
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Go to page ${i + 1}`);
        dot.setAttribute('tabindex', '0');
        paginationContainer.appendChild(dot);

        // Add click event to dot
        dot.addEventListener('click', () => {
            const scrollPosition = i * (visibleItems * 300); // Approximate width of items
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        });

        // Add keyboard support
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dot.click();
            }
        });
    }

    // Setup play buttons
    const playButtons = document.querySelectorAll('.play-track-btn');
    let currentlyPlaying = null;

    playButtons.forEach(button => {
        button.setAttribute('aria-label', 'Play track');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackItem = button.closest('.track-item');

            // If this track is already playing, stop it
            if (trackItem.classList.contains('playing')) {
                trackItem.classList.remove('playing');
                button.innerHTML = '<i class="fas fa-play"></i>';
                button.setAttribute('aria-label', 'Play track');
                currentlyPlaying = null;
            } else {
                // If another track is playing, stop it first
                if (currentlyPlaying) {
                    currentlyPlaying.classList.remove('playing');
                    const prevButton = currentlyPlaying.querySelector('.play-track-btn');
                    if (prevButton) {
                        prevButton.innerHTML = '<i class="fas fa-play"></i>';
                        prevButton.setAttribute('aria-label', 'Play track');
                    }
                }

                // Start playing this track
                trackItem.classList.add('playing');
                button.innerHTML = '<i class="fas fa-pause"></i>';
                button.setAttribute('aria-label', 'Pause track');
                currentlyPlaying = trackItem;

                // Scroll the item into view if needed
                trackItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });

    // Setup action buttons
    const actionButtons = document.querySelectorAll('.track-action-btn');
    actionButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon.classList.contains('fa-heart')) {
            button.setAttribute('aria-label', 'Like track');
        } else if (icon.classList.contains('fa-share-alt')) {
            button.setAttribute('aria-label', 'Share track');
        } else if (icon.classList.contains('fa-ellipsis-h')) {
            button.setAttribute('aria-label', 'More options');
        }

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // In a real app, this would perform the action
            // For now, just add a visual feedback
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 300);
        });
    });

    // Setup carousel navigation
    const itemWidth = 300; // Approximate width of item + gap

    prevBtn.setAttribute('aria-label', 'Previous tracks');
    nextBtn.setAttribute('aria-label', 'Next tracks');

    prevBtn.addEventListener('click', () => {
        const scrollAmount = visibleItems * itemWidth;
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        const scrollAmount = visibleItems * itemWidth;
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Add keyboard navigation
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextBtn.click();
        }
    });

    // Check if scroll buttons should be visible and update pagination
    function updateCarouselState() {
        // Update navigation buttons
        if (carousel.scrollLeft <= 10) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }

        if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }

        // Update pagination dots
        const currentPage = Math.floor(carousel.scrollLeft / (visibleItems * itemWidth));
        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            if (index === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Initial check
    updateCarouselState();

    // Update on scroll
    carousel.addEventListener('scroll', updateCarouselState);

    // Setup auto-play functionality
    let autoPlayInterval = null;

    if (autoPlayBtn) {
        autoPlayBtn.addEventListener('click', () => {
            if (autoPlayInterval) {
                // Stop auto-play
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoPlayBtn.classList.remove('active');
                autoPlayBtn.querySelector('span').textContent = 'Auto-play';
            } else {
                // Start auto-play
                autoPlayBtn.classList.add('active');
                autoPlayBtn.querySelector('span').textContent = 'Stop Auto-play';

                // Auto-play logic
                autoPlayInterval = setInterval(() => {
                    // If we're at the end, go back to the beginning
                    if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                        carousel.scrollTo({
                            left: 0,
                            behavior: 'smooth'
                        });
                    } else {
                        // Otherwise, advance to the next item
                        carousel.scrollBy({
                            left: itemWidth,
                            behavior: 'smooth'
                        });
                    }
                }, 5000); // Change slide every 5 seconds
            }
        });
    }

    // Setup view all functionality
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const demoSection = document.querySelector('.demos');
            if (demoSection) {
                demoSection.classList.toggle('expanded');

                if (demoSection.classList.contains('expanded')) {
                    viewAllBtn.querySelector('span').textContent = 'Show Less';
                    // Change the carousel to a grid layout
                    carousel.style.display = 'grid';
                    carousel.style.gridAutoFlow = 'row';
                    carousel.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                    carousel.style.overflowX = 'visible';
                    carousel.style.overflowY = 'visible';
                    carousel.style.height = 'auto';

                    // Hide navigation controls
                    document.querySelector('.carousel-controls').style.display = 'none';
                } else {
                    viewAllBtn.querySelector('span').textContent = 'View All';
                    // Restore carousel layout
                    carousel.style.display = 'grid';
                    carousel.style.gridAutoFlow = 'column';
                    carousel.style.gridTemplateColumns = '';
                    carousel.style.gridAutoColumns = '280px';
                    carousel.style.overflowX = 'auto';
                    carousel.style.height = '';

                    // Show navigation controls
                    document.querySelector('.carousel-controls').style.display = 'flex';
                }
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        // Recalculate visible items
        const newVisibleItems = Math.floor(carousel.clientWidth / itemWidth);
        if (newVisibleItems !== visibleItems) {
            // If the number of visible items has changed, update pagination
            const newTotalPages = Math.ceil(totalItems / newVisibleItems);

            // Clear existing pagination
            paginationContainer.innerHTML = '';

            // Create new pagination dots
            for (let i = 0; i < newTotalPages; i++) {
                const dot = document.createElement('div');
                dot.classList.add('pagination-dot');
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('data-index', i);
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Go to page ${i + 1}`);
                dot.setAttribute('tabindex', '0');
                paginationContainer.appendChild(dot);

                // Add click event to dot
                dot.addEventListener('click', () => {
                    const scrollPosition = i * (newVisibleItems * itemWidth);
                    carousel.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                    });
                });
            }

            // Update carousel state
            updateCarouselState();
        }
    });
}

// Setup carousel options (auto-play and view-all buttons)
function setupCarouselOptions(flickityInstance) {
    const autoPlayBtn = document.querySelector('.auto-play-btn');
    const viewAllBtn = document.querySelector('.view-all-btn');
    const carousel = document.querySelector('.track-carousel');

    if (!autoPlayBtn || !viewAllBtn || !carousel) {
        console.warn('Carousel option elements not found');
        return;
    }

    // Setup auto-play functionality
    if (autoPlayBtn) {
        autoPlayBtn.addEventListener('click', () => {
            if (flickityInstance.player.isPlaying) {
                // Stop auto-play
                flickityInstance.pausePlayer();
                autoPlayBtn.classList.remove('active');
                autoPlayBtn.querySelector('span').textContent = 'Auto-play';
            } else {
                // Start auto-play
                flickityInstance.playPlayer();
                autoPlayBtn.classList.add('active');
                autoPlayBtn.querySelector('span').textContent = 'Stop Auto-play';
            }
        });
    }

    // Setup view all functionality
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const demoSection = document.querySelector('.demos');
            if (demoSection) {
                demoSection.classList.toggle('expanded');

                if (demoSection.classList.contains('expanded')) {
                    viewAllBtn.querySelector('span').textContent = 'Show Less';
                    // Destroy Flickity and change to grid layout
                    flickityInstance.destroy();
                    carousel.style.display = 'grid';
                    carousel.style.gridAutoFlow = 'row';
                    carousel.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                    carousel.style.overflowX = 'visible';
                    carousel.style.overflowY = 'visible';
                    carousel.style.height = 'auto';
                } else {
                    viewAllBtn.querySelector('span').textContent = 'View All';
                    // Re-initialize Flickity
                    carousel.style.display = '';
                    carousel.style.gridAutoFlow = '';
                    carousel.style.gridTemplateColumns = '';
                    carousel.style.overflowX = '';
                    carousel.style.overflowY = '';
                    carousel.style.height = '';

                    // Re-initialize Flickity with the same options
                    new Flickity(carousel, {
                        cellAlign: 'left',
                        contain: true,
                        pageDots: false,
                        wrapAround: true,
                        autoPlay: false,
                        prevNextButtons: true,
                        adaptiveHeight: true,
                        draggable: true,
                        freeScroll: false,
                        groupCells: true
                    });
                }
            }
        });
    }
}

// Setup album cards
function setupAlbumCards() {
    const albumCards = document.querySelectorAll('.album-card');

    if (!albumCards.length) {
        console.warn('Album cards not found');
        return;
    }

    // Ensure album cards are visible and properly styled
    albumCards.forEach((card, index) => {
        // Remove any opacity settings that might hide the card
        card.style.opacity = '1';
        // Add animation delay for staggered appearance
        card.style.setProperty('--item-index', index);
        // Ensure proper display
        card.style.display = 'block';
        // Set width explicitly
        card.style.width = '300px';
        // Set margin
        card.style.marginRight = '25px';
    });

    // Setup album action buttons
    const actionButtons = document.querySelectorAll('.album-action-btn');
    actionButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon.classList.contains('fa-play')) {
            button.setAttribute('aria-label', 'Play album');
        } else if (icon.classList.contains('fa-plus')) {
            button.setAttribute('aria-label', 'Add to library');
        } else if (icon.classList.contains('fa-share-alt')) {
            button.setAttribute('aria-label', 'Share album');
        }

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // In a real app, this would perform the action
            // For now, just add a visual feedback
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 300);
        });
    });
}

// Setup audio previews for tracks
function setupAudioPreviews() {
    // Get all track items with preview URLs
    const trackItems = document.querySelectorAll('.track-item[data-preview]');
    let currentAudio = null;
    let currentTrackItem = null;

    trackItems.forEach(trackItem => {
        const previewUrl = trackItem.getAttribute('data-preview');
        const playButton = trackItem.querySelector('.play-track-btn');
        const progressFill = trackItem.querySelector('.progress-fill');
        const progressTime = trackItem.querySelector('.progress-time');

        // Create audio element
        const audio = new Audio(previewUrl);

        // Update progress bar during playback
        audio.addEventListener('timeupdate', () => {
            if (progressFill && progressTime) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = `${progress}%`;

                // Format time (MM:SS)
                const minutes = Math.floor(audio.currentTime / 60);
                const seconds = Math.floor(audio.currentTime % 60);
                progressTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
        });

        // Reset when audio ends
        audio.addEventListener('ended', () => {
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
            trackItem.classList.remove('playing');
            currentAudio = null;
            currentTrackItem = null;

            if (progressFill) {
                progressFill.style.width = '0%';
            }
            if (progressTime) {
                progressTime.textContent = '0:00';
            }
        });

        // Play/pause on button click
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // If there's another track playing, stop it
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    if (currentTrackItem) {
                        const currentPlayButton = currentTrackItem.querySelector('.play-track-btn');
                        if (currentPlayButton) {
                            currentPlayButton.innerHTML = '<i class="fas fa-play"></i>';
                        }
                        currentTrackItem.classList.remove('playing');

                        const currentProgressFill = currentTrackItem.querySelector('.progress-fill');
                        const currentProgressTime = currentTrackItem.querySelector('.progress-time');
                        if (currentProgressFill) {
                            currentProgressFill.style.width = '0%';
                        }
                        if (currentProgressTime) {
                            currentProgressTime.textContent = '0:00';
                        }
                    }
                }

                // Toggle play/pause for this track
                if (audio.paused) {
                    audio.play();
                    playButton.innerHTML = '<i class="fas fa-pause"></i>';
                    trackItem.classList.add('playing');
                    currentAudio = audio;
                    currentTrackItem = trackItem;
                } else {
                    audio.pause();
                    playButton.innerHTML = '<i class="fas fa-play"></i>';
                    trackItem.classList.remove('playing');
                    currentAudio = null;
                    currentTrackItem = null;
                }
            });
        }
    });
}

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
    });
}
