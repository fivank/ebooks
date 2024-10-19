// Unique identifier for this book
const bookId = 'ebook_Spiegel';

// Initial chapter and quiz data variables
let currentChapter = 0;
let quizData = null;
const totalChapters = 7; // Total number of chapters in the book

// Function to load reading progress from localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem('bookProgress_' + bookId);
    return savedProgress ? JSON.parse(savedProgress) : { lastChapter: 0, completedQuizzes: [] };
}

// Function to save reading progress to localStorage
function saveProgress(progress) {
    localStorage.setItem('bookProgress_' + bookId, JSON.stringify(progress));
}

// Load initial progress
let progress = loadProgress();

// Function to load and display the cover page
async function loadCover() {
    const response = await fetch('cover.md');
    const coverText = await response.text();

    // Create and append the cover image
    const coverImage = document.createElement('img');
    coverImage.src = 'image_cover.jpg';
    coverImage.alt = 'Book Cover';
    document.getElementById('cover-content').appendChild(coverImage);

    // Append the text from cover.md
    const coverContent = document.createElement('div');
    coverContent.innerHTML = marked(coverText);
    document.getElementById('cover-content').appendChild(coverContent);
}

// Function to start reading the book
function startReading() {
    document.getElementById('cover').style.display = 'none';
    document.getElementById('book-content').style.display = 'block';
    if (progress.lastChapter === 0) {
        loadChapter(1);
    } else {
        loadChapter(progress.lastChapter);
    }
    updateProgressBar();
    updateTableOfContents();
}

// Function to load and display a chapter
async function loadChapter(chapterNumber) {
    currentChapter = chapterNumber;
    const response = await fetch(`chapter${chapterNumber}.md`);
    const chapterText = await response.text();
    document.getElementById('chapter-content').innerHTML = marked(chapterText);
    updateProgressBar();
    updateTableOfContents();

    // Scroll to the top of the page
    window.scrollTo(0, 0);

    // Check if the quiz for the chapter is already completed
    if (progress.completedQuizzes.includes(chapterNumber)) {
        document.getElementById('next-chapter').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
    } else {
        document.getElementById('next-chapter').style.display = 'none';
        loadQuiz(chapterNumber);
    }
}

// Function to load quiz data for a chapter
async function loadQuiz(chapterNumber) {
    const response = await fetch(`chapter${chapterNumber}.json`);
    quizData = await response.json();
    displayQuiz();
}

// Function to display the quiz
function displayQuiz() {
    const quizContainer = document.getElementById('quiz-questions');
    quizContainer.innerHTML = '';
    quizData.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `
            <h3>${question.question}</h3>
            ${question.options.map((option, optionIndex) => `
                <label>
                    <input type="radio" name="question${index}" value="${optionIndex}">
                    ${option}
                </label>
            `).join('')}
        `;
        quizContainer.appendChild(questionElement);
    });
    document.getElementById('quiz-container').style.display = 'block';
}

// Function to check the quiz answers
function checkQuiz() {
    let correctAnswers = 0;
    quizData.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
        if (selectedOption && parseInt(selectedOption.value) === question.correctAnswer) {
            correctAnswers++;
        }
    });
    return correctAnswers;
}

// Function to update the progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = (currentChapter / totalChapters) * 100;
    progressBar.innerHTML = `<div class="progress" style="width: ${progressPercentage}%"></div>`;
}

// Function to update the table of contents
function updateTableOfContents() {
    const toc = document.getElementById('table-of-contents');
    toc.innerHTML = '<h2>Table of Contents</h2><ul>';
    toc.innerHTML += `<li onclick="showCover()">Cover</li>`;
    for (let i = 1; i <= totalChapters; i++) {
        const isCompleted = progress.completedQuizzes.includes(i);
        const isUnlocked = i <= progress.lastChapter + 1;
        const icon = isCompleted ? '•' : (isUnlocked ? '' : '🔒');
        const className = isUnlocked ? 'unlocked' : 'locked';
        toc.innerHTML += `<li class="${className}" onclick="jumpToChapter(${i})">${icon} Chapter ${i}</li>`;
    }
    toc.innerHTML += '</ul>';
}

// Function to jump to a specific chapter
function jumpToChapter(chapterNumber) {
    if (chapterNumber <= progress.lastChapter + 1) {
        loadChapter(chapterNumber);
    }
}

// Function to display the cover page again
function showCover() {
    document.getElementById('book-content').style.display = 'none';
    document.getElementById('cover').style.display = 'block';
}

// Function to display magical text feedback
function showMagicalText(message) {
    // Remove any existing magical text
    const existingMagicalText = document.querySelector('.magical-text');
    if (existingMagicalText) {
        existingMagicalText.remove();
    }

    const magicalText = document.createElement('div');
    magicalText.className = 'magical-text';
    magicalText.textContent = message;
    document.getElementById('quiz-container').appendChild(magicalText);

    setTimeout(() => {
        magicalText.style.opacity = '1';
    }, 100);
}

// Event listener for submitting the quiz
document.getElementById('submit-quiz').addEventListener('click', () => {
    const correctAnswers = checkQuiz();
    if (correctAnswers >= 4) {
        showMagicalText(`Congratulations! You have answered ${correctAnswers} questions correctly and can read the next chapter!`);
        document.getElementById('next-chapter').style.display = 'block';
        if (!progress.completedQuizzes.includes(currentChapter)) {
            progress.completedQuizzes.push(currentChapter);
        }
        saveProgress(progress);
    } else {
        showMagicalText(`Keep trying, you have answered ${correctAnswers} questions correctly!`);
    }
});

// Event listener for proceeding to the next chapter
document.getElementById('next-chapter').addEventListener('click', () => {
    if (currentChapter < totalChapters) {
        loadChapter(currentChapter + 1);
    } else {
        endBook();
    }
});

// Function to display the end of the book message
function endBook() {
    document.getElementById('chapter-content').innerHTML = `
        <h1>Congratulations!</h1>
        <p>You've completed all chapters of the magical book. Well done, young wizard!</p>
        <button onclick="restartBook()">Embark on Another Adventure</button>
    `;
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('next-chapter').style.display = 'none';
}

// Function to restart the book
function restartBook() {
    // Do not reset progress to keep chapters unlocked
    // Instead, just start reading from the first chapter
    loadChapter(1);
}

// Event listener for starting the reading process
document.getElementById('start-reading').addEventListener('click', startReading);

// Initial load of the cover page when the app starts
loadCover();
