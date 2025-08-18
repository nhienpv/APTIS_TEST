/* =================================
   HÀM TẢI BÀI TEST READING
   ================================= */
function loadReadingTest(testData, isMockTest = false) {
	const testContent = document.getElementById('test-content');
	let html = '';

	['task1','task2','task3','task4','task5'].forEach(taskName => {
		const taskData = testData[taskName];
		if (!taskData) return;

		html += `<div class="task" id="${taskName}">`;
		html += `<h2>${taskData.title || ''}</h2>`;
		if (taskData.instruction) html += `<p>${taskData.instruction}</p>`;
		if (taskData.topic) html += `<p><strong>${taskData.topic}</strong></p>`;

		if (taskName === "task1") {
			taskData.questions.forEach((q, index) => {
				const optionsHTML = q.options
					.map((opt) => `<option value="${opt}">${opt}</option>`)
					.join("");
				html += `<div class="question-group">${
					index + 1
				}. ${q.before}<select class="inline-select" name="${taskName}_q${
					index + 1
				}"><option value="">...</option>${optionsHTML}</select>${q.after}<span class="feedback"></span></div>`;
			});
		} else if (taskName === "task2" || taskName === "task3") {
			// Kiểm tra nếu là mobile thì dùng dropdown, desktop thì dùng drag & drop
			const isMobile = window.innerWidth <= 768;
			
			if (isMobile) {
				// Giao diện dropdown cho mobile
				html += `<div class="mobile-ordering-container" id="${taskName}_container">`;
				html += `<h3>Sắp xếp các câu theo thứ tự đúng:</h3>`;
				
				const totalSlots = taskData.sentences ? taskData.sentences.length : 0;
				const draggableSentences = taskData.sentences ? taskData.sentences.filter(s => s.order > 1) : [];
				const shuffledSentences = [...draggableSentences].sort(() => Math.random() - 0.5);
				
				// Tạo options cho dropdown
				let optionsHTML = '<option value="">-- Chọn câu --</option>';
				shuffledSentences.forEach((sentence, index) => {
					optionsHTML += `<option value="${sentence.order}" data-text="${sentence.text}">${sentence.text}</option>`;
				});
				
				for (let i = 1; i <= totalSlots; i++) {
					if (i === 1) {
						// Vị trí 1 là câu mẫu
						const sampleSentence = taskData.sentences.find(s => s.order === 1);
						if (sampleSentence) {
							html += `<div class="mobile-slot" data-position="${i}">
								<span class="slot-number">${i}.</span>
								<span class="fixed-sentence">${sampleSentence.text}</span>
							</div>`;
						}
					} else {
						// Các vị trí khác dùng dropdown
						html += `<div class="mobile-slot" data-position="${i}">
							<span class="slot-number">${i}.</span>
							<select name="${taskName}_position_${i}" class="sentence-select" data-position="${i}">
								${optionsHTML}
							</select>
							<span class="feedback"></span>
						</div>`;
					}
				}
				html += `</div>`;
			} else {
				// Giao diện drag & drop cho desktop
				html += `<div class="drag-drop-container" id="${taskName}_container">`;
				
				html += `<div class="sentences-list" id="${taskName}_sentences">`;
				html += `<h3>Các câu cần sắp xếp:</h3>`;
				// Chỉ hiển thị các câu từ vị trí 2 trở đi (bỏ câu mẫu)
				const draggableSentences = taskData.sentences ? taskData.sentences.filter(s => s.order > 1) : [];
				// Random vị trí các câu
				const shuffledSentences = [...draggableSentences].sort(() => Math.random() - 0.5);
				shuffledSentences.forEach((sentence, index) => {
					html += `<div class="draggable-sentence" draggable="true" data-sentence-id="${taskName}_sentence_${index + 1}" data-correct-position="${sentence.order}">`;
					html += `${sentence.text}`;
					html += `</div>`;
				});
				html += `</div>`;
				
				// Tạo các slot để thả câu - bắt đầu từ vị trí 1
				html += `<div class="slots-container" id="${taskName}_slots">`;
				html += `<h3>Sắp xếp theo thứ tự đúng:</h3>`;
				// Tạo slot cho tất cả các vị trí từ 1 đến số câu
				const totalSlots = taskData.sentences ? taskData.sentences.length : 0;
				for (let i = 1; i <= totalSlots; i++) {
					if (i === 1) {
						// Slot vị trí 1 chứa câu mẫu
						const sampleSentence = taskData.sentences.find(s => s.order === 1);
						if (sampleSentence) {
							html += `<div class="slot" data-position="${i}"><span class="slot-number">${i}.</span> <span class="slot-text">${sampleSentence.text}</span></div>`;
						}
					} else {
						// Các slot khác để kéo thả
						html += `<div class="slot" data-position="${i}"><span class="slot-number">${i}.</span> </div>`;
					}
				}
				html += `</div>`;
				html += `</div>`;
			}
		} else if (taskName === 'task4') {
			let readingParts = Array.isArray(taskData.readingTextParts) ? [...taskData.readingTextParts] : [];
			let originalToShuffled = {}, shuffledToOriginal = {};
			if (readingParts.length > 0) {
				// shuffle readingParts
				for (let i = readingParts.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[readingParts[i], readingParts[j]] = [readingParts[j], readingParts[i]];
				}
				const newPersons = ['A','B','C','D'];
				readingParts.forEach((part, idx) => {
					originalToShuffled[part.person] = newPersons[idx];
					shuffledToOriginal[newPersons[idx]] = part.person;
					part._shuffledPerson = newPersons[idx];
				});
				html += `<div class="reading-text">`;
				readingParts.forEach(part => {
					html += `<div style="margin-bottom:8px;"><b>${part._shuffledPerson}:</b> ${part.text}</div>`;
				});
				html += `</div>`;
			} else if (taskData.readingText) {
				html += `<div class="reading-text">${taskData.readingText}</div>`;
			}
			// shuffle questions order
			let questions = [...taskData.questions];
			for (let i = questions.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[questions[i], questions[j]] = [questions[j], questions[i]];
			}
			html += `<div id="t4-questions">`;
			questions.forEach(q => {
				let originalAnswer = (testData.answers && testData.answers.task4 && testData.answers.task4[q.name]) || '';
				let mappedAnswer = originalToShuffled[originalAnswer] || originalAnswer;
				html += `<div class="question-group" data-answer="${mappedAnswer}">${q.text}<select name="${q.name}"><option value="">...</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select><span class="feedback"></span></div>`;
			});
			html += `</div>`;
			// store mapping on task div later (after innerHTML set we will attach)
			// attach mapping via a temporary attribute inlined later
			// Save mapping in a global map keyed by taskName unique id if needed
			// We'll attach to DOM after rendering
			// To keep simple, store on window map using test title + taskName
			if (!window._task4ShuffleMap) window._task4ShuffleMap = {};
			window._task4ShuffleMap[(testData.title || '') + '_' + taskName] = { originalToShuffled, shuffledToOriginal };
		} else if (taskName === 'task5') {
			html += `<div id="t5-questions">`;
			const options5HTML = (taskData.options||[]).map(opt => `<option value="${opt}">${opt}</option>`).join('');
			const qCount = (taskData.answers && Object.keys(taskData.answers).length) || (taskData.answers||[]).length || 0;
			for (let i = 0; i < qCount; i++) {
				html += `<div class="question-group">${i+1}. Paragraph ${i+1}:<select name="q5_${i+1}"><option value="">Choose...</option>${options5HTML}</select><span class="feedback"></span></div>`;
			}
			html += `</div>`;
		}

		// buttons for practice mode only, mock test will only have submit button
		if (!isMockTest) {
			html += `<div class="button-container">
				<button class="check-task-btn" data-task-id="${taskName}">Kiểm tra Task</button>
				<button class="reset-task-btn" data-task-id="${taskName}" style="display:none;">Làm lại</button>
				<button class="back-task-btn" data-task-id="${taskName}" style="display:none;">Quay lại</button>
			</div>`;
		}
		html += `</div>`;
	});

	testContent.innerHTML = html;

	// attach mapping data for task4 into its task div (so checkReadingAnswers can find it)
	['task1','task2','task3','task4','task5'].forEach(taskName => {
		const taskDiv = document.getElementById(taskName);
		if (!taskDiv) return;
		if (taskDiv && window._task4ShuffleMap) {
			const key = (testData.title || '') + '_' + 'task4';
			if (window._task4ShuffleMap[key]) {
				taskDiv.dataset.task4map = JSON.stringify(window._task4ShuffleMap[key]);
			}
		}
	});

	// event wiring for practice mode only (per-task)
	if (!isMockTest) {
		document.querySelectorAll('.check-task-btn').forEach(button => {
			button.addEventListener('click', function() {
				const taskId = this.getAttribute('data-task-id');
				if (currentAnswers) {
					checkReadingAnswers(currentAnswers, taskId);
					disableTaskInputs(taskId);
					this.style.display = 'none';
					const parent = this.parentElement;
					parent.querySelector('.reset-task-btn').style.display = '';
					// Ẩn nút "Quay lại" trong chế độ luyện tập vì đã có nút ở đầu trang
					parent.querySelector('.back-task-btn').style.display = 'none';
				}
			});
		});
		document.querySelectorAll('.reset-task-btn').forEach(button => {
			button.addEventListener('click', function() {
				const taskId = this.getAttribute('data-task-id');
				reloadSingleTask(taskId, testData, isMockTest);
			});
		});
		document.querySelectorAll('.back-task-btn').forEach(button => {
			button.addEventListener('click', function() {
				document.getElementById('test-container').style.display = 'none';
				document.getElementById('test-selection-screen').style.display = 'block';
			});
		});
	}

	// initialize drag/drop if you have function
	if (typeof initDragAndDrop === 'function') initDragAndDrop();
	
	// Khởi tạo drag and drop cho task2 và task3
	initDragAndDropForTasks();
	

}

