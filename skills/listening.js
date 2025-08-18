// ===================================
// FILE: skills/listening.js
// ===================================
function loadListeningTest(testData, mode) {
    const testContent = document.getElementById('test-content');
    let html = '';

    testData.parts.forEach((part, index) => {
        const partId = `part_${index + 1}`;
        html += `<div class="task" id="${partId}"><h2>${part.title}</h2>`;
        if (part.instruction) {
            html += `<p>${part.instruction}</p>`;
        }
        // Context (đoạn hội thoại/mô tả) nếu có
        if (Array.isArray(part.context) && part.context.length > 0) {
            html += `<div class="listening-context">`;
            part.context.forEach(line => {
                const who = (line.person || line.speaker || '').toString().trim();
                const label = who ? `<b>${who}:</b> ` : '';
                html += `<div class="context-line">${label}${line.text || ''}</div>`;
            });
            html += `</div>`;
        }

        part.data.forEach((q) => {
            html += `<div class="question-group">`;
            switch (part.type) {
                case 'multiple_choice':
                    html += `<p>${q.question}</p>`;
                    q.options.forEach(opt => {
                        html += `<label style="display: block; margin-bottom: 8px;"><input type="radio" name="${q.id}" value="${opt}"> ${opt}</label>`;
                    });
                    break;
                case 'matching_sentence':
                    html += `<label for="${q.id}">${q.person}: </label><select name="${q.id}" id="${q.id}"><option value="">Choose...</option>`;
                    part.options.forEach(opt => {
                        html += `<option value="${opt}">${opt}</option>`;
                    });
                    html += `</select>`;
                    break;
                case 'matching_opinion':
                    html += `<p>${q.text}</p><select name="${q.id}"><option value="">Choose...</option>`;
                    part.options.forEach(opt => {
                        html += `<option value="${opt}">${opt}</option>`;
                    });
                    html += `</select>`;
                    break;
            }
            html += `<span class="feedback"></span></div>`;
        });

        if (mode === 'practice') {
            html += `<div class="button-container">
                <button class="check-part-btn" data-part-id="${partId}">Kiểm tra Task</button>
                <button class="reset-part-btn" data-part-id="${partId}" style="display:none;">Làm lại</button>
                <button class="back-part-btn" data-part-id="${partId}" style="display:none;">Quay lại</button>
            </div>`;
        }
        html += `</div>`;
    });

    testContent.innerHTML = html;

    // Sự kiện kiểm tra task
    document.querySelectorAll('.check-part-btn').forEach(button => {
        button.addEventListener('click', function() {
            const partId = this.getAttribute('data-part-id');
            if (currentTestData) {
                checkListeningAnswers(null, partId);
                disableListeningTaskInputs(partId);
                // Ẩn nút kiểm tra, hiện nút làm lại, ẩn nút quay lại
                this.style.display = 'none';
                const parent = this.parentElement;
                parent.querySelector('.reset-part-btn').style.display = '';
                parent.querySelector('.back-part-btn').style.display = 'none';
            }
        });
    });

    // Sự kiện làm lại task
    document.querySelectorAll('.reset-part-btn').forEach(button => {
        button.addEventListener('click', function() {
            const partId = this.getAttribute('data-part-id');
            reloadSinglePart(partId, testData);
            // Enable lại các input
            const partDiv = document.getElementById(partId);
            const inputs = partDiv.querySelectorAll('select, input[type="text"], input[type="radio"]');
            inputs.forEach(input => {
                input.disabled = false;
                input.style.opacity = '1';
                input.style.cursor = 'auto';
            });
        });
    });

    // Sự kiện quay lại
    document.querySelectorAll('.back-part-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('test-container').style.display = 'none';
            document.getElementById('test-selection-screen').style.display = 'block';
        });
    });
}

// Hàm reload lại 1 part (làm lại part đó)
function reloadSinglePart(partId, testData) {
    const partIndex = parseInt(partId.replace('part_', '')) - 1;
    const part = testData.parts[partIndex];
    const partDiv = document.getElementById(partId);
    if (!partDiv) return;
    
    // Xóa kết quả cũ nếu có
    const oldPartResult = partDiv.querySelector('.part-result');
    if (oldPartResult) {
        oldPartResult.remove();
    }
    
    // Xóa tất cả feedback cũ
    partDiv.querySelectorAll('.feedback').forEach(feedback => {
        feedback.textContent = '';
        feedback.className = 'feedback';
    });
    
    let html = `<h2>${part.title}</h2>`;
    if (part.instruction) html += `<p>${part.instruction}</p>`;
    // Context (đoạn hội thoại/mô tả) nếu có
    if (Array.isArray(part.context) && part.context.length > 0) {
        html += `<div class="listening-context">`;
        part.context.forEach(line => {
            const who = (line.person || line.speaker || '').toString().trim();
            const label = who ? `<b>${who}:</b> ` : '';
            html += `<div class="context-line">${label}${line.text || ''}</div>`;
        });
        html += `</div>`;
    }
    part.data.forEach((q) => {
        html += `<div class="question-group">`;
        switch (part.type) {
            case 'multiple_choice':
                html += `<p>${q.question}</p>`;
                q.options.forEach(opt => {
                    html += `<label style="display: block; margin-bottom: 8px;"><input type="radio" name="${q.id}" value="${opt}"> ${opt}</label>`;
                });
                break;
            case 'matching_sentence':
                html += `<label for="${q.id}">${q.person}: </label><select name="${q.id}" id="${q.id}"><option value="">Choose...</option>`;
                part.options.forEach(opt => {
                    html += `<option value="${opt}">${opt}</option>`;
                });
                html += `</select>`;
                break;
            case 'matching_opinion':
                html += `<p>${q.text}</p><select name="${q.id}"><option value="">Choose...</option>`;
                part.options.forEach(opt => {
                    html += `<option value="${opt}">${opt}</option>`;
                });
                html += `</select>`;
                break;
        }
        html += `<span class="feedback"></span></div>`;
    });
    html += `<div class="button-container">
        <button class="check-part-btn" data-part-id="${partId}">Kiểm tra Task</button>
        <button class="reset-part-btn" data-part-id="${partId}" style="display:none;">Làm lại</button>
        <button class="back-part-btn" data-part-id="${partId}" style="display:none;">Quay lại</button>
    </div>`;
    partDiv.innerHTML = html;

    // Gán lại sự kiện cho các nút mới
    partDiv.querySelector('.check-part-btn').addEventListener('click', function() {
        if (currentTestData) {
            checkListeningAnswers(null, partId);
            disableListeningTaskInputs(partId);
            this.style.display = 'none';
            const parent = this.parentElement;
            parent.querySelector('.reset-part-btn').style.display = '';
            parent.querySelector('.back-part-btn').style.display = 'none';
        }
    });
    partDiv.querySelector('.reset-part-btn').addEventListener('click', function() {
        reloadSinglePart(partId, testData);
        // Enable lại các input
        const inputs = partDiv.querySelectorAll('select, input[type="text"], input[type="radio"]');
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
            input.style.cursor = 'auto';
        });
    });
    partDiv.querySelector('.back-part-btn').addEventListener('click', function() {
        document.getElementById('test-container').style.display = 'none';
        document.getElementById('test-selection-screen').style.display = 'block';
    });
}

