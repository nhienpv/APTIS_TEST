var currentAnswers = null;
let currentSkill = null;
let currentTestId = null;
let currentTestData = null;
let allSkillData = {};
let taskScores = {}; // Lưu trữ điểm số của từng task
let currentMode = null; // 'practice' hoặc 'mock'

// Biến cho timer đếm ngược
let countdownTimer = null;
let timeLeft = 2100; // 45 phút = 2700 giây
let isTimerRunning = false;

/* =================================
   KHỞI TẠO VÀ TẢI DỮ LIỆU
   ================================= */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const readingResponse = await fetch('reading_tests.json');
        allSkillData.reading = await readingResponse.json();
        
        const listeningResponse = await fetch('listening_tests.json');
        allSkillData.listening = await listeningResponse.json();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài thi:", error);
        alert("Không thể tải dữ liệu bài thi.");
        return;
    }
    initializeUI();
});

/* =================================
   GÁN SỰ KIỆN CHO CÁC NÚT BẤM
   ================================= */
function initializeUI() {
    // Main Menu
    document.getElementById('practice-btn').addEventListener('click', () => showSkillSelection('practice'));
    document.getElementById('mock-test-btn').addEventListener('click', () => showSkillSelection('mock'));

    // Skill Selection
    document.getElementById('reading-skill-btn').addEventListener('click', () => handleSkillSelection('reading'));
    document.getElementById('listening-skill-btn').addEventListener('click', () => handleSkillSelection('listening'));
    document.querySelector('.back-to-main').addEventListener('click', showMainMenu);

    // Test Selection
    document.querySelector('.back-to-skill-selection').addEventListener('click', () => showSkillSelection(currentMode));
    
    // Test Container
    document.getElementById('submitBtn').addEventListener('click', () => checkAnswers(null)); // Nút nộp bài cuối cùng
    document.getElementById('resetBtn').addEventListener('click', resetCurrentTest);
    document.querySelector('#test-container .back-to-selection').addEventListener('click', () => {
        if (currentMode === 'practice') {
            showTestSelection(currentSkill);
        } else {
            showSkillSelection(currentMode);
        }
    });
    
    // Nút quay lại ở đầu trang (chế độ luyện tập)
    document.querySelector('.back-to-selection-top').addEventListener('click', () => {
        showTestSelection(currentSkill);
    });
    // Dọn dẹp các mã cũ không còn dùng (tránh trùng ID và sự kiện)
}

/* =================================
   CÁC HÀM HIỂN THỊ MÀN HÌNH
   ================================= */
function showScreen(screenId) {
    ['main-menu', 'skill-selection-screen', 'test-selection-screen', 'test-container'].forEach(id => {
        document.getElementById(id).style.display = (id === screenId) ? 'block' : 'none';
    });
}

function showMainMenu() {
    // Dừng timer khi quay lại màn hình chính
    stopCountdownTimer();
    showScreen('main-menu');
}

function showSkillSelection(mode) {
    // Dừng timer khi chọn skill mới
    stopCountdownTimer();
    currentMode = mode;
    const title = (mode === 'practice') ? 'Luyện tập' : 'Thi thử';
    document.getElementById('skill-selection-title').textContent = title;
    showScreen('skill-selection-screen');
}

function showTestSelection(skill) {
    currentSkill = skill;
    document.getElementById('test-selection-title').textContent = `${skill.charAt(0).toUpperCase() + skill.slice(1)} - Luyện tập`;
    const testButtonsContainer = document.getElementById('test-buttons');
    testButtonsContainer.innerHTML = '';
    
    const tests = allSkillData[skill] || {};
    for (const testId in tests) {
        const button = document.createElement('button');
        button.textContent = testId.replace(/_/g, ' ');
        button.addEventListener('click', () => loadTest(testId));
        testButtonsContainer.appendChild(button);
    }
    showScreen('test-selection-screen');
}

/* =================================
   LOGIC TẢI VÀ TẠO BÀI TEST
   ================================= */
function handleSkillSelection(skill) {
    currentSkill = skill;
    if (currentMode === 'practice') {
        showTestSelection(skill);
    } else {
        generateAndLoadMockTest();
    }
}

function loadTest(testId) {
    currentTestId = testId;
    currentTestData = JSON.parse(JSON.stringify(allSkillData[currentSkill][testId]));
    // Reset taskScores khi bắt đầu bài thi mới
    taskScores = {};
    displayTest(currentTestData);
    // Thêm dòng này để gán đáp án cho phần reading
    if (currentSkill === 'reading') {
        currentAnswers = currentTestData.answers;
    }
}