// reloadSingleTask similar to above but re-render one task (practice)
function reloadSingleTask(taskId, testData, isMockTest = false) {
	const taskDiv = document.getElementById(taskId);
	if (!taskDiv) return;
	const taskData = testData[taskId];
	let html = `<h2>${taskData.title || ''}</h2>`;
	if (taskData.instruction) html += `<p>${taskData.instruction}</p>`;
	if (taskData.topic) html += `<p><strong>${taskData.topic}</strong></p>`;

	if (taskId === 'task1') {
		taskData.questions.forEach((q, index) => {
			const optionsHTML = q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
			html += `<div class="question-group">${index + 1}. ${q.before}<select class="inline-select" name="task1_q${index+1}"><option value="">...</option>${optionsHTML}</select>${q.after}<span class="feedback"></span></div>`;
		});
	} else if (taskId === 'task2' || taskId === 'task3') {
		// Kiểm tra nếu là mobile thì dùng dropdown, desktop thì dùng drag & drop
		const isMobile = window.innerWidth <= 768;
		
		if (isMobile) {
			// Giao diện dropdown cho mobile
			html += `<div class="mobile-ordering-container" id="${taskId}_container">`;
			html += `<h3>Sắp xếp các câu theo thứ tự đúng:</h3>`;
			
			const totalSlots = taskData.sentences ? taskData.sentences.length : 0;
			const draggableSentences = taskData.sentences ? taskData.sentences.filter(s => s.order > 1) : [];
			const shuffledSentences = [...draggableSentences].sort(() => Math.random() - 0.5);
			
			// Tạo options cho dropdown
			let optionsHTML = '<option value="">-- Chọn câu --</option>';
			shuffledSentences.forEach((sentence, index) => {
				optionsHTML += `<option value="${sentence.order}" data-text="${sentence.text}">${sentence.text}</option>`;
			});
			
			for (let i = 1; i <= totalSlots; i++) {
				if (i === 1) {
					// Vị trí 1 là câu mẫu
					const sampleSentence = taskData.sentences.find(s => s.order === 1);
					if (sampleSentence) {
						html += `<div class="mobile-slot" data-position="${i}">
							<span class="slot-number">${i}.</span>
							<span class="fixed-sentence">${sampleSentence.text}</span>
						</div>`;
					}
				} else {
					// Các vị trí khác dùng dropdown
					html += `<div class="mobile-slot" data-position="${i}">
						<span class="slot-number">${i}.</span>
						<select name="${taskId}_position_${i}" class="sentence-select" data-position="${i}">
							${optionsHTML}
						</select>
						<span class="feedback"></span>
					</div>`;
				}
			}
			html += `</div>`;
		} else {
			// Giao diện drag & drop cho desktop
			html += `<div class="drag-drop-container" id="${taskId}_container">`;
			
			html += `<div class="sentences-list" id="${taskId}_sentences">`;
			html += `<h3>Các câu cần sắp xếp:</h3>`;
			// Chỉ hiển thị các câu từ vị trí 2 trở đi (bỏ câu mẫu)
			const draggableSentences = taskData.sentences ? taskData.sentences.filter(s => s.order > 1) : [];
			// Random vị trí các câu
			const shuffledSentences = [...draggableSentences].sort(() => Math.random() - 0.5);
			shuffledSentences.forEach((sentence, index) => {
				html += `<div class="draggable-sentence" draggable="true" data-sentence-id="${taskId}_sentence_${index + 1}" data-correct-position="${sentence.order}">`;
				html += `${sentence.text}`;
				html += `</div>`;
			});
			html += `</div>`;
			
			// Tạo các slot để thả câu - bắt đầu từ vị trí 1
			html += `<div class="slots-container" id="${taskId}_slots">`;
			html += `<h3>Sắp xếp theo thứ tự đúng:</h3>`;
			// Tạo slot cho tất cả các vị trí từ 1 đến số câu
			const totalSlots = taskData.sentences ? taskData.sentences.length : 0;
			for (let i = 1; i <= totalSlots; i++) {
				if (i === 1) {
					// Slot vị trí 1 chứa câu mẫu
					const sampleSentence = taskData.sentences.find(s => s.order === 1);
					if (sampleSentence) {
						html += `<div class="slot" data-position="${i}"><span class="slot-number">${i}.</span> <span class="slot-text">${sampleSentence.text}</span></div>`;
					}
				} else {
					// Các slot khác để kéo thả
					html += `<div class="slot" data-position="${i}"><span class="slot-number">${i}.</span> </div>`;
				}
			}
			html += `</div>`;
			html += `</div>`;
		}
	} else if (taskId === 'task4') {
		let readingParts = Array.isArray(taskData.readingTextParts) ? [...taskData.readingTextParts] : [];
		let originalToShuffled = {}, shuffledToOriginal = {};
		if (readingParts.length > 0) {
			// shuffle readingParts
			for (let i = readingParts.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[readingParts[i], readingParts[j]] = [readingParts[j], readingParts[i]];
			}
			const newPersons = ['A','B','C','D'];
			readingParts.forEach((part, idx) => {
				originalToShuffled[part.person] = newPersons[idx];
				shuffledToOriginal[newPersons[idx]] = part.person;
				part._shuffledPerson = newPersons[idx];
			});
			html += `<div class="reading-text">`;
			readingParts.forEach(part => {
				html += `<div style="margin-bottom:8px;"><b>${part._shuffledPerson}:</b> ${part.text}</div>`;
			});
			html += `</div>`;
		} else if (taskData.readingText) {
			html += `<div class="reading-text">${taskData.readingText}</div>`;
		}
		// shuffle questions order
		let questions = [...taskData.questions];
		for (let i = questions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[questions[i], questions[j]] = [questions[j], questions[i]];
		}
		html += `<div id="t4-questions">`;
		questions.forEach(q => {
			let originalAnswer = (testData.answers && testData.answers.task4 && testData.answers.task4[q.name]) || '';
			let mappedAnswer = originalToShuffled[originalAnswer] || originalAnswer;
			html += `<div class="question-group" data-answer="${mappedAnswer}">${q.text}<select name="${q.name}"><option value="">...</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select><span class="feedback"></span></div>`;
		});
		html += `</div>`;
		// store mapping on taskDiv
		taskDiv.dataset.task4map = JSON.stringify({ originalToShuffled, shuffledToOriginal });
	} else if (taskId === 'task5') {
		html += `<div id="t5-questions">`;
		const options5HTML = (taskData.options||[]).map(opt => `<option value="${opt}">${opt}</option>`).join('');
		const qCount = (taskData.answers && Object.keys(taskData.answers).length) || (taskData.answers||[]).length || 0;
		for (let i = 0; i < qCount; i++) {
			html += `<div class="question-group">${i+1}. Paragraph ${i+1}:<select name="q5_${i+1}"><option value="">Choose...</option>${options5HTML}</select><span class="feedback"></span></div>`;
		}
		html += `</div>`;
	}

	// add buttons for practice mode only
	if (!isMockTest) {
		html += `<div class="button-container">
			<button class="check-task-btn" data-task-id="${taskId}">Kiểm tra Task</button>
			<button class="reset-task-btn" data-task-id="${taskId}" style="display:none;">Làm lại</button>
			<button class="back-task-btn" data-task-id="${taskId}" style="display:none;">Quay lại</button>
		</div>`;
	}

	taskDiv.innerHTML = html;

	// rebind events on this task for both practice and mock test modes
	const checkBtn = taskDiv.querySelector('.check-task-btn');
	if (checkBtn) {
		checkBtn.addEventListener('click', function() {
			if (currentAnswers) {
				checkReadingAnswers(currentAnswers, taskId);
				disableTaskInputs(taskId);
				this.style.display = 'none';
				const parent = this.parentElement;
				parent.querySelector('.reset-task-btn').style.display = '';
				parent.querySelector('.back-task-btn').style.display = '';
			}
		});
	}
	const resetBtn = taskDiv.querySelector('.reset-task-btn');
	if (resetBtn) resetBtn.addEventListener('click', function(){ reloadSingleTask(taskId, testData, isMockTest); });
	const backBtn = taskDiv.querySelector('.back-task-btn');
	if (backBtn) backBtn.addEventListener('click', function() {
		document.getElementById('test-container').style.display = 'none';
		document.getElementById('test-selection-screen').style.display = 'block';
	});

	if (typeof initDragAndDrop === 'function') initDragAndDrop();
	
	// Khởi tạo drag and drop cho task2 và task3
	initDragAndDropForTasks();
	
	// Kích hoạt lại drag and drop nếu là task2 hoặc task3
	if (taskId === 'task2' || taskId === 'task3') {
		// Đợi một chút để DOM được cập nhật
		setTimeout(() => {
			enableDragAndDrop(taskId);
		}, 100);
	}
}

