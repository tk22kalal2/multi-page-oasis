
export class LectureList {
  constructor() {
    this.lectures = [];
  }

  async loadLectures(platform, subject) {
    try {
      const response = await fetch(`src/platforms/${platform}/subjects/${subject.toLowerCase()}.json`);
      if (response.ok) {
        const data = await response.json();
        this.lectures = data.lectures || [];
      } else {
        // Default lectures if JSON file doesn't exist
        this.lectures = this.getDefaultLectures(subject);
      }
    } catch (error) {
      console.log('Loading default lectures for', subject);
      this.lectures = this.getDefaultLectures(subject);
    }
  }

  getDefaultLectures(subject) {
    return [
      {
        title: `Introduction to ${subject}`,
        duration: '45 min',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        downloadUrl: '#'
      },
      {
        title: `Basic Concepts of ${subject}`,
        duration: '52 min',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        downloadUrl: '#'
      },
      {
        title: `Advanced ${subject} Topics`,
        duration: '38 min',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        downloadUrl: '#'
      },
      {
        title: `${subject} Clinical Applications`,
        duration: '41 min',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        downloadUrl: '#'
      },
      {
        title: `${subject} Review and Practice`,
        duration: '35 min',
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        downloadUrl: '#'
      }
    ];
  }

  render() {
    const container = document.createElement('div');
    container.className = 'lecture-list';

    this.lectures.forEach(lecture => {
      const lectureCard = document.createElement('div');
      lectureCard.className = 'lecture-card';
      lectureCard.innerHTML = `
        <h3>${lecture.title}</h3>
        <div class="button-container">
          <button class="stream-button" onclick="this.parentElement.parentElement.querySelector('h3').click()">
            <i class="fas fa-play"></i> Stream (${lecture.duration})
          </button>
          <button class="download-button">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      `;

      const title = lectureCard.querySelector('h3');
      title.style.cursor = 'pointer';
      title.onclick = () => this.openVideoPopup(lecture.title, lecture.streamUrl);

      container.appendChild(lectureCard);
    });

    return container;
  }

  openVideoPopup(title, streamUrl) {
    const popup = document.createElement('div');
    popup.className = 'video-popup';
    popup.innerHTML = `
      <div class="video-popup-content">
        <button class="close-popup">&times;</button>
        <h2 class="video-title">${title}</h2>
        <div class="iframe-container">
          <iframe src="${streamUrl}" allowfullscreen></iframe>
        </div>
      </div>
    `;

    popup.querySelector('.close-popup').onclick = () => {
      document.body.removeChild(popup);
    };

    popup.onclick = (e) => {
      if (e.target === popup) {
        document.body.removeChild(popup);
      }
    };

    document.body.appendChild(popup);
  }
}
