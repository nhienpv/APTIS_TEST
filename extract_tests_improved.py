#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
import html

def clean_text(text):
    """Làm sạch text từ HTML"""
    if not text:
        return ""
    # Loại bỏ HTML entities
    text = html.unescape(text)
    # Loại bỏ các ký tự đặc biệt
    text = re.sub(r'&#xa0;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_task1_from_text(text):
    """Trích xuất Task 1 từ text"""
    task1 = {
        "title": "Task 1: Read the email from a person to his/her friend.",
        "instruction": "Choose one word from the list for each gap.",
        "questions": []
    }
    
    # Tìm các câu hỏi có select
    lines = text.split('\n')
    for line in lines:
        if '<SELECT>' in line and 'background-color:#f9fafb' in line:
            # Tìm options trong select
            option_pattern = r'<OPTION[^>]*>([^<]+)</OPTION>'
            options = re.findall(option_pattern, line)
            options = [clean_text(opt) for opt in options if clean_text(opt) and clean_text(opt) != "..."]
            
            if options:
                # Tách câu thành before, after
                parts = line.split('...')
                if len(parts) >= 2:
                    before = clean_text(parts[0])
                    after = clean_text(parts[1])
                    if before and after:
                        task1["questions"].append({
                            "before": before,
                            "options": options,
                            "after": after
                        })
    
    return task1

def extract_task2_from_text(text):
    """Trích xuất Task 2 từ text"""
    task2 = {
        "title": "Task 2: Put the sentences in the right order.",
        "sentences": []
    }
    
    # Tìm phần "Correct answer:" và các câu theo sau
    lines = text.split('\n')
    in_correct_section = False
    sentences = []
    
    for line in lines:
        if 'Correct answer:' in line and 'background-color:#f9fafb' in line:
            in_correct_section = True
            continue
        elif in_correct_section:
            line = clean_text(line)
            if line.startswith(('1.', '2.', '3.', '4.', '5.', '6.')) and 'background-color:#f9fafb' in line:
                # Loại bỏ số thứ tự
                sentence_text = re.sub(r'^\d+\.\s*', '', line)
                if sentence_text:
                    sentences.append(sentence_text)
            elif line and not line.startswith(('Question', 'Put the sentences')):
                # Kết thúc phần correct answer
                break
    
    # Tạo sentences với order
    for i, sentence in enumerate(sentences, 1):
        task2["sentences"].append({
            "order": i,
            "text": sentence
        })
    
    return task2

def extract_task3_from_text(text):
    """Trích xuất Task 3 từ text"""
    task3 = {
        "title": "Task 3: Put the sentences below in the right order.",
        "sentences": []
    }
    
    # Tương tự task 2
    return extract_task2_from_text(text)

def extract_task4_from_text(text):
    """Trích xuất Task 4 từ text"""
    task4 = {
        "title": "Task 4: Four people respond...",
        "readingTextParts": [],
        "questions": []
    }
    
    lines = text.split('\n')
    current_person = None
    
    for line in lines:
        line_clean = clean_text(line)
        if line_clean in ['A', 'B', 'C', 'D'] and 'background-color:#f9fafb' in line:
            current_person = line_clean
        elif current_person and line and 'background-color:#f9fafb' in line and not line_clean.startswith(('Question', 'Four people', 'Correct answer')):
            # Đây là text của người hiện tại
            task4["readingTextParts"].append({
                "person": current_person,
                "text": line_clean
            })
            current_person = None
    
    # Tìm các câu hỏi
    for line in lines:
        line_clean = clean_text(line)
        if line_clean.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.')) and 'background-color:#f9fafb' in line:
            question_text = re.sub(r'^\d+\.\s*', '', line_clean)
            if question_text:
                task4["questions"].append({
                    "name": f"q4_{len(task4['questions'])+1}",
                    "text": question_text
                })
    
    return task4

def extract_task5_from_text(text):
    """Trích xuất Task 5 từ text"""
    task5 = {
        "title": "Task 5: Choose a heading for each numbered paragraph (1–7).",
        "topic": "",
        "options": [],
        "answers": []
    }
    
    lines = text.split('\n')
    
    # Tìm topic
    for line in lines:
        line_clean = clean_text(line)
        if line_clean and 'border:0.75pt solid #e5e7eb' in line and 'background-color:#f9fafb' in line:
            task5["topic"] = line_clean
            break
    
    # Tìm các options từ select
    option_pattern = r'<OPTION[^>]*>([^<]+)</OPTION>'
    options = re.findall(option_pattern, text)
    options = [clean_text(opt) for opt in options if clean_text(opt) and clean_text(opt) != ""]
    task5["options"] = list(dict.fromkeys(options))
    
    # Tìm đáp án đúng
    for line in lines:
        if 'Correct answer:' in line and 'background-color:#f9fafb' in line:
            answer = line.split('Correct answer:')[-1].strip()
            if answer:
                task5["answers"].append(answer)
    
    return task5

def extract_answers_from_text(text):
    """Trích xuất đáp án từ text"""
    answers = {
        "task1": {},
        "task2_order": [],
        "task3_order": [],
        "task4": {},
        "task5": {}
    }
    
    lines = text.split('\n')
    
    # Task 1 answers - tìm selected options
    selected_pattern = r'<OPTION SELECTED[^>]*>([^<]+)</OPTION>'
    selected_options = re.findall(selected_pattern, text)
    for i, option in enumerate(selected_options):
        answers["task1"][f"q1_{i+1}"] = clean_text(option)
    
    # Task 4 answers
    question_count = 0
    for line in lines:
        if 'Correct answer:' in line and 'background-color:#f9fafb' in line:
            answer = line.split('Correct answer:')[-1].strip()
            if answer in ['A', 'B', 'C', 'D']:
                question_count += 1
                answers["task4"][f"q4_{question_count}"] = answer
    
    # Task 5 answers
    task5_answers = []
    for line in lines:
        if 'Correct answer:' in line and 'background-color:#f9fafb' in line:
            answer = line.split('Correct answer:')[-1].strip()
            if answer and answer not in ['A', 'B', 'C', 'D']:
                task5_answers.append(answer)
    
    for i, answer in enumerate(task5_answers):
        answers["task5"][f"q5_{i+1}"] = answer
    
    return answers

def extract_tests_from_html(html_content):
    """Trích xuất các bài test từ HTML content"""
    # Tách các test sections
    test_sections = re.split(r'KEY TEST \d+', html_content)
    
    tests = {}
    
    for i, section in enumerate(test_sections[1:], 1):  # Bỏ qua phần đầu
        test_key = f"TEST_{i}"
        
        try:
            test_data = {
                "title": f"Bài Luyện Tập Reading - Test {i}",
                "task1": extract_task1_from_text(section),
                "task2": extract_task2_from_text(section),
                "task3": extract_task3_from_text(section),
                "task4": extract_task4_from_text(section),
                "task5": extract_task5_from_text(section),
                "answers": extract_answers_from_text(section)
            }
            tests[test_key] = test_data
        except Exception as e:
            print(f"Lỗi khi xử lý TEST_{i}: {e}")
            continue
    
    return tests

def main():
    # Đọc file HTML
    try:
        with open('reading.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print("Không tìm thấy file reading.html")
        return
    
    # Trích xuất các test
    tests = extract_tests_from_html(html_content)
    
    # Đọc file JSON hiện tại
    try:
        with open('reading_tests.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except FileNotFoundError:
        existing_data = {}
    
    # Cập nhật với dữ liệu mới
    existing_data.update(tests)
    
    # Ghi lại file JSON
    with open('reading_tests.json', 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)
    
    print(f"Đã cập nhật {len(tests)} bài test vào reading_tests.json")
    
    # In thông tin chi tiết
    for test_key, test_data in tests.items():
        print(f"\n{test_key}:")
        print(f"  Task 1: {len(test_data['task1']['questions'])} câu hỏi")
        print(f"  Task 2: {len(test_data['task2']['sentences'])} câu")
        print(f"  Task 3: {len(test_data['task3']['sentences'])} câu")
        print(f"  Task 4: {len(test_data['task4']['readingTextParts'])} người, {len(test_data['task4']['questions'])} câu hỏi")
        print(f"  Task 5: {len(test_data['task5']['options'])} options, {len(test_data['task5']['answers'])} đáp án")

if __name__ == "__main__":
    main()