function generateAndLoadMockTest() {
    let mockTestData;
    if (currentSkill === 'reading') {
        mockTestData = generateReadingMockTest();
    } else {
        mockTestData = generateListeningMockTest();
    }
    currentTestData = mockTestData;
    // Reset taskScores khi bắt đầu bài thi mới
    taskScores = {};
    displayTest(currentTestData);
    // Thêm dòng này
    if (currentSkill === 'reading') {
        currentAnswers = currentTestData.answers;
    }
}

function displayTest(testData) {
    document.getElementById('test-title').textContent = testData.title;
    if (currentSkill === 'reading') {
        // Truyền đúng tham số isMockTest
        loadReadingTest(testData, currentMode === 'mock');
    } else {
        loadListeningTest(testData, currentMode);
    }
    
    // Ẩn/hiện nút nộp bài cuối cùng và nút quay lại ở đầu
    const finalControls = document.getElementById('final-controls');
    const topBackButton = document.getElementById('top-back-button');
    
    if (currentMode === 'mock') {
        finalControls.style.display = 'block';
        topBackButton.style.display = 'none';
        // Bắt đầu timer đếm ngược cho chế độ thi thử
        startCountdownTimer();
    } else {
        finalControls.style.display = 'none';
        topBackButton.style.display = 'block';
        // Đảm bảo timer không chạy trong chế độ luyện tập
        stopCountdownTimer();
    }

    clearAllFeedback();
    showScreen('test-container');
}

function resetCurrentTest() {
    // Reset timer khi làm lại bài thi
    if (currentMode === 'mock') {
        resetTimer();
    }
    
    if (currentMode === 'practice') {
        loadTest(currentTestId);
    } else {
        generateAndLoadMockTest();
    }
}

/* =================================
   TẠO ĐỀ THI THỬ NGẪU NHIÊN
   ================================= */
