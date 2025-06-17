
// Bookmark management functionality
const BookmarkManager = {
  bookmarkedQuestions: [],

  loadBookmarkedQuestions() {
    const saved = localStorage.getItem('bookmarkedQuestions');
    this.bookmarkedQuestions = saved ? JSON.parse(saved) : [];
  },

  saveBookmarkedQuestions() {
    localStorage.setItem('bookmarkedQuestions', JSON.stringify(this.bookmarkedQuestions));
  },

  addBookmark(question, platform, subject, chapter) {
    const bookmark = {
      ...question,
      platform,
      subject,
      chapter,
      bookmarkedAt: new Date().toISOString()
    };
    
    // Check if already bookmarked
    const exists = this.bookmarkedQuestions.some(bq => 
      bq.q_no === question.q_no && 
      bq.platform === platform && 
      bq.subject === subject && 
      bq.chapter === chapter
    );
    
    if (!exists) {
      this.bookmarkedQuestions.push(bookmark);
      this.saveBookmarkedQuestions();
      this.updateBookmarkCount();
      return true;
    }
    return false;
  },

  removeBookmark(question, platform, subject, chapter) {
    this.bookmarkedQuestions = this.bookmarkedQuestions.filter(bq => 
      !(bq.q_no === question.q_no && 
        bq.platform === platform && 
        bq.subject === subject && 
        bq.chapter === chapter)
    );
    this.saveBookmarkedQuestions();
    this.updateBookmarkCount();
  },

  isBookmarked(question, platform, subject, chapter) {
    return this.bookmarkedQuestions.some(bq => 
      bq.q_no === question.q_no && 
      bq.platform === platform && 
      bq.subject === subject && 
      bq.chapter === chapter
    );
  },

  toggleBookmark() {
    const question = QuizState.questions[QuizState.currentQuestionIndex];
    const platform = QuizState.selectedPlatform;
    const subject = QuizState.selectedSubject;
    const chapter = QuizState.selectedChapter;
    
    if (this.isBookmarked(question, platform, subject, chapter)) {
      this.removeBookmark(question, platform, subject, chapter);
    } else {
      this.addBookmark(question, platform, subject, chapter);
    }
    
    this.updateBookmarkButton();
  },

  updateBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) return;
    
    const question = QuizState.questions[QuizState.currentQuestionIndex];
    const platform = QuizState.selectedPlatform;
    const subject = QuizState.selectedSubject;
    const chapter = QuizState.selectedChapter;
    
    const icon = bookmarkBtn.querySelector('i');
    if (this.isBookmarked(question, platform, subject, chapter)) {
      icon.className = 'fas fa-bookmark';
      bookmarkBtn.style.color = '#eab308';
    } else {
      icon.className = 'far fa-bookmark';
      bookmarkBtn.style.color = '#6b7280';
    }
  },

  updateBookmarkCount() {
    const countElement = document.getElementById('bookmark-count');
    if (countElement) {
      const count = this.bookmarkedQuestions.length;
      countElement.textContent = `${count} question${count !== 1 ? 's' : ''} saved`;
    }
  },

  viewBookmarkedQuestions() {
    NavigationManager.showScreen('bookmarked-questions');
    this.displayBookmarkedQuestions();
  },

  displayBookmarkedQuestions() {
    const container = document.getElementById('bookmarked-list');
    container.innerHTML = '';

    if (this.bookmarkedQuestions.length === 0) {
      container.innerHTML = `
        <div class="no-bookmarks">
          <i class="far fa-bookmark"></i>
          <h3>No Bookmarked Questions</h3>
          <p>Start a quiz and bookmark questions you want to review later.</p>
        </div>
      `;
      return;
    }

    // Group bookmarks by platform and subject
    const grouped = this.bookmarkedQuestions.reduce((acc, bookmark) => {
      const key = `${bookmark.platform}-${bookmark.subject}`;
      if (!acc[key]) {
        acc[key] = {
          platform: bookmark.platform,
          subject: bookmark.subject,
          questions: []
        };
      }
      acc[key].questions.push(bookmark);
      return acc;
    }, {});

    // Display grouped bookmarks
    Object.values(grouped).forEach(group => {
      const groupElement = document.createElement('div');
      groupElement.className = 'bookmark-group';

      groupElement.innerHTML = `
        <div class="bookmark-group-content">
          <div class="bookmark-questions">
            ${group.questions.map((question, index) => `
              <div class="bookmark-item" onclick="BookmarkManager.reviewBookmarkedQuestion(${this.bookmarkedQuestions.indexOf(question)})">
                <div class="bookmark-question-number">${question.q_no}</div>
                <div class="bookmark-question-text">${question.question.substring(0, 100)}${question.question.length > 100 ? '...' : ''}</div>
                <div class="bookmark-actions">
                  <button class="review-btn" onclick="event.stopPropagation(); BookmarkManager.reviewBookmarkedQuestion(${this.bookmarkedQuestions.indexOf(question)})">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="remove-bookmark-btn" onclick="event.stopPropagation(); BookmarkManager.removeBookmarkedQuestion(${this.bookmarkedQuestions.indexOf(question)})">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.appendChild(groupElement);
    });
  },

  reviewBookmarkedQuestion(index) {
    const bookmark = this.bookmarkedQuestions[index];
    
    // Set up quiz state for single question review
    QuizState.questions = [bookmark];
    QuizState.currentQuestionIndex = 0;
    QuizState.selectedPlatform = bookmark.platform;
    QuizState.selectedSubject = bookmark.subject;
    QuizState.selectedChapter = bookmark.chapter;
    QuizState.isReviewMode = true;
    QuizState.userAnswers = [bookmark.correct_answer]; // Show correct answer in review
    
    NavigationManager.showScreen('quiz-container');
    QuizManager.loadQuestion();
  },

  removeBookmarkedQuestion(index) {
    if (confirm('Are you sure you want to remove this bookmarked question?')) {
      this.bookmarkedQuestions.splice(index, 1);
      this.saveBookmarkedQuestions();
      this.updateBookmarkCount();
      this.displayBookmarkedQuestions();
    }
  }
};

// Export for global access
window.BookmarkManager = BookmarkManager;