function checkReadingAnswers(answers, taskId = null) {
    let totalCorrect = 0;
    let totalQuestions = 0;
    const scope = taskId ? document.getElementById(taskId) : document.getElementById('test-container');
    if (!scope) return;

    // clear feedback if checking single task
    if (taskId) {
        scope.querySelectorAll('.feedback, .item-feedback').forEach(span => {
            if (span) {
                span.textContent = '';
                span.className = span.className.replace(/ correct| incorrect/g, '');
            }
        });
    }

    const tasksToCheck = taskId ? [taskId] : ['task1', 'task2', 'task3', 'task4', 'task5'];
    
    // Nếu kiểm tra toàn bộ bài thi, tính tổng số câu hỏi trước
    if (!taskId) {
        totalQuestions = calculateTotalQuestions();
    }

    tasksToCheck.forEach(currentTaskId => {
        const taskScope = document.getElementById(currentTaskId);
        if (!taskScope) return;

        if (currentTaskId === 'task1') {
            const taskAnswers = answers[currentTaskId];
			if (!taskAnswers) return;
			for (let i = 0; i < taskScope.querySelectorAll('.question-group').length; i++) {
				const select = taskScope.querySelector(`select[name="task1_q${i+1}"]`);
				if (select) {
					if (taskId) totalQuestions++; // Chỉ tăng khi kiểm tra từng task
					const feedbackSpan = select.parentElement.querySelector('.feedback');
					if (feedbackSpan) {
						if (select.value === taskAnswers[`q1_${i+1}`]) {
							feedbackSpan.textContent = '✔️ Đúng';
							feedbackSpan.className = 'feedback correct';
							totalCorrect++;
						} else {
							feedbackSpan.textContent = `❌ Sai. Đáp án: "${taskAnswers[`q1_${i+1}`]}"`;
							feedbackSpan.className = 'feedback incorrect';
						}
					}
				}
			}
        } else if (['task2', 'task3'].includes(currentTaskId)) {
            // Kiểm tra cả drag & drop và dropdown cho task2 và task3
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Kiểm tra dropdown cho mobile
                const mobileSlots = taskScope.querySelectorAll('.mobile-slot');
                const taskQuestions = mobileSlots.length - 1; // Trừ đi slot vị trí 1 (câu mẫu)
                if (taskId) totalQuestions = taskQuestions;
                
                let taskCorrect = 0;
                
                mobileSlots.forEach(slot => {
                    const position = parseInt(slot.getAttribute('data-position'));
                    
                    // Bỏ qua slot vị trí 1 (câu mẫu)
                    if (position === 1) return;
                    
                    const select = slot.querySelector('.sentence-select');
                    const feedback = slot.querySelector('.feedback');
                    
                    if (select && feedback) {
                        const selectedValue = parseInt(select.value);
                        
                        if (selectedValue === position) {
                            feedback.textContent = '✔️ Đúng';
                            feedback.className = 'feedback correct';
                            select.style.borderColor = '#059669';
                            totalCorrect++;
                            taskCorrect++;
                        } else {
                            feedback.textContent = `❌ Sai rồi!`;
                            feedback.className = 'feedback incorrect';
                            select.style.borderColor = '#dc2626';
                        }
                    }
                });
                
                // Hiển thị kết quả tổng
                const resultDiv = taskScope.querySelector('.mobile-result') || document.createElement('div');
                resultDiv.className = 'mobile-result';
                const displayQuestions = taskId ? taskQuestions : totalQuestions;
                const displayCorrect = taskId ? taskCorrect : totalCorrect;
                resultDiv.textContent = `Bạn đúng ${displayCorrect}/${displayQuestions} câu.`;
                resultDiv.style.marginTop = '15px';
                resultDiv.style.fontWeight = 'bold';
                resultDiv.style.textAlign = 'center';
                resultDiv.style.padding = '10px';
                resultDiv.style.borderRadius = '8px';
                resultDiv.style.color = displayCorrect === displayQuestions ? '#059669' : '#dc2626';
                resultDiv.style.backgroundColor = displayCorrect === displayQuestions ? '#d1fae5' : '#fee2e2';
                
                if (!taskScope.querySelector('.mobile-result')) {
                    taskScope.appendChild(resultDiv);
                }
                
            } else {
                // Kiểm tra drag and drop cho desktop
                const slots = taskScope.querySelectorAll('.slot');
                const draggableSentences = taskScope.querySelectorAll('.draggable-sentence');
                
                if (slots.length > 0) {
                    const taskQuestions = slots.length - 1; // Trừ đi slot vị trí 1 (câu mẫu)
                    if (taskId) totalQuestions = taskQuestions; // Chỉ set khi kiểm tra từng task
                    
                    let taskCorrect = 0; // Đếm đúng cho task này
                    
                    slots.forEach((slot, index) => {
                        const position = parseInt(slot.getAttribute('data-position'));
                        
                        // Bỏ qua slot vị trí 1 (câu mẫu)
                        if (position === 1) {
                            return;
                        }
                        
                        const droppedSentence = slot.querySelector('.draggable-sentence');
                        
                        if (droppedSentence) {
                            const correctPosition = parseInt(droppedSentence.getAttribute('data-correct-position'));
                            
                            if (position === correctPosition) {
                                slot.classList.add('correct');
                                slot.classList.remove('incorrect');
                                totalCorrect++;
                                taskCorrect++;
                            } else {
                                slot.classList.add('incorrect');
                                slot.classList.remove('correct');
                            }
                        } else {
                            slot.classList.add('incorrect');
                            slot.classList.remove('correct');
                        }
                    });
                    
                    // Hiển thị kết quả tổng
                    const resultDiv = taskScope.querySelector('.drag-drop-result') || document.createElement('div');
                    resultDiv.className = 'drag-drop-result';
                    const displayQuestions = taskId ? taskQuestions : totalQuestions;
                    const displayCorrect = taskId ? taskCorrect : totalCorrect;
                    resultDiv.textContent = `Bạn đúng ${displayCorrect}/${displayQuestions} câu.`;
                    resultDiv.style.marginTop = '10px';
                    resultDiv.style.fontWeight = 'bold';
                    resultDiv.style.color = displayCorrect === displayQuestions ? 'green' : 'red';
                    
                    if (!taskScope.querySelector('.drag-drop-result')) {
                        taskScope.appendChild(resultDiv);
                    }
                    
                    // Vô hiệu hóa drag and drop sau khi kiểm tra
                    disableDragAndDrop(currentTaskId);
                }
            }
        } else if (currentTaskId === 'task4') {
            taskScope.querySelectorAll('.question-group').forEach(qGroup => {
				const select = qGroup.querySelector('select');
				if (select) {
					if (taskId) totalQuestions++; // Chỉ tăng khi kiểm tra từng task
					const feedbackSpan = qGroup.querySelector('.feedback');
					let mappedAnswer = qGroup.getAttribute('data-answer') || '';
					if (feedbackSpan) {
						if (select.value === mappedAnswer) {
							feedbackSpan.textContent = '✔️ Đúng';
							feedbackSpan.className = 'feedback correct';
							totalCorrect++;
						} else {
							feedbackSpan.textContent = `❌ Sai. Đáp án: "${mappedAnswer || ''}"`;
							feedbackSpan.className = 'feedback incorrect';
						}
					}
				}
			});
        } else if (currentTaskId === 'task5') {
            const taskAnswers = answers[currentTaskId];
			if (!taskAnswers) return;
			for (const qName in taskAnswers) {
				const select = taskScope.querySelector(`select[name="${qName}"]`);
				if (select) {
					if (taskId) totalQuestions++; // Chỉ tăng khi kiểm tra từng task
					const feedbackSpan = select.parentElement.querySelector('.feedback');
					if (feedbackSpan) {
						if (select.value === taskAnswers[qName]) {
							feedbackSpan.textContent = '✔️ Đúng';
							feedbackSpan.className = 'feedback correct';
							totalCorrect++;
						} else {
							feedbackSpan.textContent = `❌ Sai. Đáp án: "${taskAnswers[qName] || ''}"`;
							feedbackSpan.className = 'feedback incorrect';
						}
					}
				}
			}
        }

		// disable inputs for per-task check
		if (taskId && taskScope) {
			taskScope.querySelectorAll('select, input[type="text"], input[type="radio"]').forEach(inp => inp.disabled = true);
			taskScope.querySelectorAll('li[draggable="true"]').forEach(li => { li.draggable = false; li.style.cursor='default'; });
		}
	});

	// HIỂN THỊ KẾT QUẢ KHI CHECK TỪNG TASK (chỉ cho practice mode)
    if (taskId) {
        // Chỉ hiển thị kết quả tổng cho practice mode
        let resultDiv = scope.querySelector('.result-task');
        if (resultDiv) {
            resultDiv.textContent = `Bạn đúng ${totalCorrect}/${totalQuestions} câu.`;
            resultDiv.className = 'result-task ' + ((totalQuestions > 0 && totalCorrect / totalQuestions > 0.6) ? 'correct' : 'incorrect');
        } else {
            const div = document.createElement('div');
            div.className = 'result-task';
            div.textContent = `Bạn đúng ${totalCorrect}/${totalQuestions} câu.`;
            scope.appendChild(div);
        }
    }

    	// Kết quả tổng khi nộp toàn bài (chỉ cho practice mode)
    if (!taskId) {
        // Chỉ hiển thị kết quả tổng cho practice mode, không hiển thị cho mock test
        // Mock test sẽ được xử lý riêng trong script.js
        // Kiểm tra xem có phải mock test không bằng cách kiểm tra sự hiện diện của nút kiểm tra task
        const checkTaskButtons = document.querySelectorAll('.check-task-btn');
        if (checkTaskButtons.length > 0) {
            // Đây là mock test, không hiển thị kết quả tổng ở đây
            return { correct: totalCorrect, total: totalQuestions };
        }
        
        const finalResult = document.getElementById('finalResult');
        if (finalResult) {
            finalResult.textContent = `Kết quả: Bạn đã trả lời đúng ${totalCorrect} / ${totalQuestions} câu.`;
            finalResult.className = 'result ' + ((totalQuestions > 0 && totalCorrect / totalQuestions > 0.6) ? 'correct' : 'incorrect');
        }
    }
    
    // Trả về kết quả cho việc tính toán
    return { correct: totalCorrect, total: totalQuestions };
}

