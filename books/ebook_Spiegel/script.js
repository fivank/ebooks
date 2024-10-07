const books = [
    { title: "Verzauberten Spiegel", folder: "ebook_Spiegel" },
    { title: "Alice Forest", folder: "ebook_Alices_Journey" }
];

async function checkImageExists(url) {
    try {
        console.log(`Checking: ${url}`);
        const response = await fetch(url);
        console.log(`Response for ${url}: ${response.status}`);
        return response.ok;
    } catch (err) {
        console.log(`Error checking ${url}: ${err}`);
        return false;
    }
}

async function getCoverImage(folder) {
    const jpgPath = `books/${folder}/image_cover.jpg`;
    const pngPath = `books/${folder}/image_cover.png`;
    const defaultPath = 'default-cover.png';
    
    if (await checkImageExists(jpgPath)) {
        return jpgPath;
    } else if (await checkImageExists(pngPath)) {
        return pngPath;
    } else {
        return defaultPath;
    }
}

async function loadBooks() {
    const bookList = document.getElementById('book-list');
    for (const book of books) {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        const bookCover = document.createElement('img');
        bookCover.className = 'book-cover';
        bookCover.src = await getCoverImage(book.folder);
        bookCover.alt = book.title;

        const bookTitle = document.createElement('div');
        bookTitle.className = 'book-title';
        bookTitle.textContent = book.title;

        bookItem.appendChild(bookCover);
        bookItem.appendChild(bookTitle);
        bookItem.addEventListener('click', () => openBook(book.folder));
        bookList.appendChild(bookItem);
    }
}

function openBook(folder) {
    window.location.href = `books/${folder}/index.html`;
}

document.addEventListener('DOMContentLoaded', loadBooks);
