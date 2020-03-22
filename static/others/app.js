const getForm = document.querySelector("#form")
const searchInput = document.querySelector("#search")
const songsContainer = document.querySelector("#songs-container")
const prevAndNextContainer = document.querySelector("#prev-and-next-container")

const lyricsURL = `https://api.lyrics.ovh`

async function fetchAPI(apiURL) {
  const response = await fetch(apiURL)
  return await response.json()
}

form.addEventListener('submit', handleFormSubmit)

function handleFormSubmit(event) {
  event.preventDefault();

  const searchInputStringTrack = searchInput.value.trim()
  searchInput.value = ''
  searchInput.focus()

  if (!searchInputStringTrack) {
    songsContainer.innerHTML = `
    <li class="warning-message">
      Por favor, insira o nome de uma música para prosseguir!
    </li>`
    return; // ends execution
  }
  fetchSongs(searchInputStringTrack)
}

async function fetchSongs(inputTerm) {
  const response = await fetchAPI(`${lyricsURL}/suggest/${inputTerm}`)
  insertSongsIntoPage(response)
}

function insertSongsIntoPage({ data, prev, next }) {
  // debugger
  songsContainer.innerHTML = data.map(({ title, artist: { name } }) =>
    `
    <li class="song">
      <span class="song-artist">
      ${title} - 
          <strong>
            ${name}
          </strong>
        </span>
        <button class="btn" data-artist="${name}" data-song-title="${title}">
          Ver letra
        </button>
    </li>
    <hr class="solid">
    `
  ).join('')
  
  if (prev || next) {
    insertButtonOpenMoreSongsIntoPage({ prev, next })
    return // does not pass value, just closes
  }
  prevAndNextContainer.innerHTML = ''
}

function insertButtonOpenMoreSongsIntoPage({ prev, next }) {
    prevAndNextContainer.innerHTML = `
    ${prev ? `<button class="btn" onClick="openMoreSongs('${prev}')">Anteriores</button>` : ""}
    ${next ? `<button class="btn" onClick="openMoreSongs('${next}')">Próximas</button>` : ""}
  `
}

async function openMoreSongs(songsNextOrPrev) {
  const response = await fetchAPI(`https://cors-anywhere.herokuapp.com/${songsNextOrPrev}`)
  insertSongsIntoPage(response)
}

function handleSongsContainerClick(event) {
  const clickedElement = event.target
  if (clickedElement.tagName === 'BUTTON') {
    const artist = clickedElement.getAttribute("data-artist")
    const songTitle = clickedElement.getAttribute("data-song-title")
    searchMusicLyrics(artist, songTitle)
  }
}

songsContainer.addEventListener('click', handleSongsContainerClick)

async function searchMusicLyrics(artist, songTitle) {
  const response = await fetchAPI(`${lyricsURL}/v1/${artist}/${songTitle}`)
  const { lyrics } = response;

  const lyricsFormat = lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
  insertLyricsIntoSongsContainer({ lyricsFormat, artist, songTitle })
}

function insertLyricsIntoSongsContainer({ lyricsFormat, artist, songTitle }) {
  songsContainer.innerHTML = `
  <li class="lyrics-container">
    <h2>
      <strong>
        ${songTitle}
      </strong>
      - ${artist}
    </h2>
    <p class="lyrics">${lyricsFormat}</p>
  </li>`

  if (songsContainer) {
    prevAndNextContainer.innerHTML = ''
    return
  }
}
