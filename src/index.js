import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightBox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const PIXABAY_KEY = '27745892-6b588e2559ed1316d69737419';

const lightbox = new SimpleLightBox('.gallery a');

const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const form = document.querySelector('#search-form');

let page = 1;
let limit = 40;
let totalPages = 0;
let searchWord = '';
let cardHeight = 0;

const fetchHits = async () => {
  const params = new URLSearchParams({
    key: PIXABAY_KEY,
    q: searchWord,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: page,
    per_page: limit,
  });

  const response = await axios.get(`https://pixabay.com/api/?${params}`);
  return response.data;
};

const renderHits = hits => {
  const markup = hits
    .map(
      hit =>
        `
    <div class="photo-card">
        <a href="${hit.largeImageURL}">
            <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
        
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${hit.likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${hit.views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${hit.comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${hit.downloads}
            </p>
        </div>
        </a>
    </div> 
            `
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();

  if (cardHeight === 0) {
    cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
  }
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

form.addEventListener('submit', async e => {
  e.preventDefault();

  searchWord = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';
  loadMoreButton.classList.add('unvisible');
  page = 1;
  totalPages = 1;

  try {
    const data = await fetchHits();
    if (data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    renderHits(data.hits);
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    totalPages = data.totalHits / limit;
    console.log(`Total hits=${data.totalHits}, pages=${totalPages}`);
    if (totalPages > 1) {
      loadMoreButton.classList.remove('unvisible');
    }
    page += 1;
  } catch (e) {
    console.log(e);
  }
});

loadMoreButton.addEventListener('click', async () => {
  try {
    const data = await fetchHits();
    renderHits(data.hits);
    console.log(page + ' from ' + totalPages);
    page += 1;
    if (page > totalPages) {
      loadMoreButton.classList.add('unvisible');
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (e) {
    console.log(e);
  }
});