function generateReadingMockTest() {
    const allTests = Object.values(allSkillData.reading);
    const mockTest = {
        title: "Bài Thi Thử Reading Ngẫu Nhiên",
        task1: null,
        task2: null,
        task3: null,
        task4: null,
        task5: null,
        answers: {}
    };

    // Task 1: lấy ngẫu nhiên 1 task1
    const task1Arr = allTests.map(test => test.task1).filter(Boolean);
    mockTest.task1 = JSON.parse(JSON.stringify(task1Arr[Math.floor(Math.random() * task1Arr.length)]));

    // Task 2: lấy ngẫu nhiên 1 task2 và đảo thứ tự
    const task2Arr = allTests.map(test => test.task2).filter(Boolean);
    mockTest.task2 = JSON.parse(JSON.stringify(task2Arr[Math.floor(Math.random() * task2Arr.length)]));
    // Đảo thứ tự các câu (trừ câu order 1)
    if (mockTest.task2 && mockTest.task2.sentences) {
        const fixed = mockTest.task2.sentences.find(s => s.order === 1);
        let draggables = mockTest.task2.sentences.filter(s => s.order !== 1);
        draggables = shuffleArray(draggables);
        mockTest.task2.sentences = fixed ? [fixed, ...draggables] : draggables;
    }

    // Task 3: lấy ngẫu nhiên 1 task3 và đảo thứ tự
    const task3Arr = allTests.map(test => test.task3).filter(Boolean);
    mockTest.task3 = JSON.parse(JSON.stringify(task3Arr[Math.floor(Math.random() * task3Arr.length)]));
    if (mockTest.task3 && mockTest.task3.sentences) {
        const fixed = mockTest.task3.sentences.find(s => s.order === 1);
        let draggables = mockTest.task3.sentences.filter(s => s.order !== 1);
        draggables = shuffleArray(draggables);
        mockTest.task3.sentences = fixed ? [fixed, ...draggables] : draggables;
    }

    // Task 4: lấy ngẫu nhiên 1 task4, đảo nhân vật và câu hỏi, mapping lại đáp án
    const task4Arr = allTests.map(test => test.task4).filter(Boolean);
    const task4Origin = task4Arr[Math.floor(Math.random() * task4Arr.length)];
    const task4 = JSON.parse(JSON.stringify(task4Origin));
    // Đảo nhân vật
    let readingParts = Array.isArray(task4.readingTextParts) ? [...task4.readingTextParts] : [];
    let originalToShuffled = {};
    let shuffledToOriginal = {};
    if (readingParts.length > 0) {
        readingParts = shuffleArray(readingParts);
        const newPersons = ['A', 'B', 'C', 'D'];
        readingParts.forEach((part, idx) => {
            originalToShuffled[part.person] = newPersons[idx];
            shuffledToOriginal[newPersons[idx]] = part.person;
            part._shuffledPerson = newPersons[idx];
        });
        task4.readingTextParts = readingParts;
    }
    // Đảo thứ tự câu hỏi
    if (task4.questions) {
        task4.questions = shuffleArray(task4.questions);
    }
    // Mapping lại đáp án cho task4
    let task4AnswerOrigin = null;
    for (const test of allTests) {
        if (test.task4 === task4Origin && test.answers && test.answers.task4) {
            task4AnswerOrigin = test.answers.task4;
            break;
        }
    }
    const mappedTask4Answers = {};
    if (task4AnswerOrigin) {
        for (const qName in task4AnswerOrigin) {
            const originalPerson = task4AnswerOrigin[qName];
            mappedTask4Answers[qName] = originalToShuffled[originalPerson] || originalPerson;
        }
    }
    mockTest.task4 = task4;

    // Task 5: lấy ngẫu nhiên 1 task5
    const task5Arr = allTests.map(test => test.task5).filter(Boolean);
    mockTest.task5 = JSON.parse(JSON.stringify(task5Arr[Math.floor(Math.random() * task5Arr.length)]));

    // Đáp án cho từng task
    // Task 1
    for (const test of allTests) {
        if (test.task1 && JSON.stringify(test.task1) === JSON.stringify(mockTest.task1) && test.answers && test.answers.task1) {
            mockTest.answers.task1 = test.answers.task1;
            break;
        }
    }
    // Task 2
    for (const test of allTests) {
        if (test.task2 && JSON.stringify(test.task2) === JSON.stringify(mockTest.task2) && test.answers && test.answers.task2_order) {
            mockTest.answers.task2_order = test.answers.task2_order;
            break;
        }
    }
    // Task 3
    for (const test of allTests) {
        if (test.task3 && JSON.stringify(test.task3) === JSON.stringify(mockTest.task3) && test.answers && test.answers.task3_order) {
            mockTest.answers.task3_order = test.answers.task3_order;
            break;
        }
    }
    // Task 4
    mockTest.answers.task4 = mappedTask4Answers;
    // Task 5
    for (const test of allTests) {
        if (test.task5 && JSON.stringify(test.task5) === JSON.stringify(mockTest.task5) && test.answers && test.answers.task5) {
            mockTest.answers.task5 = test.answers.task5;
            break;
        }
    }
    return mockTest;
}

function generateListeningMockTest() {
    const allTests = Object.values(allSkillData.listening);
    const mockTest = {
        title: "Bài Thi Thử Listening Ngẫu Nhiên",
        parts: [],
        answers: {}
    };

    // Task 1: Lấy 13 câu ngẫu nhiên từ tất cả các test
    let allTask1Questions = [];
    allTests.forEach(test => {
        if (test.parts && test.parts[0] && test.parts[0].type === 'multiple_choice') {
            allTask1Questions.push(...test.parts[0].data);
        }
    });
    const random13Questions = shuffleArray(allTask1Questions).slice(0, 13);
    mockTest.parts.push({ ...allTests[0].parts[0], data: random13Questions });
    random13Questions.forEach(q => mockTest.answers[q.id] = q.answer);

    // Các task còn lại: Lấy từ một bài test ngẫu nhiên
    const randomTestForOtherParts = allTests[Math.floor(Math.random() * allTests.length)];
    for (let i = 1; i < randomTestForOtherParts.parts.length; i++) {
        mockTest.parts.push(randomTestForOtherParts.parts[i]);
        randomTestForOtherParts.parts[i].data.forEach(q => {
            mockTest.answers[q.id] = q.answer;
        });
    }
    return mockTest;
}

/* =================================
   KIỂM TRA ĐÁP ÁN & CÁC HÀM KHÁC
   ================================= */
