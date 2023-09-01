const TAG_ACTIVE_CLASS = 'tag--active';
const SEARCH_HIDDEN_CLASS = 'search--hidden';
const CLOSE_TAG_CLASS = 'close-tag';
const TAG_CLASS = 'tag';

function getTagHTML(tag, tagClasses) {
  return `<span class="${tagClasses}">
                ${tag}
            </span>`;
}

function getJobListingHTML(jobData, filterTags = []) {
  const JOB_TAGS_PLACEHOLDER = '###JOB_TAGS###';
  let jobListingHTML = `
        <div class="jobs__item ${jobData.featured  ? 'border-left' : ''}">
            <div class="jobs__column jobs__column--left">
                <img src="${jobData.logo}" alt="${jobData.company}" class="jobs__img" />
                <div class="jobs__info">
                    <span class="jobs__company">${jobData.company} ${jobData.new && '<span class="jobs__new">NEW!</span>' }${ jobData.featured ? '<span class="jobs__featured">FEATURED</span>':''} </span>
                    <span class="jobs__title">${jobData.position}</span>
                    
                    <ul class="jobs__details">
                        <li class="jobs__details-item">${jobData.postedAt}</li>
                        <li class="jobs__details-item">${jobData.contract}</li>
                        <li class="jobs__details-item">${jobData.location}</li>
                    </ul>
                </div>
            </div>
            <div class="jobs__column jobs__column--right">
                ${JOB_TAGS_PLACEHOLDER}
            </div>
        </div>
    `;

  const tagsList = [
    jobData.role,
    jobData.level,
    ...(jobData.languages || []),
    ...(jobData.tools || [])
  ];
  const tagsListLowercase = tagsList.map(t => t && t.toLowerCase());
  const passesFilter = !filterTags.length || filterTags.every(tag => (
    tagsListLowercase.includes(tag && tag.toLowerCase())
  ));

  if (!passesFilter) {
    return '';
  }

  const tagsString = tagsList.reduce((acc, currentTag) => {
    const activeClass = (filterTags.includes(currentTag) && TAG_ACTIVE_CLASS) || '';

    return acc + getTagHTML(currentTag, `${TAG_CLASS} ${activeClass}`);
  }, '');

  return jobListingHTML.replace(JOB_TAGS_PLACEHOLDER, tagsString);
}

function toggleClass(el, className) {
  if (el.classList.contains(className)) {
    el.classList.remove(className);
  } else {
    el.classList.add(className);
  }
}

function getSearchBarTags(tagValue, searchContentEl) {
  let searchBarTags = Array.from(searchContentEl.children)
    .map(node => node.innerHTML && node.innerHTML.trim())
    .filter(tag => !!tag);

  if (searchBarTags.includes(tagValue)) {
    searchBarTags = searchBarTags.filter(tag => tag !== tagValue);
  } else {
    searchBarTags = [...searchBarTags, tagValue];
  }

  return searchBarTags;
}

function setJobsListings(filterTags) {
  axios.get('https://my.api.mockaroo.com/jobData.json?key=e6169ab0')
    .then(response => {
      const jobsListings = response.data;
      const jobsListingsHTML = jobsListings.reduce((acc, currentListing) => {
        return acc + getJobListingHTML(currentListing, filterTags);
      }, '');

      document.getElementById('jobs').innerHTML = jobsListingsHTML;
    })
    .catch(error => {
      console.error('Error fetching job listings:', error);
    });
}

function displaySearchWrapper(display = false) {
  const searchWrapper = document.getElementById('search');

  if (display) {
    searchWrapper.classList.remove(SEARCH_HIDDEN_CLASS);
  } else {
    searchWrapper.classList.add(SEARCH_HIDDEN_CLASS);
  }
}

function setSearchbarContent(searchContentEl, tags) {
  searchContentEl.innerHTML = tags.reduce((acc, currentTag) => {
    return acc + getTagHTML(currentTag, CLOSE_TAG_CLASS);
  }, '');
}

function resetState(searchContentEl) {
  searchContentEl.innerHTML = '';

  setJobsListings();
  displaySearchWrapper(false);
  toggleClass(targetEl, TAG_ACTIVE_CLASS);
}

document.addEventListener('click', (event) => {
  const targetEl = event.target;
  const targetText = targetEl.innerHTML.trim();
  const searchContentEl = document.getElementById('search-content');
  const searchBarTags = getSearchBarTags(targetText, searchContentEl);

  if (targetEl.id === 'clear' || !searchBarTags.length) {
    resetState(searchContentEl);
    return;
  }

  if (![TAG_CLASS, CLOSE_TAG_CLASS].includes(targetEl.classList)) {
    return;
  }

  setSearchbarContent(searchContentEl, searchBarTags);
  toggleClass(targetEl, TAG_ACTIVE_CLASS);
  displaySearchWrapper(true);
  setJobsListings(searchBarTags);
});
setJobsListings()