// Hàm tính tổng số câu hỏi trong bài thi reading
function calculateTotalQuestions() {
    let total = 0;
    
    // Task 1: 6 câu
    const task1Questions = document.querySelectorAll('#task1 .question-group').length;
    total += task1Questions;
    
    // Task 2: 5 câu (trừ câu mẫu)
    const task2Slots = document.querySelectorAll('#task2 .slot').length;
    if (task2Slots > 0) {
        total += task2Slots - 1; // Trừ câu mẫu
    }
    
    // Task 3: 5 câu (trừ câu mẫu)
    const task3Slots = document.querySelectorAll('#task3 .slot').length;
    if (task3Slots > 0) {
        total += task3Slots - 1; // Trừ câu mẫu
    }
    
    // Task 4: 6 câu
    const task4Questions = document.querySelectorAll('#task4 .question-group').length;
    total += task4Questions;
    
    // Task 5: 7 câu
    const task5Questions = document.querySelectorAll('#task5 .question-group').length;
    total += task5Questions;
    
    // Nếu không tìm thấy câu hỏi nào, trả về 29 (số câu mặc định)
    if (total === 0) {
        return 29;
    }
    
    return total;
}

function disableTaskInputs(taskId) {
	const scope = document.getElementById(taskId);
	if (!scope) return;
	scope.querySelectorAll('select, input[type="text"], input[type="radio"]').forEach(i => i.disabled = true);
	scope.querySelectorAll('li[draggable="true"]').forEach(li => { li.draggable = false; li.style.cursor='default'; });
}

