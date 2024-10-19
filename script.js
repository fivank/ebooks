const books = [
    { title: "Verzauberten Spiegel", folder: "ebook_Spiegel" },
    { title: "Alice Forest", folder: "ebook_Alices_Journey" }
];

function getCoverImage(folder) {
    return new Promise((resolve) => {
        const defaultPath = 'default-cover.png';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        let found = false;

        const checkNext = (index) => {
            if (index >= imageExtensions.length) {
                resolve(defaultPath);
                return;
            }

            const ext = imageExtensions[index];
            const imgPath = `books/${folder}/image_cover.${ext}`;

            const img = new Image();
            img.onload = () => {
                resolve(imgPath);
            };
            img.onerror = () => {
                checkNext(index + 1);
            };
            img.src = imgPath;
        };

        checkNext(0);
    });
}

async function loadBooks() {
    const bookList = document.getElementById('book-list');

    const bookPromises = books.map(async (book) => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        const bookCover = document.createElement('img');
        bookCover.className = 'book-cover';
        bookCover.alt = book.title;

        getCoverImage(book.folder).then((src) => {
            bookCover.src = src;
        });

        const bookTitle = document.createElement('div');
        bookTitle.className = 'book-title';
        bookTitle.textContent = book.title;

        bookItem.appendChild(bookCover);
        bookItem.appendChild(bookTitle);
        bookItem.addEventListener('click', () => openBook(book.folder));
        bookList.appendChild(bookItem);
    });

    await Promise.all(bookPromises);
}

function openBook(folder) {
    window.location.href = `books/${folder}/index.html`;
}

document.addEventListener('DOMContentLoaded', loadBooks);
