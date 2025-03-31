/**
 * Explore Page JavaScript
 * Organized and cleaned up for better maintainability
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    setupLazyLoading();
    initializeEventListeners();
    initializeCarousels();
    loadExploreContent();
});

/**
 * Setup enhanced lazy loading for images
 */
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

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter items
            filterItems(filter);
        });
    });

    // Search functionality
    const searchBar = document.querySelector('.search-bar');
    const searchClear = document.querySelector('.search-clear');
    const searchSubmit = document.querySelector('.search-submit-btn');
    
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            const searchTerm = searchBar.value.toLowerCase();
            if (searchTerm.length > 2) {
                searchItems(searchTerm);
            } else if (searchTerm.length === 0) {
                resetSearch();
            }
        });
        
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = searchBar.value.toLowerCase();
                searchItems(searchTerm);
            }
        });
    }
    
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchBar.value = '';
            resetSearch();
        });
    }
    
    if (searchSubmit) {
        searchSubmit.addEventListener('click', () => {
            const searchTerm = searchBar.value.toLowerCase();
            searchItems(searchTerm);
        });
    }

    // Play buttons
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const itemName = button.getAttribute('aria-label')?.replace('Play ', '') || 'Unknown';
            console.log(`Playing: ${itemName}`);
            // Here you would trigger the actual playback
        });
    });

    // Follow buttons
    const followButtons = document.querySelectorAll('.follow-btn');
    followButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isFollowing = this.classList.contains('following');
            const artistName = this.closest('.artist-card').querySelector('.artist-name').textContent;
            
            if (isFollowing) {
                this.textContent = 'Follow';
                this.classList.remove('following');
                console.log(`Unfollowed ${artistName}`);
            } else {
                this.textContent = 'Following';
                this.classList.add('following');
                console.log(`Followed ${artistName}`);
            }
        });
    });
}

/**
 * Initialize Flickity carousels
 */
function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        // Flickity is initialized via data-flickity attribute in HTML
        // This is just to ensure all carousels are properly set up
        if (carousel.classList.contains('flickity-enabled')) {
            return;
        }
        
        // Add any additional carousel setup if needed
    });
}

/**
 * Filter items based on category
 * @param {string} filter - The filter category
 */
function filterItems(filter) {
    const items = document.querySelectorAll('.item');
    
    items.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-type') === filter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Search items based on search term
 * @param {string} searchTerm - The search term
 */
function searchItems(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) return;
    
    showLoader();
    
    // Simulate search delay
    setTimeout(() => {
        const items = document.querySelectorAll('.item');
        let foundCount = 0;
        
        items.forEach(item => {
            const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const artist = item.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || artist.includes(searchTerm)) {
                item.style.display = 'flex';
                foundCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update search results count
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            resultsCount.textContent = `${foundCount} results found`;
        }
        
        hideLoader();
    }, 300);
}

/**
 * Reset search results
 */
function resetSearch() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.style.display = 'flex';
    });
    
    // Reset results count
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = '';
    }
}

/**
 * Show loading spinner
 */
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

/**
 * Hide loading spinner
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Main function to load explore content
 */
async function loadExploreContent() {
    showLoader();

    try {
        // Simulate API calls with setTimeout
        setTimeout(() => {
            hideLoader();
        }, 500);
    } catch (error) {
        console.error('Error loading explore content:', error);
        hideLoader();
    }
}