function disableDragAndDrop(taskId) {
	const scope = document.getElementById(taskId);
	if (!scope) return;
	
	// Vô hiệu hóa các câu có thể kéo
	scope.querySelectorAll('.draggable-sentence').forEach(sentence => {
		sentence.draggable = false;
		sentence.style.cursor = 'default';
		sentence.classList.add('disabled');
	});
	
	// Vô hiệu hóa các slot bằng cách thêm flag
	scope.querySelectorAll('.slot').forEach(slot => {
		const position = parseInt(slot.getAttribute('data-position'));
		if (position === 1) return; // Bỏ qua slot câu mẫu
		
		slot.setAttribute('data-disabled', 'true');
	});
}

function enableDragAndDrop(taskId) {
	const scope = document.getElementById(taskId);
	if (!scope) return;
	
	// Kích hoạt lại các câu có thể kéo
	scope.querySelectorAll('.draggable-sentence').forEach(sentence => {
		sentence.draggable = true;
		sentence.style.cursor = 'grab';
		sentence.classList.remove('disabled');
	});
	
	// Kích hoạt lại các slot
	scope.querySelectorAll('.slot').forEach(slot => {
		const position = parseInt(slot.getAttribute('data-position'));
		if (position === 1) return; // Bỏ qua slot câu mẫu
		
		slot.removeAttribute('data-disabled');
	});
}

