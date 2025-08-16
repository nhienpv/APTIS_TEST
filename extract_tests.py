#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
from bs4 import BeautifulSoup
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

def extract_task1(soup, test_section):
    """Trích xuất Task 1 - Fill in the blanks"""
    task1 = {
        "title": "Task 1: Read the email from a person to his/her friend.",
        "instruction": "Choose one word from the list for each gap.",
        "questions": []
    }
    
    # Tìm tất cả các câu hỏi trong task 1
    questions = test_section.find_all('p', style=lambda x: x and 'background-color:#f9fafb' in x)
    
    for i, question in enumerate(questions):
        text = clean_text(question.get_text())
        if not text or 'Correct answer:' in text:
            continue
            
        # Tìm các option trong select
        select = question.find('select')
        if select:
            options = []
            for option in select.find_all('option'):
                opt_text = clean_text(option.get_text())
                if opt_text and opt_text != "...":
                    options.append(opt_text)
            
            if options:
                # Tách câu thành before, after
                parts = text.split('...')
                if len(parts) >= 2:
                    task1["questions"].append({
                        "before": parts[0].strip(),
                        "options": options,
                        "after": parts[1].strip()
                    })
    
    return task1

def extract_task2(soup, test_section):
    """Trích xuất Task 2 - Sentence ordering"""
    task2 = {
        "title": "Task 2: Put the sentences in the right order.",
        "sentences": []
    }
    
    # Tìm phần "Correct answer:" và các câu theo sau
    correct_section = test_section.find('p', string=lambda x: x and 'Correct answer:' in x)
    if correct_section:
        sentences = []
        current = correct_section.find_next_sibling()
        while current and current.name == 'p':
            text = clean_text(current.get_text())
            if text.startswith(('1.', '2.', '3.', '4.', '5.', '6.')):
                # Loại bỏ số thứ tự
                sentence_text = re.sub(r'^\d+\.\s*', '', text)
                sentences.append(sentence_text)
            current = current.find_next_sibling()
        
        # Tạo sentences với order
        for i, sentence in enumerate(sentences, 1):
            task2["sentences"].append({
                "order": i,
                "text": sentence
            })
    
    return task2

def extract_task3(soup, test_section):
    """Trích xuất Task 3 - Sentence ordering"""
    task3 = {
        "title": "Task 3: Put the sentences below in the right order.",
        "sentences": []
    }
    
    # Tìm phần "Correct answer:" và các câu theo sau
    correct_section = test_section.find('p', string=lambda x: x and 'Correct answer:' in x)
    if correct_section:
        sentences = []
        current = correct_section.find_next_sibling()
        while current and current.name == 'p':
            text = clean_text(current.get_text())
            if text.startswith(('1.', '2.', '3.', '4.', '5.', '6.')):
                # Loại bỏ số thứ tự
                sentence_text = re.sub(r'^\d+\.\s*', '', text)
                sentences.append(sentence_text)
            current = current.find_next_sibling()
        
        # Tạo sentences với order
        for i, sentence in enumerate(sentences, 1):
            task3["sentences"].append({
                "order": i,
                "text": sentence
            })
    
    return task3

def extract_task4(soup, test_section):
    """Trích xuất Task 4 - Multiple choice questions"""
    task4 = {
        "title": "Task 4: Four people respond...",
        "readingTextParts": [],
        "questions": []
    }
    
    # Tìm các phần text của 4 người (A, B, C, D)
    current = test_section
    while current:
        if current.name == 'p' and current.get_text().strip() in ['A', 'B', 'C', 'D']:
            person = current.get_text().strip()
            # Tìm text của người này
            text_p = current.find_next_sibling('p')
            if text_p:
                text = clean_text(text_p.get_text())
                task4["readingTextParts"].append({
                    "person": person,
                    "text": text
                })
        current = current.find_next_sibling()
    
    # Tìm các câu hỏi
    questions = test_section.find_all('p', style=lambda x: x and 'background-color:#f9fafb' in x)
    for i, question in enumerate(questions):
        text = clean_text(question.get_text())
        if text.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.')):
            # Loại bỏ số thứ tự
            question_text = re.sub(r'^\d+\.\s*', '', text)
            # Tìm đáp án đúng
            correct_answer = None
            next_p = question.find_next_sibling('p')
            if next_p:
                correct_text = clean_text(next_p.get_text())
                if 'Correct answer:' in correct_text:
                    correct_answer = correct_text.split('Correct answer:')[-1].strip()
            
            task4["questions"].append({
                "name": f"q4_{i+1}",
                "text": question_text
            })
    
    return task4