function checkListeningAnswers(answers, partId = null) {
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    // Tạo object answers từ currentTestData nếu không có answers được truyền vào
    if (!answers && currentTestData) {
        answers = {};
        currentTestData.parts.forEach(part => {
            part.data.forEach(q => {
                answers[q.id] = q.answer;
            });
        });
    }
    
    if (partId) {
        const scope = document.getElementById(partId);
        
        // Xóa kết quả cũ nếu có
        const oldPartResult = scope.querySelector('.part-result');
        if (oldPartResult) {
            oldPartResult.remove();
        }
        
        const questionElements = scope.querySelectorAll('.question-group');
        questionElements.forEach(qEl => {
            const input = qEl.querySelector('input, select');
            if (!input) return;
            const qId = input.name;
            if (answers[qId] === undefined) return;

            const correctAnswer = answers[qId];
            let userAnswer = null;
            if (input.type === 'radio') {
                const checkedEl = qEl.querySelector(`[name="${qId}"]:checked`);
                if (checkedEl) userAnswer = checkedEl.value.trim();
            } else {
                userAnswer = input.value.trim();
            }
            const feedbackSpan = qEl.querySelector('.feedback');
            if (userAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                feedbackSpan.textContent = '✔️ Đúng';
                feedbackSpan.className = 'feedback correct';
                totalCorrect++;
            } else {
                feedbackSpan.textContent = `❌ Sai. Đáp án: "${correctAnswer}"`;
                feedbackSpan.className = 'feedback incorrect';
            }
            totalQuestions++;
        });
        
        // Hiển thị kết quả cho từng part
        const partResult = document.createElement('div');
        partResult.className = 'part-result';
        partResult.textContent = `Task ${partId.replace('part_', '')}: ${totalCorrect}/${totalQuestions} câu đúng`;
        partResult.style.cssText = 'margin-top: 10px; padding: 5px; background-color: #f0f0f0; border-radius: 4px; text-align: center;';
        scope.appendChild(partResult);
        
    } else {
        // Nộp toàn bài: duyệt tất cả các part và câu hỏi
        
        // Xóa tất cả kết quả cũ
        document.querySelectorAll('.part-result').forEach(result => result.remove());
        
        const allQuestionEls = document.querySelectorAll('.question-group');
        allQuestionEls.forEach(qEl => {
            const input = qEl.querySelector('input, select');
            if (!input) return;
            const qId = input.name;
            if (answers[qId] === undefined) return;

            const correctAnswer = answers[qId];
            let userAnswer = null;
            if (input.type === 'radio') {
                const checkedEl = qEl.querySelector(`[name="${qId}"]:checked`);
                if (checkedEl) userAnswer = checkedEl.value.trim();
            } else {
                userAnswer = input.value.trim();
            }
            const feedbackSpan = qEl.querySelector('.feedback');
            if (userAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                feedbackSpan.textContent = '✔️ Đúng';
                feedbackSpan.className = 'feedback correct';
                totalCorrect++;
            } else {
                feedbackSpan.textContent = `❌ Sai. Đáp án: "${correctAnswer}"`;
                feedbackSpan.className = 'feedback incorrect';
            }
            totalQuestions++;
        });
        const finalResult = document.getElementById('finalResult');
        finalResult.textContent = `Kết quả: Bạn đã trả lời đúng ${totalCorrect} / ${totalQuestions} câu.`;
        finalResult.className = 'result ' + ((totalQuestions > 0 && totalCorrect / totalQuestions > 0.6) ? 'correct' : 'incorrect');
    }
    
    return { correct: totalCorrect, total: totalQuestions };
}

function disableListeningTaskInputs(partId) {
    const scope = document.getElementById(partId);
    if (!scope) return;

    const inputs = scope.querySelectorAll('select, input[type="text"], input[type="radio"]');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.6';
        input.style.cursor = 'not-allowed';
    });
}
