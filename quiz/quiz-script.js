
let selectedPlatform = '';
let selectedSubject = '';
let selectedChapter = '';
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let score = 0;
let isReviewMode = false;

// Platform selection
function selectPlatform(platform) {
  selectedPlatform = platform;
  document.getElementById('platform-selection').style.display = 'none';
  document.getElementById('subject-selection').style.display = 'block';
}

// Subject selection
function selectSubject(subject) {
  selectedSubject = subject;
  document.getElementById('subject-selection').style.display = 'none';
  document.getElementById('chapter-selection').style.display = 'block';
  loadChapters();
}

// Load chapters from JSON file
async function loadChapters() {
  try {
    const response = await fetch(`${selectedPlatform}/${selectedSubject}/`);
    if (!response.ok) {
      // If directory listing is not available, try to load a known file
      const knownFiles = await getKnownFiles();
      displayChapters(knownFiles);
      return;
    }
    
    // For now, we'll use a predefined list since directory listing may not work
    const knownFiles = await getKnownFiles();
    displayChapters(knownFiles);
  } catch (error) {
    console.error('Error loading chapters:', error);
    // Fallback to known files
    const knownFiles = await getKnownFiles();
    displayChapters(knownFiles);
  }
}

async function getKnownFiles() {
  const knownFiles = [];
  
  // Try to load known files for the selected platform and subject
  const possibleFiles = [
    'PediAnatomy M8 Qbank_Pages_4-19.json',
    'sa',
    'ffg'
  ];
  
  for (const file of possibleFiles) {
    try {
      const response = await fetch(`${selectedPlatform}/${selectedSubject}/${file}`);
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
}

function displayChapters(chapters) {
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
    button.onclick = () => selectChapter(chapter.filename, chapter.name);
    chapterList.appendChild(button);
  });
}

// Chapter selection and quiz start
async function selectChapter(filename, chapterName) {
  selectedChapter = filename;
  
  try {
    const response = await fetch(`${selectedPlatform}/${selectedSubject}/${filename}`);
    if (!response.ok) {
      throw new Error('Failed to load chapter data');
    }
    
    if (filename.endsWith('.json')) {
      const data = await response.json();
      questions = data.questions || [];
    } else {
      // Handle non-JSON files
      const text = await response.text();
      questions = parseTextToQuestions(text, chapterName);
    }
    
    if (questions.length === 0) {
      alert('No questions found in this chapter.');
      return;
    }
    
    // Initialize quiz
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    isReviewMode = false;
    
    document.getElementById('chapter-selection').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    
    loadQuestion();
  } catch (error) {
    console.error('Error loading chapter:', error);
    alert('Error loading chapter. Please try again.');
  }
}

function parseTextToQuestions(text, chapterName) {
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

// Load current question
function loadQuestion() {
  const question = questions[currentQuestionIndex];
  
  // Update progress
  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = questions.length;
  
  // Load question text
  document.getElementById('question-text').textContent = `${question.q_no}. ${question.question}`;
  
  // Load question image if available
  const questionImageDiv = document.getElementById('question-image');
  const questionImg = document.getElementById('question-img');
  if (question.image) {
    questionImg.src = question.image;
    questionImageDiv.style.display = 'block';
  } else {
    questionImageDiv.style.display = 'none';
  }
  
  // Load options
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  
  Object.entries(question.options).forEach(([key, value]) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    
    // If in review mode, show the user's answer and correct answer
    if (isReviewMode) {
      const userAnswer = userAnswers[currentQuestionIndex];
      const correctAnswer = question.correct_answer;
      
      if (key === correctAnswer) {
        button.classList.add('correct');
      } else if (key === userAnswer && userAnswer !== correctAnswer) {
        button.classList.add('incorrect');
      }
      button.classList.add('disabled');
      button.onclick = null;
    } else {
      button.onclick = () => selectAnswer(key, button);
    }
    
    button.innerHTML = `
      <span class="option-label">${key}</span>
      <span>${value}</span>
    `;
    optionsContainer.appendChild(button);
  });
  
  // Show/hide explanation based on mode
  if (isReviewMode) {
    showExplanation();
  } else {
    document.getElementById('explanation-container').style.display = 'none';
  }
}

// Handle answer selection
function selectAnswer(selectedOption, buttonElement) {
  const question = questions[currentQuestionIndex];
  const correctAnswer = question.correct_answer;
  
  // Disable all option buttons
  const allOptions = document.querySelectorAll('.option-btn');
  allOptions.forEach(btn => {
    btn.classList.add('disabled');
    btn.onclick = null;
  });
  
  // Mark correct and incorrect answers
  allOptions.forEach(btn => {
    const optionLabel = btn.querySelector('.option-label').textContent;
    if (optionLabel === correctAnswer) {
      btn.classList.add('correct');
    } else if (optionLabel === selectedOption && selectedOption !== correctAnswer) {
      btn.classList.add('incorrect');
    }
  });
  
  // Store user answer
  userAnswers[currentQuestionIndex] = selectedOption;
  
  // Update score
  if (selectedOption === correctAnswer) {
    score++;
  }
  
  // Show explanation
  setTimeout(() => {
    showExplanation();
  }, 1000);
}

