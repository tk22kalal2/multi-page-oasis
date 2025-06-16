
// Chapter loading and management
const ChapterManager = {
  async loadChapters() {
    try {
      const response = await fetch(`${QuizState.selectedPlatform}/${QuizState.selectedSubject}/`);
      if (!response.ok) {
        // If directory listing is not available, try to load a known file
        const knownFiles = await this.getKnownFiles();
        this.displayChapters(knownFiles);
        return;
      }
      
      // For now, we'll use a predefined list since directory listing may not work
      const knownFiles = await this.getKnownFiles();
      this.displayChapters(knownFiles);
    } catch (error) {
      console.error('Error loading chapters:', error);
      // Fallback to known files
      const knownFiles = await this.getKnownFiles();
      this.displayChapters(knownFiles);
    }
  },

  async getKnownFiles() {
    const knownFiles = [];
    
    // Try to load known files for the selected platform and subject
    const possibleFiles = [
      'PediAnatomy M8 Qbank_Pages_4-19.json',
      'sa',
      'ffg'
    ];
    
    for (const file of possibleFiles) {
      try {
        const response = await fetch(`${QuizState.selectedPlatform}/${QuizState.selectedSubject}/${file}`);
        if (response.ok) {
          const isJson = file.endsWith('.json');
          if (isJson) {
            const data = await response.json();
            knownFiles.push({
              name: data.chapter || file.replace('.json', ''),
              filename: file
            });
          } else {
            knownFiles.push({
              name: file,
              filename: file
            });
          }
        }
      } catch (error) {
        console.log(`File ${file} not found`);
      }
    }
    
    return knownFiles;
  },

  displayChapters(chapters) {
    const chapterList = document.getElementById('chapter-list');
    chapterList.innerHTML = '';
    
    if (chapters.length === 0) {
      chapterList.innerHTML = '<p>No chapters available for this combination.</p>';
      return;
    }
    
    chapters.forEach(chapter => {
      const button = document.createElement('button');
      button.className = 'chapter-btn';
      button.innerHTML = `<i class="fas fa-book"></i> ${chapter.name}`;
      button.onclick = () => this.selectChapter(chapter.filename, chapter.name);
      chapterList.appendChild(button);
    });
  },

  async selectChapter(filename, chapterName) {
    QuizState.selectedChapter = filename;
    
    try {
      const response = await fetch(`${QuizState.selectedPlatform}/${QuizState.selectedSubject}/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to load chapter data');
      }
      
      if (filename.endsWith('.json')) {
        const data = await response.json();
        QuizState.questions = data.questions || [];
      } else {
        // Handle non-JSON files
        const text = await response.text();
        QuizState.questions = this.parseTextToQuestions(text, chapterName);
      }
      
      if (QuizState.questions.length === 0) {
        alert('No questions found in this chapter.');
        return;
      }
      
      // Initialize quiz
      QuizState.currentQuestionIndex = 0;
      QuizState.userAnswers = [];
      QuizState.score = 0;
      QuizState.isReviewMode = false;
      
      NavigationManager.showScreen('quiz-container');
      QuizManager.loadQuestion();
    } catch (error) {
      console.error('Error loading chapter:', error);
      alert('Error loading chapter. Please try again.');
    }
  },

  parseTextToQuestions(text, chapterName) {
    // Simple parser for text files - this is a basic implementation
    // You can enhance this based on the actual format of your text files
    if (text.trim() === 'fg' || text.trim() === 'q') {
      return [{
        q_no: 1,
        question: `Sample question from ${chapterName}`,
        options: {
          A: "Option A",
          B: "Option B", 
          C: "Option C",
          D: "Option D"
        },
        correct_answer: "A",
        explanation: "This is a sample question since the file contains minimal content.",
        chapter_heading: chapterName
      }];
    }
    return [];
  }
};

// Export for global access
window.ChapterManager = ChapterManager;