function checkAnswers(taskId) {
    if (currentSkill === 'reading') {
        const answers = currentTestData.answers;
        const result = checkReadingAnswers(answers, taskId);
        // Nếu kiểm tra từng task và là mock test, lưu điểm số
        if (taskId && currentMode === 'mock') {
            taskScores[taskId] = result;
        }
    } else {
        // Listening không cần logic đặc biệt cho mock test
        checkListeningAnswers(null, taskId);
    }
    // CHỈ KHÓA INPUT KHI NỘP TOÀN BÀI (KHÔNG KHÓA KHI taskId != null)
    if (!taskId) {
        // Dừng timer khi nộp toàn bài
        if (currentMode === 'mock') {
            stopCountdownTimer();
        }
        
        disableTestInputs();
        // Nếu là mock test, chấm điểm toàn bộ bài thi
        if (currentMode === 'mock') {
            if (currentSkill === 'reading') {
                // Chấm điểm toàn bộ bài thi và hiển thị kết quả
                const finalResult = checkReadingAnswers(currentTestData.answers, null);
                const finalResultElement = document.getElementById('finalResult');
                if (finalResultElement) {
                    finalResultElement.textContent = `Kết quả: Bạn đã trả lời đúng ${finalResult.correct} / ${finalResult.total} câu.`;
                    finalResultElement.className = 'result ' + ((finalResult.total > 0 && finalResult.correct / finalResult.total > 0.6) ? 'correct' : 'incorrect');
                }
            } else {
                // Chấm điểm toàn bộ bài thi listening và hiển thị kết quả
                checkListeningAnswers(currentTestData.answers, null);
            }
        }
    }
}



function disableTestInputs(taskId = null) {
    const scope = taskId ? document.getElementById(taskId) : document.getElementById('test-container');
    if (!scope) return;

    const inputs = scope.querySelectorAll('select, input[type="text"], input[type="radio"]');
    inputs.forEach(input => input.disabled = true);

    const draggables = scope.querySelectorAll('li[draggable="true"]');
    draggables.forEach(item => {
        item.draggable = false;
        item.style.cursor = 'default';
    });
}

function clearAllFeedback() {
    document.querySelectorAll('.feedback, .item-feedback').forEach(span => {
        span.textContent = '';
        span.className = 'feedback';
    });
    const finalResult = document.getElementById('finalResult');
    finalResult.textContent = '';
    finalResult.className = 'result';
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// CHỨC NĂNG KÉO THẢ
function initDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable-list li[draggable="true"]');
    const containers = document.querySelectorAll('.draggable-list');
    let draggingElement = null;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggingElement = draggable;
            setTimeout(() => draggable.classList.add('dragging'), 0);
        });
        draggable.addEventListener('dragend', () => {
            if (draggingElement) {
                draggingElement.classList.remove('dragging');
            }
            draggingElement = null;
        });
    });

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            if (draggingElement) {
                if (afterElement == null) {
                    container.appendChild(draggingElement);
                } else {
                    container.insertBefore(draggingElement, afterElement);
                }
            }
        });
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li[draggable="true"]:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

/* =================================
   CHỨC NĂNG TIMER ĐẾM NGƯỢC
   ================================= */
function startCountdownTimer() {
    if (currentMode !== 'mock') return; // Chỉ hoạt động trong chế độ thi thử
    
    // Reset timer
    timeLeft = 2100; // 45 phút
    isTimerRunning = true;
    
    // Hiển thị timer
    const timerContainer = document.getElementById('timer-container');
    const timerValue = document.getElementById('timer-value');
    
    if (timerContainer) {
        timerContainer.style.display = 'block';
    }
    
    // Cập nhật hiển thị ngay lập tức
    updateTimerDisplay();
    
    // Bắt đầu đếm ngược
    countdownTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // Kiểm tra cảnh báo thời gian
        if (timeLeft <= 300 && timeLeft > 60) { // 5 phút cuối
            timerValue.className = 'warning';
        } else if (timeLeft <= 60) { // 1 phút cuối
            timerValue.className = 'danger';
        }
        
        // Hết thời gian - tự động nộp bài
        if (timeLeft <= 0) {
            autoSubmitTest();
        }
    }, 1000);
}

function stopCountdownTimer() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    isTimerRunning = false;
    
    // Ẩn timer
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) {
        timerContainer.style.display = 'none';
    }
}

function updateTimerDisplay() {
    const timerValue = document.getElementById('timer-value');
    if (!timerValue) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerValue.textContent = formattedTime;
}

function autoSubmitTest() {
    stopCountdownTimer();
    
    // Hiển thị thông báo hết thời gian
    alert('Hết thời gian! Bài thi sẽ được tự động nộp.');
    
    // Tự động nộp bài
    checkAnswers(null);
}

function resetTimer() {
    stopCountdownTimer();
    timeLeft = 2100;
    
    const timerValue = document.getElementById('timer-value');
    if (timerValue) {
        timerValue.className = '';
        updateTimerDisplay();
    }
}