// Show explanation
function showExplanation() {
  const question = questions[currentQuestionIndex];
  const explanationContainer = document.getElementById('explanation-container');
  const explanationText = document.getElementById('explanation-text');
  const explanationImageDiv = document.getElementById('explanation-image');
  const explanationImg = document.getElementById('explanation-img');
  
  explanationText.textContent = question.explanation || 'No explanation available.';
  
  if (question.explanation_image) {
    explanationImg.src = question.explanation_image;
    explanationImageDiv.style.display = 'block';
  } else {
    explanationImageDiv.style.display = 'none';
  }
  
  explanationContainer.style.display = 'block';
  
  // Clear existing buttons
  const existingButtons = explanationContainer.querySelectorAll('.next-btn, .back-to-results-btn');
  existingButtons.forEach(btn => btn.remove());
  
  // Create button container if it doesn't exist
  let buttonContainer = explanationContainer.querySelector('.explanation-buttons');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.className = 'explanation-buttons';
    buttonContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;';
    explanationContainer.appendChild(buttonContainer);
  }
  buttonContainer.innerHTML = '';
  
  if (isReviewMode) {
    // Always show "Back to Results" button in review mode
    const backButton = document.createElement('button');
    backButton.className = 'back-to-results-btn';
    backButton.innerHTML = '<i class="fas fa-chart-bar"></i> Back to Results';
    backButton.style.cssText = 'background: #2c5282; color: white; border: none; padding: 1.25rem 2.5rem; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem;';
    backButton.onmouseover = () => backButton.style.background = '#1a365d';
    backButton.onmouseout = () => backButton.style.background = '#2c5282';
    backButton.onclick = () => backToResults();
    buttonContainer.appendChild(backButton);
    
    // Show next button if not on last question
    if (currentQuestionIndex < questions.length - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'next-btn';
      nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next Question';
      nextBtn.style.cssText = 'background: #16a34a; color: white; border: none; padding: 1.25rem 2.5rem; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem;';
      nextBtn.onmouseover = () => nextBtn.style.background = '#15803d';
      nextBtn.onmouseout = () => nextBtn.style.background = '#16a34a';
      nextBtn.onclick = () => nextQuestion();
      buttonContainer.appendChild(nextBtn);
    }
  } else {
    // Normal quiz mode
    const nextBtn = document.createElement('button');
    nextBtn.className = 'next-btn';
    nextBtn.style.cssText = 'background: #16a34a; color: white; border: none; padding: 1.25rem 2.5rem; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.75rem; margin: 0 auto;';
    nextBtn.onmouseover = () => nextBtn.style.background = '#15803d';
    nextBtn.onmouseout = () => nextBtn.style.background = '#16a34a';
    nextBtn.onclick = () => nextQuestion();
    
    if (currentQuestionIndex === questions.length - 1) {
      nextBtn.innerHTML = '<i class="fas fa-check"></i> Finish Quiz';
    } else {
      nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next Question';
    }
    
    buttonContainer.appendChild(nextBtn);
  }
}

// Next question or finish quiz
function nextQuestion() {
  if (isReviewMode) {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      loadQuestion();
    }
  } else {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      loadQuestion();
    } else {
      showResults();
    }
  }
}

// Back to results function
function backToResults() {
  isReviewMode = false;
  showResults();
}

// Show quiz results
function showResults() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  
  const percentage = Math.round((score / questions.length) * 100);
  
  document.getElementById('score-percentage').textContent = `${percentage}%`;
  document.getElementById('correct-answers').textContent = score;
  document.getElementById('total-questions-result').textContent = questions.length;
  
  // Update score circle color based on performance
  const scoreCircle = document.querySelector('.score-circle');
  if (percentage >= 80) {
    scoreCircle.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
  } else if (percentage >= 60) {
    scoreCircle.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
  } else {
    scoreCircle.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  }
  
  // Show analysis container
  showAnalysisContainer();
}

// Show analysis container with question numbers
function showAnalysisContainer() {
  const analysisContainer = document.getElementById('analysis-container');
  const questionGrid = document.getElementById('question-grid');
  
  questionGrid.innerHTML = '';
  
  questions.forEach((question, index) => {
    const questionBtn = document.createElement('button');
    questionBtn.className = 'question-number-btn';
    questionBtn.textContent = index + 1;
    
    const userAnswer = userAnswers[index];
    const correctAnswer = question.correct_answer;
    
    if (userAnswer === correctAnswer) {
      questionBtn.classList.add('correct');
    } else {
      questionBtn.classList.add('incorrect');
    }
    
    questionBtn.onclick = () => reviewQuestion(index);
    questionGrid.appendChild(questionBtn);
  });
  
  analysisContainer.style.display = 'block';
}

// Review specific question
function reviewQuestion(questionIndex) {
  currentQuestionIndex = questionIndex;
  isReviewMode = true;
  
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  
  loadQuestion();
}

// Restart quiz
function restartQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  score = 0;
  isReviewMode = false;
  
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  
  loadQuestion();
}

// Exit quiz
function exitQuiz() {
  // Reset all states
  selectedPlatform = '';
  selectedSubject = '';
  selectedChapter = '';
  currentQuestionIndex = 0;
  questions = [];
  userAnswers = [];
  score = 0;
  isReviewMode = false;
  
  // Show platform selection
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('chapter-selection').style.display = 'none';
  document.getElementById('subject-selection').style.display = 'none';
  document.getElementById('platform-selection').style.display = 'block';
}