function initDragAndDropForTasks() {
	const draggableSentences = document.querySelectorAll('.draggable-sentence');
	const slots = document.querySelectorAll('.slot');
	
	let draggedElement = null;
	
	draggableSentences.forEach(sentence => {
		sentence.addEventListener('dragstart', (e) => {
			window.draggedElement = sentence;
			setTimeout(() => sentence.classList.add('dragging'), 0);
		});
		
		sentence.addEventListener('dragend', () => {
			if (window.draggedElement) {
				window.draggedElement.classList.remove('dragging');
			}
			window.draggedElement = null;
		});
	});
	
	slots.forEach(slot => {
		const position = parseInt(slot.getAttribute('data-position'));
		
		// Chỉ cho phép kéo thả vào các slot từ vị trí 2 trở đi
		if (position === 1) {
			return; // Bỏ qua slot vị trí 1 (câu mẫu)
		}
		
		slot.addEventListener('dragover', (e) => {
			// Kiểm tra nếu slot bị vô hiệu hóa
			if (slot.getAttribute('data-disabled') === 'true') {
				return;
			}
			e.preventDefault();
			slot.style.borderColor = '#007bff';
			slot.style.backgroundColor = '#f8f9fa';
		});
		
		slot.addEventListener('dragleave', (e) => {
			// Kiểm tra nếu slot bị vô hiệu hóa
			if (slot.getAttribute('data-disabled') === 'true') {
				return;
			}
			slot.style.borderColor = '#ced4da';
			slot.style.backgroundColor = '#ffffff';
		});
		
		slot.addEventListener('drop', (e) => {
			// Kiểm tra nếu slot bị vô hiệu hóa
			if (slot.getAttribute('data-disabled') === 'true') {
				return;
			}
			e.preventDefault();
			slot.style.borderColor = '#ced4da';
			slot.style.backgroundColor = '#ffffff';
			
			if (window.draggedElement) {
				// Xóa câu cũ trong slot nếu có và trả về danh sách gốc
				const existingSentence = slot.querySelector('.draggable-sentence');
				if (existingSentence) {
					// Tìm danh sách câu gốc
					const container = slot.closest('.drag-drop-container');
					const sentencesList = document.getElementById(container.id.replace('_container', '_sentences'));
					if (sentencesList) {
						// Tạo câu mới với đầy đủ thuộc tính
						const newSentence = document.createElement('div');
						newSentence.className = 'draggable-sentence';
						newSentence.draggable = true;
						newSentence.setAttribute('data-sentence-id', existingSentence.getAttribute('data-sentence-id'));
						newSentence.setAttribute('data-correct-position', existingSentence.getAttribute('data-correct-position'));
						newSentence.textContent = existingSentence.textContent;
						sentencesList.appendChild(newSentence);
						
						// Thêm event listeners cho câu mới
						newSentence.addEventListener('dragstart', (e) => {
							window.draggedElement = newSentence;
							setTimeout(() => newSentence.classList.add('dragging'), 0);
						});
						
						newSentence.addEventListener('dragend', () => {
							if (window.draggedElement) {
								window.draggedElement.classList.remove('dragging');
							}
							window.draggedElement = null;
						});
					}
					existingSentence.remove();
				}
				
				// Thêm câu mới vào slot
				const clonedSentence = window.draggedElement.cloneNode(true);
				clonedSentence.draggable = false;
				clonedSentence.style.cursor = 'default';
				clonedSentence.classList.remove('dragging');
				clonedSentence.style.margin = '0';
				clonedSentence.style.border = 'none';
				clonedSentence.style.background = 'transparent';
				clonedSentence.style.padding = '0';
				slot.appendChild(clonedSentence);
				
				// Xóa câu gốc khỏi danh sách
				window.draggedElement.remove();
			}
		});
	});
}