def extract_task5(soup, test_section):
    """Trích xuất Task 5 - Heading matching"""
    task5 = {
        "title": "Task 5: Choose a heading for each numbered paragraph (1–7).",
        "topic": "",
        "options": [],
        "answers": []
    }
    
    # Tìm topic
    topic_p = test_section.find('p', style=lambda x: x and 'border:0.75pt solid #e5e7eb' in x)
    if topic_p:
        task5["topic"] = clean_text(topic_p.get_text())
    
    # Tìm các options
    options = []
    answers = []
    
    # Tìm tất cả các select trong task 5
    selects = test_section.find_all('select')
    for select in selects:
        select_options = []
        for option in select.find_all('option'):
            opt_text = clean_text(option.get_text())
            if opt_text and opt_text != "":
                select_options.append(opt_text)
        
        if select_options:
            options.extend(select_options)
            
            # Tìm đáp án đúng
            next_p = select.find_next_sibling('p')
            if next_p:
                correct_text = clean_text(next_p.get_text())
                if 'Correct answer:' in correct_text:
                    answer = correct_text.split('Correct answer:')[-1].strip()
                    answers.append(answer)
    
    # Loại bỏ duplicates
    task5["options"] = list(dict.fromkeys(options))
    task5["answers"] = answers
    
    return task5

def extract_answers(test_section):
    """Trích xuất đáp án cho tất cả các task"""
    answers = {
        "task1": {},
        "task2_order": [],
        "task3_order": [],
        "task4": {},
        "task5": {}
    }
    
    # Task 1 answers
    task1_questions = test_section.find_all('p', style=lambda x: x and 'background-color:#f9fafb' in x)
    for i, question in enumerate(task1_questions):
        select = question.find('select')
        if select:
            selected_option = select.find('option', selected=True)
            if selected_option:
                answer = clean_text(selected_option.get_text())
                answers["task1"][f"q1_{i+1}"] = answer
    
    # Task 2 & 3 answers (order)
    # Đây sẽ được tính toán từ sentences đã được sắp xếp
    
    # Task 4 answers
    task4_questions = test_section.find_all('p', style=lambda x: x and 'background-color:#f9fafb' in x)
    for i, question in enumerate(task4_questions):
        text = clean_text(question.get_text())
        if text.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.')):
            next_p = question.find_next_sibling('p')
            if next_p:
                correct_text = clean_text(next_p.get_text())
                if 'Correct answer:' in correct_text:
                    answer = correct_text.split('Correct answer:')[-1].strip()
                    answers["task4"][f"q4_{i+1}"] = answer
    
    # Task 5 answers
    task5_selects = test_section.find_all('select')
    for i, select in enumerate(task5_selects):
        next_p = select.find_next_sibling('p')
        if next_p:
            correct_text = clean_text(next_p.get_text())
            if 'Correct answer:' in correct_text:
                answer = correct_text.split('Correct answer:')[-1].strip()
                answers["task5"][f"q5_{i+1}"] = answer
    
    return answers

def extract_test_from_html(html_content):
    """Trích xuất một bài test từ HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Tìm tất cả các test sections
    test_sections = []
    current_section = None
    
    for element in soup.find_all(['p', 'div']):
        if element.name == 'p' and 'KEY TEST' in element.get_text():
            if current_section:
                test_sections.append(current_section)
            current_section = []
        elif current_section is not None:
            current_section.append(element)
    
    if current_section:
        test_sections.append(current_section)
    
    tests = {}
    
    for i, section in enumerate(test_sections, 1):
        test_key = f"TEST_{i}"
        test_data = {
            "title": f"Bài Luyện Tập Reading - Test {i}",
            "task1": extract_task1(soup, section),
            "task2": extract_task2(soup, section),
            "task3": extract_task3(soup, section),
            "task4": extract_task4(soup, section),
            "task5": extract_task5(soup, section),
            "answers": extract_answers(section)
        }
        tests[test_key] = test_data
    
    return tests

def main():
    # Đọc file HTML
    with open('reading.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Trích xuất các test
    tests = extract_test_from_html(html_content)
    
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

if __name__ == "__main__":
    main()
